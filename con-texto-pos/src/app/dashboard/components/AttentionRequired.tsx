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
      ? 'bg-red-50/70 border-red-200'
      : 'bg-amber-50/70 border-amber-200';
  };

  const getAlertBadgeColor = (urgency: 'high' | 'medium') => {
    return urgency === 'high'
      ? 'bg-red-600 text-white'
      : 'bg-amber-600 text-white';
  };

  return (
    <div className="md-card-outlined">
      <h2 className="text-lg font-bold text-blue-900 mb-4 tracking-tight">
        Necesita tu atención
      </h2>

      {alerts.length === 0 ? (
        <div className="text-center py-6 bg-blue-50/30 rounded-xl border border-blue-100/60">
          <p className="text-gray-600 font-medium">✨ Todo en orden</p>
          <p className="text-xs text-gray-500 mt-1">No hay alertas ni tareas pendientes por revisar.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`border rounded-xl p-4 transition-colors ${getAlertColor(alert.urgency)}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{alert.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{alert.action}</p>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${getAlertBadgeColor(
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
