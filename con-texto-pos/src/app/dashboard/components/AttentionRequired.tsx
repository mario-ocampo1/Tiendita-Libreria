interface AlertItem {
  id: string;
  title: string;
  count: number;
  urgency: 'high' | 'medium';
  action: string;
}

interface AttentionRequiredProps {
  alerts: AlertItem[];
}

export default function AttentionRequired({ alerts }: AttentionRequiredProps) {
  const getAlertColor = (urgency: 'high' | 'medium') => {
    return urgency === 'high'
      ? 'bg-red-50 border-red-200'
      : 'bg-yellow-50 border-yellow-200';
  };

  const getAlertBadgeColor = (urgency: 'high' | 'medium') => {
    return urgency === 'high'
      ? 'bg-red-100 text-red-800'
      : 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Necesita tu atención
      </h2>

      {alerts.length === 0 ? (
        <p className="text-gray-500 text-center py-6">
          ✅ Todo en orden, no hay alertas.
        </p>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`border rounded-lg p-4 ${getAlertColor(alert.urgency)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{alert.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{alert.action}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${getAlertBadgeColor(
                    alert.urgency
                  )}`}
                >
                  {alert.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
