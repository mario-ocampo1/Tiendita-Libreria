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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>

      {/* Ventas del día — Filled Primary Card */}
      <div className="md-card-primary">
        <p style={{ fontSize: 'var(--md-label-large)', opacity: 0.85, marginBottom: 8 }}>Ventas del día</p>
        <p style={{ fontSize: 'var(--md-headline-medium)', fontWeight: 700, lineHeight: 1.1 }}>
          ${totalSales.toFixed(2)}
        </p>
        <p style={{ fontSize: 'var(--md-body-small)', opacity: 0.75, marginTop: 8 }}>
          {confirmedSales} ventas cobradas
        </p>
      </div>

      {/* Ventas realizadas — Elevated Card */}
      <div className="md-card" style={{ borderRadius: 'var(--md-shape-extra-large)' }}>
        <p style={{ fontSize: 'var(--md-label-large)', color: 'var(--md-on-surface-variant)', marginBottom: 8 }}>
          Ventas realizadas
        </p>
        <p style={{ fontSize: 'var(--md-headline-medium)', fontWeight: 700, color: 'var(--md-primary)' }}>
          {confirmedSales}
        </p>
        <p style={{ fontSize: 'var(--md-body-small)', color: 'var(--md-on-surface-variant)', marginTop: 8 }}>
          confirmadas hoy
        </p>
      </div>

      {/* Ticket promedio — Elevated Card */}
      <div className="md-card" style={{ borderRadius: 'var(--md-shape-extra-large)' }}>
        <p style={{ fontSize: 'var(--md-label-large)', color: 'var(--md-on-surface-variant)', marginBottom: 8 }}>
          Ticket promedio
        </p>
        <p style={{ fontSize: 'var(--md-headline-medium)', fontWeight: 700, color: 'var(--md-primary)' }}>
          ${averageTicket.toFixed(2)}
        </p>
        <p style={{ fontSize: 'var(--md-body-small)', color: 'var(--md-on-surface-variant)', marginTop: 8 }}>
          por venta pagada
        </p>
      </div>

      {/* Ganancia estimada — Container Card */}
      <div className="md-card-container" style={{ borderRadius: 'var(--md-shape-extra-large)' }}>
        <p style={{ fontSize: 'var(--md-label-large)', opacity: 0.8, marginBottom: 8 }}>Ganancia estimada</p>
        <p style={{ fontSize: 'var(--md-headline-medium)', fontWeight: 700 }}>
          ${estimatedProfit.toFixed(2)}
        </p>
        <p style={{ fontSize: 'var(--md-body-small)', opacity: 0.75, marginTop: 8 }}>
          margen aprox. {profitMargin}%
        </p>
      </div>

    </div>
  );
}

