'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { abrirCaja } from '../actions';

export default function AbrirCaja({ usuarioId }: { usuarioId: string }) {
  const [monto, setMonto] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleAbrir() {
    const montoInicial = Number(monto);
    if (isNaN(montoInicial) || montoInicial < 0) return;
    setLoading(true);
    try {
      await abrirCaja(usuarioId, montoInicial);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="md-card-outlined max-w-md">
      <h2 className="text-lg font-bold text-blue-900 mb-2">Apertura de Sesión de Caja</h2>
      <p className="text-xs text-gray-500 mb-4">Ingresá el efectivo inicial disponible en el cajón de dinero.</p>
      
      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
        Monto inicial de caja ($) *
      </label>
      <input
        type="number"
        step="0.01"
        value={monto}
        onChange={(e) => setMonto(e.target.value)}
        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all font-mono text-base bg-gray-50/50 mb-4"
        placeholder="0.00"
      />
      <button
        onClick={handleAbrir}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2.5 font-medium text-sm transition-all disabled:opacity-50 shadow-xs active:scale-[0.99]"
      >
        {loading ? 'Abriendo Caja...' : 'Abrir Caja'}
      </button>
    </div>
  );
}