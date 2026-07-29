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
    <div className="bg-white rounded-lg border p-6 max-w-sm">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Monto inicial de caja
      </label>
      <input
        type="number"
        value={monto}
        onChange={(e) => setMonto(e.target.value)}
        className="w-full border rounded px-3 py-2 mb-4"
        placeholder="0"
      />
      <button
        onClick={handleAbrir}
        disabled={loading}
        className="w-full bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
      >
        {loading ? 'Abriendo...' : 'Abrir caja'}
      </button>
    </div>
  );
}