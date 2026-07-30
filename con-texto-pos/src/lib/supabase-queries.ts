import { createClient } from '@/core/supabase/server';
import type { DashboardStats, PaymentMethodData, AlertData } from './dashboard-utils';

export async function getDailyStats(): Promise<DashboardStats & { isCajaOpen: boolean }> {
  try {
    const supabase = await createClient();

    // Rango de tiempo para el día actual
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Obtener ventas del día de Supabase
    const { data: ventas, error: ventasError } = await supabase
      .from('ventas')
      .select('total, estado')
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString())
      .eq('estado', 'confirmada');

    // Verificar si hay caja abierta en Supabase
    const { data: sesionesAbiertas } = await supabase
      .from('caja_sesiones')
      .select('id')
      .is('cierre', null)
      .order('apertura', { ascending: false })
      .limit(1);

    const isCajaOpen = Array.isArray(sesionesAbiertas) && sesionesAbiertas.length > 0;

    if (ventasError || !ventas) {
      return {
        totalSales: 0,
        confirmedSales: 0,
        averageTicket: 0,
        estimatedProfit: 0,
        profitMargin: 38,
        isCajaOpen,
      };
    }

    const confirmedSales = ventas.length;
    const totalSales = ventas.reduce((sum, v) => sum + (Number(v.total) || 0), 0);
    const averageTicket = confirmedSales > 0 ? totalSales / confirmedSales : 0;
    const profitMargin = 38; // Margen promedio del negocio
    const estimatedProfit = (totalSales * profitMargin) / 100;

    return {
      totalSales,
      confirmedSales,
      averageTicket,
      estimatedProfit,
      profitMargin,
      isCajaOpen,
    };
  } catch (error) {
    console.error('Error fetching daily stats:', error);
    return {
      totalSales: 0,
      confirmedSales: 0,
      averageTicket: 0,
      estimatedProfit: 0,
      profitMargin: 38,
      isCajaOpen: false,
    };
  }
}

export async function getPaymentMethods(): Promise<{
  methods: PaymentMethodData[];
  totalCollected: number;
}> {
  try {
    const supabase = await createClient();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const { data: ventas, error } = await supabase
      .from('ventas')
      .select('metodo_pago, total')
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString())
      .eq('estado', 'confirmada');

    if (error || !ventas) {
      return { methods: [], totalCollected: 0 };
    }

    const mapaMetodos: Record<string, { name: string; amount: number; count: number }> = {
      efectivo: { name: 'Efectivo', amount: 0, count: 0 },
      tarjeta: { name: 'Tarjeta', amount: 0, count: 0 },
      transferencia: { name: 'Transferencia', amount: 0, count: 0 },
      mercado_pago: { name: 'Mercado Pago', amount: 0, count: 0 },
    };

    let totalCollected = 0;

    for (const v of ventas) {
      const monto = Number(v.total) || 0;
      totalCollected += monto;

      const clave = v.metodo_pago?.toLowerCase() || 'efectivo';
      if (!mapaMetodos[clave]) {
        mapaMetodos[clave] = {
          name: v.metodo_pago.charAt(0).toUpperCase() + v.metodo_pago.slice(1),
          amount: 0,
          count: 0,
        };
      }
      mapaMetodos[clave].amount += monto;
      mapaMetodos[clave].count += 1;
    }

    const methods = Object.values(mapaMetodos).filter((m) => m.count > 0);

    return {
      methods,
      totalCollected,
    };
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return { methods: [], totalCollected: 0 };
  }
}

export async function getAlerts(): Promise<AlertData[]> {
  try {
    const supabase = await createClient();

    // Productos con stock bajo (stock_actual <= stock_minimo)
    const { data: stockBajo, error } = await supabase
      .from('productos')
      .select('id, nombre, stock_actual, stock_minimo')
      .eq('activo', true);

    if (error || !stockBajo) return [];

    const conStockBajo = stockBajo.filter((p) => p.stock_actual <= p.stock_minimo);

    const alerts: AlertData[] = [];

    if (conStockBajo.length > 0) {
      alerts.push({
        id: 'stock-bajo',
        title: `${conStockBajo.length} producto${conStockBajo.length > 1 ? 's' : ''} con stock bajo o agotado`,
        count: conStockBajo.length,
        urgency: conStockBajo.some((p) => p.stock_actual <= 0) ? 'high' : 'medium',
        action: 'Revisar inventario y reposición',
      });
    }

    return alerts;
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return [];
  }
}

export async function getAllDashboardData() {
  const [stats, paymentData, alerts] = await Promise.all([
    getDailyStats(),
    getPaymentMethods(),
    getAlerts(),
  ]);

  return {
    ...stats,
    paymentMethods: paymentData.methods,
    alerts,
  };
}

