import { createClient } from '@/core/supabase/server';
import type { DashboardStats, PaymentMethodData, AlertData } from './dashboard-utils';

// Obtiene estadísticas del día actual
// TODO: Conectar con tablas reales de ventas en Supabase
export async function getDailyStats(): Promise<DashboardStats> {
  try {
    // Por ahora, devuelve datos de ejemplo
    // En producción, esto hará queries a Supabase
    return {
      totalSales: 0,
      confirmedSales: 0,
      averageTicket: 0,
      estimatedProfit: 0,
      profitMargin: 38,
    };
  } catch (error) {
    console.error('Error fetching daily stats:', error);
    return {
      totalSales: 0,
      confirmedSales: 0,
      averageTicket: 0,
      estimatedProfit: 0,
      profitMargin: 38,
    };
  }
}

// Obtiene métodos de pago utilizados hoy
// TODO: Conectar con tabla de transacciones de Supabase
export async function getPaymentMethods(): Promise<{
  methods: PaymentMethodData[];
  totalCollected: number;
}> {
  try {
    // Por ahora, devuelve datos de ejemplo
    return {
      methods: [],
      totalCollected: 0,
    };
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return {
      methods: [],
      totalCollected: 0,
    };
  }
}

// Obtiene alertas de productos por vencer y stock bajo
// TODO: Conectar con tablas de inventario y productos de Supabase
export async function getAlerts(): Promise<AlertData[]> {
  try {
    // Por ahora, devuelve un array vacío
    return [];
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return [];
  }
}

// Obtiene todos los datos del dashboard
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
