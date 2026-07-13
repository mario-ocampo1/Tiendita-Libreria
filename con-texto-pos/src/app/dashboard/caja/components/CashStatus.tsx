interface CashStatusProps {
  isOpen: boolean;
  openedAt: Date | null;
  userName: string;
}

export default function CashStatus({
  isOpen,
  openedAt,
  userName,
}: CashStatusProps) {
  const getTimeElapsed = (date: Date | null) => {
    if (!date) return '';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="bg-[#FFFDD0] rounded-2xl p-6 border border-gray-200 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-4 h-4 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
          <div>
            <p className="text-sm text-gray-600">Estado de caja</p>
            <p className="text-2xl font-bold text-gray-900">
              {isOpen ? 'Caja abierta' : 'Caja cerrada'}
            </p>
            {isOpen && openedAt && (
              <p className="text-xs text-gray-500 mt-1">
                Abierta por {userName} hace {getTimeElapsed(openedAt)}
              </p>
            )}
          </div>
        </div>

        {isOpen && (
          <button className="px-6 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium">
            Cerrar caja
          </button>
        )}
        {!isOpen && (
          <button className="px-6 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium">
            Abrir caja
          </button>
        )}
      </div>
    </div>
  );
}
