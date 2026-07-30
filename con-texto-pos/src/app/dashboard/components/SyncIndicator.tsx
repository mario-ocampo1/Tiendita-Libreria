'use client';

import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { localDb } from '@/core/db/dexie';
import { syncVentasPendientes } from '@/lib/sale-operations';

export default function SyncIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Escuchar estado de conexión online/offline
  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = async () => {
      setIsOnline(true);
      setIsSyncing(true);
      try {
        await syncVentasPendientes();
      } finally {
        setIsSyncing(false);
      }
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Consultar ventas pendientes o fallidas en Dexie en tiempo real
  const pendientesCount = useLiveQuery(async () => {
    return await localDb.pendingSales
      .where('status')
      .anyOf(['pending', 'failed'])
      .count();
  }, []);

  const count = pendientesCount ?? 0;

  const handleManualSync = async () => {
    if (!isOnline || isSyncing) return;
    setIsSyncing(true);
    try {
      await syncVentasPendientes();
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div
      onClick={handleManualSync}
      title={
        !isOnline
          ? 'Modo Offline: Los cambios se guardan localmente'
          : count > 0
          ? `${count} venta(s) pendiente(s) por sincronizar. Haz clic para reintentar.`
          : 'Ambas BD están 100% sincronizadas'
      }
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
        !isOnline
          ? 'bg-amber-100 text-amber-800 border border-amber-300'
          : count > 0
          ? 'bg-blue-100 text-blue-800 border border-blue-300 hover:bg-blue-200'
          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      }`}
    >
      <span className="relative flex h-2 w-2">
        {count > 0 && isOnline && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            !isOnline
              ? 'bg-amber-500'
              : count > 0
              ? 'bg-blue-600'
              : 'bg-emerald-500'
          }`}
        />
      </span>

      <span>
        {!isOnline
          ? 'Modo Offline'
          : isSyncing
          ? 'Sincronizando...'
          : count > 0
          ? `${count} pendiente(s)`
          : 'Sincronizado'}
      </span>
    </div>
  );
}
