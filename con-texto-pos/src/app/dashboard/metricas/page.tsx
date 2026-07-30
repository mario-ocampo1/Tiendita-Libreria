import { redirect } from 'next/navigation';
import { createClient } from '@/core/supabase/server';
import MetricasClient, { type ProductoEstadistica } from './components/MetricasClient';

export const dynamic = 'force-dynamic';

export default async function MetricasPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    redirect('/auth/login');
  }

  const hoy = new Date();
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59);

  const mesNombre = hoy.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });

  // 1. Obtener ventas confirmadas del mes
  const { data: ventas } = await supabase
    .from('ventas')
    .select('id, total, created_at')
    .gte('created_at', inicioMes.toISOString())
    .lte('created_at', finMes.toISOString())
    .eq('estado', 'confirmada');

  const totalVentasMes = ventas?.reduce((acc, v) => acc + (Number(v.total) || 0), 0) || 0;
  const cantidadVentasMes = ventas?.length || 0;
  const ticketPromedioMes = cantidadVentasMes > 0 ? totalVentasMes / cantidadVentasMes : 0;

  // 2. Obtener detalles de ventas para ranking de productos
  const ventaIds = ventas?.map((v) => v.id) || [];
  let productosMasVendidos: ProductoEstadistica[] = [];
  let sugerenciasReposicion: ProductoEstadistica[] = [];

  if (ventaIds.length > 0) {
    const { data: detalles } = await supabase
      .from('venta_detalles')
      .select('producto_id, cantidad, subtotal, productos(id, nombre, codigo_barras, stock_actual, stock_minimo)')
      .in('venta_id', ventaIds);

    const acumulador: Record<string, ProductoEstadistica> = {};

    if (detalles) {
      for (const d of detalles) {
        const prod = (d as any).productos;
        if (!prod) continue;

        if (!acumulador[prod.id]) {
          acumulador[prod.id] = {
            id: prod.id,
            nombre: prod.nombre,
            codigo_barras: prod.codigo_barras,
            cantidadVendida: 0,
            totalRecaudado: 0,
            stockActual: prod.stock_actual ?? 0,
            stockMinimo: prod.stock_minimo ?? 0,
            ritmoDiario: 0,
            diasStockRestantes: null,
          };
        }

        acumulador[prod.id].cantidadVendida += d.cantidad;
        acumulador[prod.id].totalRecaudado += Number(d.subtotal) || 0;
      }

      const diasTranscurridos = Math.max(1, hoy.getDate());
      const lista = Object.values(acumulador);

      // Calcular ritmos y días de stock
      for (const p of lista) {
        p.ritmoDiario = p.cantidadVendida / diasTranscurridos;
        if (p.ritmoDiario > 0) {
          p.diasStockRestantes = p.stockActual / p.ritmoDiario;
        }
      }

      // Más vendidos por cantidad
      productosMasVendidos = [...lista].sort((a, b) => b.cantidadVendida - a.cantidadVendida).slice(0, 15);

      // Sugerencias de reposición por días de stock restantes o bajo stock
      sugerenciasReposicion = [...lista]
        .filter((p) => p.diasStockRestantes !== null || p.stockActual <= p.stockMinimo)
        .sort((a, b) => (a.diasStockRestantes ?? 999) - (b.diasStockRestantes ?? 999))
        .slice(0, 15);
    }
  }

  return (
    <MetricasClient
      mesNombre={mesNombre}
      totalVentasMes={totalVentasMes}
      cantidadVentasMes={cantidadVentasMes}
      ticketPromedioMes={ticketPromedioMes}
      productosMasVendidos={productosMasVendidos}
      sugerenciasReposicion={sugerenciasReposicion}
    />
  );
}

