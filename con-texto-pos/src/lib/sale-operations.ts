import { createClient } from '@/core/supabase/client';
import { localDb, type PendingSale } from '@/core/db/dexie';

/**
 * Guarda la venta en Dexie y luego intenta sincronizar con Supabase.
 * Si no hay conexión, queda en 'pending' para sincronizar después.
 */
export async function registrarVentaOfflineFirst(venta: Omit<PendingSale, 'local_id' | 'status' | 'created_at'>): Promise<PendingSale> {
  const pendingSale: PendingSale = {
    ...venta,
    local_id: crypto.randomUUID(),
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  // 1. Guardar local inmediatamente
  await localDb.pendingSales.add(pendingSale);

  // 2. Descontar stock localmente en Dexie
  for (const item of venta.items) {
    const prod = await localDb.products.get(item.product_id);
    if (prod) {
      const nuevoStock = Math.max(0, prod.stock_actual - item.cantidad);
      await localDb.products.update(item.product_id, { stock_actual: nuevoStock });
    }
  }

  // 3. Intentar sincronizar ya mismo (el RPC registrar_venta en Supabase descuenta el stock en BD remota)
  await pushVentaToSupabase(pendingSale);

  return pendingSale;
}

/**
 * Intenta sincronizar una venta pendiente con Supabase.
 */
export async function pushVentaToSupabase(venta: PendingSale): Promise<boolean> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false;
  }

  const supabase = createClient();

  try {
    await localDb.pendingSales.update(venta.local_id, { status: 'syncing' });

    const { error } = await supabase.rpc('registrar_venta', {
      p_usuario_id: venta.usuario_id,
      p_caja_sesion_id: venta.caja_sesion_id,
      p_cliente_id: null,
      p_metodo_pago: venta.metodo_pago,
      p_descuento: venta.descuento,
      p_items: venta.items,
    });

    if (error) throw error;

    await localDb.pendingSales.update(venta.local_id, { status: 'synced' });
    return true;
  } catch (err) {
    console.warn('Venta no sincronizada, queda pendiente:', err);
    await localDb.pendingSales.update(venta.local_id, { status: 'failed' });
    return false;
  }
}

/**
 * Reintenta todas las ventas pendientes o fallidas.
 * Llamar al reconectar (evento 'online').
 */
export async function syncVentasPendientes(): Promise<{ procesadas: number; total: number }> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { procesadas: 0, total: 0 };
  }

  const pendientes = await localDb.pendingSales
    .where('status')
    .anyOf(['pending', 'failed'])
    .toArray();

  let procesadas = 0;

  for (const venta of pendientes) {
    const ok = await pushVentaToSupabase(venta);
    if (ok) procesadas++;
  }

  return { procesadas, total: pendientes.length };
}

/**
 * Busca un producto por código de barras primero en Dexie,
 * si no lo encuentra intenta Supabase y lo guarda localmente.
 */
export async function buscarProducto(codigoBarras: string) {
  // 1. Buscar local primero
  const local = await localDb.products
    .where('codigo_barras')
    .equals(codigoBarras)
    .first();

  if (local) return local;

  // 2. Si no está local, buscar en Supabase y guardar
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return null;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('productos')
    .select('id, codigo_barras, nombre, precio_venta, stock_actual, updated_at')
    .eq('codigo_barras', codigoBarras)
    .eq('activo', true)
    .maybeSingle();

  if (error || !data) return null;

  // Guardar en Dexie para la próxima vez
  await localDb.products.put(data);
  return data;
}

/**
 * Busca productos por nombre o código de barras (coincidencia parcial)
 */
export async function buscarProductosPorCoincidencia(query: string) {
  if (!query.trim()) return [];

  const q = query.trim().toLowerCase();

  // 1. Buscar coincidencia localmente en Dexie
  const locales = await localDb.products
    .filter((p) => Boolean((p.nombre && p.nombre.toLowerCase().includes(q)) || (p.codigo_barras && p.codigo_barras.toLowerCase().includes(q))))
    .toArray();

  if (locales.length > 0) return locales.slice(0, 10);

  // 2. Si no hay locales o faltan, consultar Supabase si hay conexión
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return locales;
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('productos')
      .select('id, codigo_barras, nombre, precio_venta, stock_actual, updated_at')
      .or(`nombre.ilike.%${query.trim()}%,codigo_barras.ilike.%${query.trim()}%`)
      .eq('activo', true)
      .limit(10);

    if (error || !data) return locales;

    // Guardar en Dexie los resultados encontrados
    for (const prod of data) {
      await localDb.products.put(prod);
    }
    return data;
  } catch {
    return locales;
  }
}