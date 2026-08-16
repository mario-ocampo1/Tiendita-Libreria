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
    <div className="md-card-outlined">
      <h2 className="text-lg font-bold text-blue-900 mb-4 tracking-tight">
        Cobros por medio de pago
      </h2>

      {methods.length === 0 ? (
        <p className="text-gray-500 text-center py-6 text-sm">
          Sin ventas registradas hoy.
        </p>
      ) : (
        <div className="space-y-2">
          {methods.map((method) => (
            <div
              key={method.name}
              className="flex items-center justify-between p-3 px-4 bg-gray-50/80 rounded-xl border border-gray-100"
            >
              <div>
                <p className="font-medium text-gray-900 text-sm">
                  {method.name}
                </p>
                <p className="text-xs text-gray-500">
                  {method.count} {method.count === 1 ? 'transacción' : 'transacciones'}
                </p>
              </div>
              <p className="font-semibold font-mono text-blue-900 text-base">
                ${method.amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          ))}

          {/* Total cobrado */}
          <div className="flex items-center justify-between p-3.5 px-4 bg-blue-50 rounded-xl border border-blue-200/80 mt-3">
            <p className="font-bold text-blue-900 text-sm">
              Total cobrado
            </p>
            <p className="font-bold font-mono text-blue-900 text-lg">
              ${totalCollected.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

