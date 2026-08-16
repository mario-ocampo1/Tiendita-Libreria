'use client';

import { useState } from 'react';
import {
  MagnifyingGlassIcon,
  ArrowTrendingUpIcon,
  ArrowPathIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
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
          <h1 className="text-3xl font-bold text-blue-900">Métricas de {mesNombre}</h1>
          <p className="text-gray-600 mt-1 capitalize">Informe mensual de rendimiento y reposición</p>
        </div>

        <button
          onClick={() => setMostrarBuscadorPrecios(true)}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-all shadow-xs active:scale-[0.98]"
        >
          <MagnifyingGlassIcon className="w-5 h-5" aria-hidden="true" />
          <span>Consulta Rápida de Precios</span>
        </button>
      </div>

      {/* Tarjetas resumen del mes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjeta Primaria Destacada */}
        <div className="md-card-primary flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-85 mb-2">Ventas del Mes ({mesNombre})</p>
            <p className="text-3xl font-bold font-mono tracking-tight leading-tight">
              ${totalVentasMes.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <p className="text-xs opacity-80 mt-4 font-medium">
            {cantidadVentasMes} {cantidadVentasMes === 1 ? 'operación confirmada' : 'operaciones confirmadas'}
          </p>
        </div>

        {/* Tickets Cobrados */}
        <div className="md-card flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tickets Cobrados</p>
            <p className="text-3xl font-bold text-blue-900 font-mono">
              {cantidadVentasMes}
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-4">Operaciones en el mes</p>
        </div>

        {/* Ticket Promedio Mensual */}
        <div className="md-card flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ticket Promedio Mensual</p>
            <p className="text-3xl font-bold text-blue-900 font-mono">
              ${ticketPromedioMes.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-4">Por venta cobrada</p>
        </div>
      </div>

      {/* Pestañas de Informes */}
      <div className="md-card-outlined">
        <div className="flex border-b border-gray-200 mb-6 gap-6">
          <button
            onClick={() => setTabActiva('mas_vendidos')}
            className={`pb-3 font-bold text-sm transition-colors border-b-2 inline-flex items-center gap-2 ${
              tabActiva === 'mas_vendidos'
                ? 'border-blue-900 text-blue-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <ArrowTrendingUpIcon className="w-4 h-4" aria-hidden="true" />
            <span>Productos con Mayor Salida</span>
          </button>
          <button
            onClick={() => setTabActiva('reposicion')}
            className={`pb-3 font-bold text-sm transition-colors border-b-2 inline-flex items-center gap-2 ${
              tabActiva === 'reposicion'
                ? 'border-blue-900 text-blue-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <ArrowPathIcon className="w-4 h-4" aria-hidden="true" />
            <span>Frecuencia de Reposición Sugerida</span>
          </button>
        </div>

        {/* Tab: Más Vendidos */}
        {tabActiva === 'mas_vendidos' && (
          <div className="overflow-x-auto">
            {productosMasVendidos.length === 0 ? (
              <p className="text-gray-500 text-center py-8 text-sm">Sin ventas registradas este mes.</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                    <th className="py-3 px-4 rounded-l-lg">Producto</th>
                    <th className="py-3 px-4 text-center">Unidades Vendidas</th>
                    <th className="py-3 px-4 text-right">Recaudación</th>
                    <th className="py-3 px-4 text-center rounded-r-lg">Stock Actual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {productosMasVendidos.map((prod) => (
                    <tr key={prod.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-gray-900">{prod.nombre}</td>
                      <td className="py-3.5 px-4 text-center font-bold font-mono text-blue-900">
                        {prod.cantidadVendida}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold font-mono text-green-600">
                        ${prod.totalRecaudado.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold font-mono ${
                            prod.stockActual <= prod.stockMinimo
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
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
              <p className="text-gray-500 text-center py-8 text-sm">
                No hay datos suficientes para sugerencias de reposición.
              </p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                    <th className="py-3 px-4 rounded-l-lg">Producto</th>
                    <th className="py-3 px-4 text-center">Ritmo Venta/Día</th>
                    <th className="py-3 px-4 text-center">Stock Actual</th>
                    <th className="py-3 px-4 text-center">Días de Stock Est.</th>
                    <th className="py-3 px-4 text-center rounded-r-lg">Prioridad Reposición</th>
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
                      <tr key={prod.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-gray-900">{prod.nombre}</td>
                        <td className="py-3.5 px-4 text-center font-mono font-medium text-gray-700">
                          {prod.ritmoDiario.toFixed(1)} u/día
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-semibold text-gray-900">
                          {prod.stockActual} u.
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold">
                          {dias === null ? 'N/D' : `${Math.round(dias)} días`}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              urgencia === 'alta'
                                ? 'bg-red-600 text-white'
                                : urgencia === 'media'
                                ? 'bg-amber-600 text-white'
                                : 'bg-blue-100 text-blue-900'
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-blue-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-blue-900">Consulta Rápida de Precio</h3>
              <button
                onClick={() => {
                  setMostrarBuscadorPrecios(false);
                  setQueryPrecio('');
                  setResultadosPrecio([]);
                }}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
                aria-label="Cerrar modal"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="relative mb-4">
              <input
                type="text"
                autoFocus
                placeholder="Escaneá o escribí nombre / código..."
                value={queryPrecio}
                onChange={(e) => handleBuscarPrecio(e.target.value)}
                className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-lg bg-gray-50/50"
              />
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" aria-hidden="true" />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {buscando && <p className="text-sm text-gray-500 text-center py-4">Buscando en catálogo...</p>}
              {!buscando && queryPrecio.trim().length >= 2 && resultadosPrecio.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No se encontraron productos coincidentes.</p>
              )}
              {resultadosPrecio.map((prod) => (
                <div
                  key={prod.id}
                  className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-200/80 rounded-xl hover:border-blue-300 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{prod.nombre}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Código: <span className="font-mono">{prod.codigo_barras || 'Sin código'}</span> · Stock: <span className="font-mono font-semibold">{prod.stock_actual}</span>
                    </p>
                  </div>
                  <p className="text-2xl font-bold font-mono text-blue-900">
                    ${Number(prod.precio_venta).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
