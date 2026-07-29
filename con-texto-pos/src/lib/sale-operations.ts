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

  // 2. Intentar sincronizar ya mismo
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