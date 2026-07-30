'use client';

import { useState } from 'react';
import { buscarProductosPorCoincidencia } from '@/lib/sale-operations';

export interface ProductoEstadistica {
  id: string;
  nombre: string;
  codigo_barras: string;
  cantidadVendida: number;
  totalRecaudado: number;
  stockActual: number;
  stockMinimo: number;
  ritmoDiario: number;
  diasStockRestantes: number | null;
}

export interface MetricasMensualesProps {
  mesNombre: string;
  totalVentasMes: number;
  cantidadVentasMes: number;
  ticketPromedioMes: number;
  productosMasVendidos: ProductoEstadistica[];
  sugerenciasReposicion: ProductoEstadistica[];
}

export default function MetricasClient({
  mesNombre,
  totalVentasMes,
  cantidadVentasMes,
  ticketPromedioMes,
  productosMasVendidos,
  sugerenciasReposicion,
}: MetricasMensualesProps) {
  // Buscador de precios modal / interactivo
  const [mostrarBuscadorPrecios, setMostrarBuscadorPrecios] = useState(false);
  const [queryPrecio, setQueryPrecio] = useState('');
  const [resultadosPrecio, setResultadosPrecio] = useState<any[]>([]);
  const [buscando, setBuscando] = useState(false);

  const [tabActiva, setTabActiva] = useState<'mas_vendidos' | 'reposicion'>('mas_vendidos');

  async function handleBuscarPrecio(q: string) {
    setQueryPrecio(q);
    if (!q.trim() || q.trim().length < 2) {
      setResultadosPrecio([]);
      return;
    }
    setBuscando(true);
    try {
      const res = await buscarProductosPorCoincidencia(q);
      setResultadosPrecio(res);
    } catch {
      setResultadosPrecio([]);
    } finally {
      setBuscando(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Encabezado y Consulta Rápida de Precios */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1a237e]">Métricas de {mesNombre}</h1>
          <p className="text-gray-600 mt-1">Informe mensual de rendimiento y reposición</p>
        </div>

        <button
          onClick={() => setMostrarBuscadorPrecios(true)}
          className="flex items-center justify-center gap-2 bg-[#1a237e] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-900 transition-colors shadow-sm"
        >
          Consulta Rápida de Precios
        </button>
      </div>

      {/* Tarjetas resumen del mes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#FFFBF0] border border-[#e8eaf6] rounded-2xl p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Ventas del Mes ({mesNombre})</p>
          <p className="text-3xl font-bold text-[#1a237e]">${totalVentasMes.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-2">{cantidadVentasMes} ventas confirmadas</p>
        </div>

        <div className="bg-[#FFFBF0] border border-[#e8eaf6] rounded-2xl p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Tickets Cobrados</p>
          <p className="text-3xl font-bold text-[#1a237e]">{cantidadVentasMes}</p>
          <p className="text-xs text-gray-500 mt-2">Operaciones en el mes</p>
        </div>

        <div className="bg-[#FFFBF0] border border-[#e8eaf6] rounded-2xl p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Ticket Promedio Mensual</p>
          <p className="text-3xl font-bold text-[#1a237e]">${ticketPromedioMes.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-2">Por venta cobrada</p>
        </div>
      </div>

      {/* Pestañas de Informes */}
      <div className="bg-[#FFFBF0] border border-[#e8eaf6] rounded-2xl p-6 shadow-sm">
        <div className="flex border-b border-gray-200 mb-6 gap-6">
          <button
            onClick={() => setTabActiva('mas_vendidos')}
            className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${
              tabActiva === 'mas_vendidos'
                ? 'border-[#1a237e] text-[#1a237e]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Productos con Mayor Salida
          </button>
          <button
            onClick={() => setTabActiva('reposicion')}
            className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${
              tabActiva === 'reposicion'
                ? 'border-[#1a237e] text-[#1a237e]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Frecuencia de Reposición Sugerida
          </button>
        </div>

        {/* Tab: Más Vendidos */}
        {tabActiva === 'mas_vendidos' && (
          <div className="overflow-x-auto">
            {productosMasVendidos.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Sin ventas registradas este mes.</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Producto</th>
                    <th className="py-3 px-4 text-center">Unidades Vendidas</th>
                    <th className="py-3 px-4 text-right">Recaudación</th>
                    <th className="py-3 px-4 text-center">Stock Actual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {productosMasVendidos.map((prod) => (
                    <tr key={prod.id} className="hover:bg-[#f0f2fb]">
                      <td className="py-3 px-4 font-medium text-gray-900">{prod.nombre}</td>
                      <td className="py-3 px-4 text-center font-bold text-[#1a237e]">
                        {prod.cantidadVendida}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                        ${prod.totalRecaudado.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            prod.stockActual <= prod.stockMinimo
                              ? 'bg-red-100 text-red-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {prod.stockActual} u.
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab: Frecuencia de Reposición */}
        {tabActiva === 'reposicion' && (
          <div className="overflow-x-auto">
            {sugerenciasReposicion.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay datos suficientes para sugerencias de reposición.
              </p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Producto</th>
                    <th className="py-3 px-4 text-center">Ritmo Venta/Día</th>
                    <th className="py-3 px-4 text-center">Stock Actual</th>
                    <th className="py-3 px-4 text-center">Días de Stock Est.</th>
                    <th className="py-3 px-4 text-center">Prioridad Reposición</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {sugerenciasReposicion.map((prod) => {
                    const dias = prod.diasStockRestantes;
                    const urgencia =
                      dias !== null && dias <= 5
                        ? 'alta'
                        : dias !== null && dias <= 15
                        ? 'media'
                        : 'normal';

                    return (
                      <tr key={prod.id} className="hover:bg-[#f0f2fb]">
                        <td className="py-3 px-4 font-medium text-gray-900">{prod.nombre}</td>
                        <td className="py-3 px-4 text-center font-medium text-gray-700">
                          {prod.ritmoDiario.toFixed(1)} u/día
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-gray-900">
                          {prod.stockActual} u.
                        </td>
                        <td className="py-3 px-4 text-center font-bold">
                          {dias === null ? 'N/D' : `${Math.round(dias)} días`}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              urgencia === 'alta'
                                ? 'bg-red-100 text-red-800'
                                : urgencia === 'media'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {urgencia === 'alta'
                              ? 'Alta — Comprar ya'
                              : urgencia === 'media'
                              ? 'Media — Próxima compra'
                              : 'Normal'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Modal Consulta Rápida de Precios */}
      {mostrarBuscadorPrecios && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFBF0] rounded-2xl p-6 w-full max-w-lg shadow-xl border border-[#e8eaf6]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#1a237e]">Consulta Rápida de Precio</h3>
              <button
                onClick={() => {
                  setMostrarBuscadorPrecios(false);
                  setQueryPrecio('');
                  setResultadosPrecio([]);
                }}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <input
              type="text"
              autoFocus
              placeholder="Escaneá o escribí nombre / código..."
              value={queryPrecio}
              onChange={(e) => handleBuscarPrecio(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a237e] text-lg bg-white mb-4"
            />

            <div className="max-h-64 overflow-y-auto space-y-2">
              {buscando && <p className="text-sm text-gray-500 text-center py-4">Buscando...</p>}
              {!buscando && queryPrecio.trim().length >= 2 && resultadosPrecio.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No se encontraron productos.</p>
              )}
              {resultadosPrecio.map((prod) => (
                <div
                  key={prod.id}
                  className="flex items-center justify-between p-3 bg-white border rounded-xl"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{prod.nombre}</p>
                    <p className="text-xs text-gray-500">
                      Código: {prod.codigo_barras || 'Sin código'} · Stock: {prod.stock_actual}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-[#1a237e]">
                    ${Number(prod.precio_venta).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
