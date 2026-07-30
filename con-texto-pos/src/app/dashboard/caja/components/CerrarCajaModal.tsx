'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cerrarCaja } from '../actions';

type Props = {
  sesionId: string;
  montoInicial: number;
  ventas: any[];
  onCerrarModal: () => void;
};

export default function CerrarCajaModal({ sesionId, montoInicial, ventas, onCerrarModal }: Props) {
  const [montoContado, setMontoContado] = useState('');
  const [procesando, setProcesando] = useState(false);
  const router = useRouter();

  const ventasValidas = ventas.filter((v) => v.estado !== 'anulada');
  const totalTickets = ventasValidas.length;

  const totalEfectivo = ventasValidas
    .filter((v) => v.metodo_pago === 'efectivo')
    .reduce((acc, v) => acc + Number(v.total || 0), 0);

  const totalTarjeta = ventasValidas
    .filter((v) => v.metodo_pago === 'tarjeta')
    .reduce((acc, v) => acc + Number(v.total || 0), 0);

  const totalDigital = ventasValidas
    .filter((v) => v.metodo_pago === 'transferencia' || v.metodo_pago === 'mercado_pago')
    .reduce((acc, v) => acc + Number(v.total || 0), 0);

  const totalVentas = totalEfectivo + totalTarjeta + totalDigital;
  const efectivoEsperado = montoInicial + totalEfectivo;

  const contadoNum = Number(montoContado) || 0;
  const diferencia = contadoNum - efectivoEsperado;

  async function handleConfirmarCierre() {
    setProcesando(true);
    try {
      await cerrarCaja(sesionId, contadoNum, efectivoEsperado);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Error al cerrar la caja');
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-5">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-bold text-gray-900">Arqueo y Cierre de Caja</h2>
          <button onClick={onCerrarModal} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        {/* Resumen del Día */}
        <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 p-4 rounded-lg border">
          <div>
            <p className="text-gray-500">Monto Inicial:</p>
            <p className="font-semibold text-gray-800">${montoInicial.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-500">Tickets Ingresados:</p>
            <p className="font-semibold text-gray-800">{totalTickets}</p>
          </div>
          <div>
            <p className="text-gray-500">Ventas en Efectivo:</p>
            <p className="font-semibold text-green-700">${totalEfectivo.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-500">Ventas Tarjeta:</p>
            <p className="font-semibold text-blue-700">${totalTarjeta.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-500">Ventas Transferencia/MP:</p>
            <p className="font-semibold text-purple-700">${totalDigital.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-500">Total Recaudado:</p>
            <p className="font-bold text-gray-900">${totalVentas.toFixed(2)}</p>
          </div>
        </div>

        {/* Campo de Arqueo de Efectivo */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm font-medium">
            <span>Efectivo esperado en caja:</span>
            <span className="text-base font-bold text-gray-900">${efectivoEsperado.toFixed(2)}</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Efectivo real en caja (Monto contado):
            </label>
            <input
              type="number"
              min={0}
              value={montoContado}
              onChange={(e) => setMontoContado(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-lg font-medium"
              placeholder="Ingresá el efectivo presente..."
            />
          </div>

          {montoContado !== '' && (
            <div className={`p-3 rounded-md text-sm font-semibold ${diferencia === 0 ? 'bg-green-100 text-green-800' : diferencia > 0 ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
              {diferencia === 0
                ? '✓ Arqueo exacto. No hay diferencias.'
                : diferencia > 0
                ? `Sobrante de caja: +$${diferencia.toFixed(2)}`
                : `Faltante de caja: -$${Math.abs(diferencia).toFixed(2)}`}
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onCerrarModal}
            className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmarCierre}
            disabled={procesando || montoContado === ''}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm font-semibold"
          >
            {procesando ? 'Cerrando...' : 'Confirmar y Cerrar Caja'}
          </button>
        </div>
      </div>
    </div>
  );
}
