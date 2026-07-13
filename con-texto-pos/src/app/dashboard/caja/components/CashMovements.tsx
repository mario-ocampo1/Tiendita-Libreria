interface Movement {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  timestamp: Date;
  user: string;
  reference?: string;
}

interface CashMovementsProps {
  movements: Movement[];
}

export default function CashMovements({ movements }: CashMovementsProps) {
  const getTypeColor = (type: 'income' | 'expense') => {
    return type === 'income'
      ? 'bg-green-50 border-green-200'
      : 'bg-red-50 border-red-200';
  };

  const getTypeTextColor = (type: 'income' | 'expense') => {
    return type === 'income' ? 'text-green-700' : 'text-red-700';
  };

  const getTypeLabel = (type: 'income' | 'expense') => {
    return type === 'income' ? 'Ingreso' : 'Egreso';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Movimientos del día
      </h2>

      {movements.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No hay movimientos registrados aún.
        </p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {movements.map((movement) => (
            <div
              key={movement.id}
              className={`border rounded-lg p-4 flex items-center justify-between ${getTypeColor(
                movement.type
              )}`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold uppercase ${getTypeTextColor(movement.type)}`}>
                    {getTypeLabel(movement.type)}
                  </span>
                  {movement.reference && (
                    <span className="text-xs text-gray-500">#{movement.reference}</span>
                  )}
                </div>
                <p className="font-medium text-gray-900 mt-1">
                  {movement.description}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {movement.user} · {formatTime(movement.timestamp)}
                </p>
              </div>
              <p className={`text-lg font-bold ${getTypeTextColor(movement.type)}`}>
                {movement.type === 'income' ? '+' : '-'}${movement.amount.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
