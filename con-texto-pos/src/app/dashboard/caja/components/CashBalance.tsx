interface CashBalanceProps {
  initialAmount: number;
  totalIncome: number;
  totalExpenses: number;
  currentBalance: number;
}

export default function CashBalance({
  initialAmount,
  totalIncome,
  totalExpenses,
  currentBalance,
}: CashBalanceProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Dinero inicial */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <p className="text-xs text-gray-600 uppercase font-semibold">Dinero inicial</p>
        <p className="text-2xl font-bold text-gray-900 mt-2">
          ${initialAmount.toFixed(2)}
        </p>
      </div>

      {/* Ingresos */}
      <div className="bg-white rounded-xl p-4 border border-green-200 bg-green-50">
        <p className="text-xs text-green-700 uppercase font-semibold">Ingresos</p>
        <p className="text-2xl font-bold text-green-600 mt-2">
          +${totalIncome.toFixed(2)}
        </p>
      </div>

      {/* Egresos */}
      <div className="bg-white rounded-xl p-4 border border-red-200 bg-red-50">
        <p className="text-xs text-red-700 uppercase font-semibold">Egresos</p>
        <p className="text-2xl font-bold text-red-600 mt-2">
          -${totalExpenses.toFixed(2)}
        </p>
      </div>

      {/* Saldo actual */}
      <div className="bg-emerald-600 rounded-xl p-4 border border-emerald-700">
        <p className="text-xs text-emerald-100 uppercase font-semibold">Saldo actual</p>
        <p className="text-2xl font-bold text-white mt-2">
          ${currentBalance.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
