interface PaymentMethod {
  name: string;
  amount: number;
  count: number;
}

interface PaymentMethodsProps {
  methods: PaymentMethod[];
  totalCollected: number;
}

export default function PaymentMethods({
  methods,
  totalCollected,
}: PaymentMethodsProps) {
  return (
    <div className="bg-[#FFFDD0] rounded-2xl p-6 border border-blue-200">
      <h2 className="text-xl font-semibold text-blue-900 mb-6">
        Cobros por medio de pago
      </h2>

      {methods.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          Sin ventas registradas hoy.
        </p>
      ) : (
        <div className="space-y-3">
          {methods.map((method) => (
            <div
              key={method.name}
              className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
            >
              <div>
                <p className="font-medium text-blue-900">{method.name}</p>
                <p className="text-sm text-gray-500">
                  {method.count} transacción{method.count !== 1 ? 'es' : ''}
                </p>
              </div>
              <p className="text-lg font-semibold text-blue-900">
                ${method.amount.toFixed(2)}
              </p>
            </div>
          ))}

          {/* Total */}
          <div className="flex items-center justify-between p-3 bg-blue-100 rounded-lg font-semibold">
            <p>Total cobrado</p>
            <p className="text-blue-600">${totalCollected.toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
