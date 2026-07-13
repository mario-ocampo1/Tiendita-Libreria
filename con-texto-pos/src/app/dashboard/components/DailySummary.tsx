interface DailySummaryProps {
  totalSales: number;
  confirmedSales: number;
  averageTicket: number;
  estimatedProfit: number;
  profitMargin: number;
}

export default function DailySummary({
  totalSales,
  confirmedSales,
  averageTicket,
  estimatedProfit,
  profitMargin,
}: DailySummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Ventas del día */}
      <div className="bg-emerald-700 text-white rounded-2xl p-6">
        <p className="text-sm opacity-90 mb-2">Ventas del día</p>
        <p className="text-3xl font-bold">${totalSales.toFixed(2)}</p>
        <p className="text-xs opacity-75 mt-2">{confirmedSales} ventas cobradas</p>
      </div>

      {/* Ventas realizadas */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <p className="text-sm text-gray-600 mb-2">Ventas realizadas</p>
        <p className="text-3xl font-bold text-gray-900">{confirmedSales}</p>
        <p className="text-xs text-gray-500 mt-2">confirmadas hoy</p>
      </div>

      {/* Ticket promedio */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <p className="text-sm text-gray-600 mb-2">Ticket promedio</p>
        <p className="text-3xl font-bold text-gray-900">${averageTicket.toFixed(2)}</p>
        <p className="text-xs text-gray-500 mt-2">por venta pagada</p>
      </div>

      {/* Ganancia estimada */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <p className="text-sm text-gray-600 mb-2">Ganancia estimada</p>
        <p className="text-3xl font-bold text-emerald-600">${estimatedProfit.toFixed(2)}</p>
        <p className="text-xs text-gray-500 mt-2">margen aprox. {profitMargin}%</p>
      </div>
    </div>
  );
}
