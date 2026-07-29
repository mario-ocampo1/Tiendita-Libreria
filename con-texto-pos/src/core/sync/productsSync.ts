import { createClient } from '@/core/supabase/client';
import { localDb, type LocalProduct, type SyncQueueItem } from '@/core/db/dexie';

/**
 * DESCARGA (PULL): Trae todos los productos de Supabase y los guarda directamente en Dexie.
 * Solo tiene sentido con conexión; si falla (por estar offline), no rompe nada más.
 */
export async function syncProductsFromSupabase() {
  const supabase = createClient();

  try {
    const { data: supabaseProducts, error } = await supabase
      .from('productos')
      .select('id, codigo_barras, nombre, precio_venta, stock_actual, updated_at');

    if (error) throw error;

    if (supabaseProducts && supabaseProducts.length > 0) {
      await localDb.products.bulkPut(supabaseProducts as LocalProduct[]);
      console.log(`✅ ${supabaseProducts.length} productos sincronizados localmente.`);
    }

    return { success: true, count: supabaseProducts?.length || 0 };
  } catch (error) {
    console.error('Error sincronizando productos (probablemente sin conexión):', error);
    return { success: false, error };
  }
}

/**
 * Encola una operación (create/update) para reintentar más tarde contra Supabase.
 */
async function enqueue(entry: Omit<SyncQueueItem, 'id' | 'status' | 'created_at'>) {
  await localDb.syncQueue.put({
    ...entry,
    id: crypto.randomUUID(),
    status: 'pending',
    created_at: new Date().toISOString(),
  });
}

/**
 * CREACIÓN (offline-first):
 * 1. Genera el id localmente (uuid) para no depender de la respuesta de Supabase.
 * 2. Guarda inmediatamente en Dexie con pending_sync = true.
 * 3. Intenta pushear a Supabase. Si funciona, marca como sincronizado.
 *    Si falla (sin conexión, etc.), lo deja en la cola para reintentar después.
 */
export async function createProduct(
  productData: Omit<LocalProduct, 'id' | 'updated_at' | 'pending_sync'>
) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const localProduct: LocalProduct = {
    ...productData,
    id,
    updated_at: now,
    pending_sync: true,
  };

  // 1. Escritura local inmediata (optimista) — la UI ya puede mostrar el producto.
  await localDb.products.put(localProduct);

  // 2. Encolar por si el push de abajo falla.
  await enqueue({ entity: 'productos', entity_id: id, operation: 'create', payload: { id, ...productData } });

  // 3. Intentar pushear ya mismo.
  const pushed = await pushProductToSupabase(id, 'create', { id, ...productData });

  return { success: true, product: pushed ?? localProduct, offline: !pushed };
}

/**
 * ACTUALIZACIÓN (offline-first): mismo patrón que createProduct.
 */
export async function updateProduct(
  id: LocalProduct['id'],
  productData: Omit<LocalProduct, 'id' | 'updated_at' | 'pending_sync'>
) {
  const now = new Date().toISOString();

  const existing = await localDb.products.get(id);
  const localProduct: LocalProduct = {
    ...(existing as LocalProduct),
    ...productData,
    id,
    updated_at: now,
    pending_sync: true,
  };

  // 1. Escritura local inmediata.
  await localDb.products.put(localProduct);

  // 2. Encolar.
  await enqueue({ entity: 'productos', entity_id: id, operation: 'update', payload: productData });

  // 3. Intentar pushear ya mismo.
  const pushed = await pushProductToSupabase(id, 'update', productData);

  return { success: true, product: pushed ?? localProduct, offline: !pushed };
}

/**
 * ELIMINACIÓN (offline-first):
 * 1. Borra inmediatamente de Dexie (la UI deja de mostrarlo al toque).
 * 2. Encola la eliminación por si el dispositivo está sin conexión.
 * 3. Intenta borrarlo ya mismo en Supabase.
 */
export async function deleteProduct(id: LocalProduct['id']) {
  // 1. Borrado local inmediato (optimista).
  await localDb.products.delete(id);

  // 2. Encolar por si el paso 3 falla.
  await enqueue({ entity: 'productos', entity_id: id, operation: 'delete', payload: { id } });

  // 3. Intentar borrar ya mismo.
  const deleted = await pushProductDeleteToSupabase(id);

  return { success: true, offline: !deleted };
}

/**
 * Intenta escribir una operación puntual (create/update) en Supabase.
 * Devuelve el producto actualizado si tuvo éxito, o null si falló (quedó pendiente en la cola).
 */
async function pushProductToSupabase(
  id: string,
  operation: 'create' | 'update',
  payload: Record<string, unknown>
): Promise<LocalProduct | null> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return null; // ni lo intentamos, ahorramos el timeout
  }

  const supabase = createClient();

  try {
    const query =
      operation === 'create'
        ? supabase.from('productos').insert([payload]).select().single()
        : supabase.from('productos').update(payload).eq('id', id).select().single();

    const { data, error } = await query;
    if (error) throw error;

    const synced: LocalProduct = { ...(data as LocalProduct), pending_sync: false };
    await localDb.products.put(synced);
    await localDb.syncQueue.where({ entity_id: id, status: 'pending' }).delete();

    return synced;
  } catch (error) {
    console.warn(`No se pudo sincronizar producto ${id} (queda pendiente):`, error);
    return null;
  }
}

/**
 * Intenta ejecutar el delete puntual en Supabase.
 * Devuelve true si tuvo éxito, false si falló (queda pendiente en la cola).
 */
async function pushProductDeleteToSupabase(id: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false;
  }

  const supabase = createClient();

  try {
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (error) throw error;

    await localDb.syncQueue.where({ entity_id: id, status: 'pending' }).delete();
    return true;
  } catch (error) {
    console.warn(`No se pudo eliminar producto ${id} en Supabase (queda pendiente):`, error);
    return false;
  }
}

/**
 * Recorre la cola y reintenta cada operación pendiente.
 * Llamar esto al reconectar (evento 'online') o con un intervalo/botón manual de "Sincronizar".
 */
export async function processSyncQueue() {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { success: false, processed: 0, reason: 'offline' };
  }

  const pending = await localDb.syncQueue.where('status').equals('pending').toArray();
  let processed = 0;

  for (const item of pending) {
    if (item.entity !== 'productos') continue;

    await localDb.syncQueue.update(item.id, { status: 'syncing' });

    const ok =
      item.operation === 'delete'
        ? await pushProductDeleteToSupabase(item.entity_id)
        : await pushProductToSupabase(item.entity_id, item.operation, item.payload);

    if (ok) {
      processed++;
    } else {
      await localDb.syncQueue.update(item.id, { status: 'failed' });
    }
  }

  return { success: true, processed, total: pending.length };
}
