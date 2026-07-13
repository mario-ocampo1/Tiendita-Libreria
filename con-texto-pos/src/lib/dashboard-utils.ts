// Tipos para el dashboard
export interface DashboardStats {
  totalSales: number;
  confirmedSales: number;
  averageTicket: number;
  estimatedProfit: number;
  profitMargin: number;
}

export interface PaymentMethodData {
  name: string;
  amount: number;
  count: number;
}

export interface AlertData {
  id: string;
  title: string;
  count: number;
  urgency: 'high' | 'medium';
  action: string;
}

// Calculadores de estadísticas
export function calculateAverageTicket(
  totalSales: number,
  salesCount: number
): number {
  if (salesCount === 0) return 0;
  return totalSales / salesCount;
}

export function calculateProfit(
  totalSales: number,
  profitMarginPercentage: number
): number {
  return (totalSales * profitMarginPercentage) / 100;
}

// Formatos
export function formatCurrency(value: number): string {
  return `$${value.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}
