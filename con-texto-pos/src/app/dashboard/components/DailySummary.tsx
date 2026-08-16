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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

      {/* Ventas del día — Tarjeta Primaria Destacada */}
      <div className="md-card-primary flex flex-col justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider opacity-85 mb-2">Ventas del día</p>
          <p className="text-3xl font-bold font-mono tracking-tight leading-tight">
            ${totalSales.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <p className="text-xs opacity-80 mt-4 font-medium">
          {confirmedSales} {confirmedSales === 1 ? 'operación cobrada' : 'operaciones cobradas'}
        </p>
      </div>

      {/* Ventas realizadas */}
      <div className="md-card flex flex-col justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ventas realizadas</p>
          <p className="text-2xl font-bold text-blue-900 font-mono">
            {confirmedSales}
          </p>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          confirmadas hoy
        </p>
      </div>

      {/* Ticket promedio */}
      <div className="md-card flex flex-col justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ticket promedio</p>
          <p className="text-2xl font-bold text-blue-900 font-mono">
            ${averageTicket.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          por venta cobrada
        </p>
      </div>

      {/* Ganancia estimada */}
      <div className="md-card-container flex flex-col justify-between">
        <div>
          <p className="text-xs font-semibold text-blue-900/80 uppercase tracking-wider mb-2">Ganancia estimada</p>
          <p className="text-2xl font-bold text-blue-900 font-mono">
            ${estimatedProfit.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <p className="text-xs text-blue-800/70 mt-4 font-medium">
          margen aprox. {profitMargin}%
        </p>
      </div>

    </div>
  );
}

