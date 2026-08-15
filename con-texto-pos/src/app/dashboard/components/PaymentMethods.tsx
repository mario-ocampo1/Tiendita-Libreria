interface PaymentMethod {
  name: string;
  amount: number;
  count: number;
}

interface PaymentMethodsProps {
  methods: PaymentMethod[];
  totalCollected: number;
}

export default function PaymentMethods({ methods, totalCollected }: PaymentMethodsProps) {
  return (
    <div className="md-card-outlined" style={{ borderRadius: 'var(--md-shape-extra-large)' }}>
      <h2 style={{ fontSize: 'var(--md-title-large)', fontWeight: 600, color: 'var(--md-on-surface)', marginBottom: 20 }}>
        Cobros por medio de pago
      </h2>

      {methods.length === 0 ? (
        <p style={{ color: 'var(--md-on-surface-variant)', textAlign: 'center', padding: '24px 0', fontSize: 'var(--md-body-medium)' }}>
          Sin ventas registradas hoy.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {methods.map((method) => (
            <div
              key={method.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'var(--md-surface-container)',
                borderRadius: 'var(--md-shape-small)',
              }}
            >
              <div>
                <p style={{ fontWeight: 500, color: 'var(--md-on-surface)', fontSize: 'var(--md-body-large)' }}>
                  {method.name}
                </p>
                <p style={{ fontSize: 'var(--md-body-small)', color: 'var(--md-on-surface-variant)' }}>
                  {method.count} transacción{method.count !== 1 ? 'es' : ''}
                </p>
              </div>
              <p style={{ fontWeight: 600, fontSize: 'var(--md-title-medium)', color: 'var(--md-primary)' }}>
                ${method.amount.toFixed(2)}
              </p>
            </div>
          ))}

          {/* Total */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              background: 'var(--md-primary-container)',
              borderRadius: 'var(--md-shape-small)',
              marginTop: 4,
            }}
          >
            <p style={{ fontWeight: 700, color: 'var(--md-on-primary-container)', fontSize: 'var(--md-body-large)' }}>
              Total cobrado
            </p>
            <p style={{ fontWeight: 700, color: 'var(--md-on-primary-container)', fontSize: 'var(--md-title-medium)' }}>
              ${totalCollected.toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

