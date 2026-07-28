'use server';
import { createClient } from '@/core/supabase/server';
export async function obtenerSesionAbierta(usuarioId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('caja_sesiones')
    .select('*')
    .eq('usuario_id', usuarioId)  // este ya es el id interno ✓
    .is('cierre', null)
    .order('apertura', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}
export async function abrirCaja(usuarioId: string, montoInicial: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('caja_sesiones')
    .insert({ usuario_id: usuarioId, monto_inicial: montoInicial, apertura: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function cerrarCaja(sesionId: string, montoFinal: number, montoEsperado: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('caja_sesiones')
    .update({
      monto_final: montoFinal,
      diferencia: montoFinal - montoEsperado,
      cierre: new Date().toISOString(),
    })
    .eq('id', sesionId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function buscarProductoPorCodigo(codigo: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('productos')
    .select('id, nombre, precio_venta, stock_actual, codigo_barras, tasa_iva')
    .eq('codigo_barras', codigo)
    .eq('activo', true)
    .maybeSingle();
  if (error) throw error;
  return data;
}

type ItemVenta = { producto_id: string; cantidad: number; precio_unitario: number };

export async function registrarVenta(params: {
  usuarioId: string;
  cajaSesionId: string;
  clienteId?: string | null;
  metodoPago: string;
  descuento: number;
  items: ItemVenta[];
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('registrar_venta', {
    p_usuario_id: params.usuarioId,
    p_caja_sesion_id: params.cajaSesionId,
    p_cliente_id: params.clienteId ?? null,
    p_metodo_pago: params.metodoPago,
    p_descuento: params.descuento,
    p_items: params.items,
  });
  if (error) throw error;
  return data as string; // id de la venta creada
}

export async function obtenerVentasDeSesion(cajaSesionId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('ventas')
    .select('id, numero_ticket, total, metodo_pago, created_at, estado')
    .eq('caja_sesion_id', cajaSesionId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
export async function obtenerUsuarioInterno(authId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nombre, rol')
    .eq('auth_id', authId)
    .single();
  if (error) throw error;
  return data;
}
