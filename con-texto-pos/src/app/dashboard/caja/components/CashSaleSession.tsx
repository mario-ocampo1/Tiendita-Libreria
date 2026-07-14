'use client';

/**
 * COMPONENTE: CashSaleSession
 *
 * Interfaz de punto de venta que permite:
 * 1. Buscar productos por código de barras
 * 2. Agregar productos al carrito
 * 3. Modificar cantidades
 * 4. Completar la venta
 *
 * Usa el hook useCashSession para gestionar la BD local (Dexie)
 */

import { useState, useEffect, useRef } from 'react';
import type { CashSessionItem } from '@/core/db/dexie';
import { useCashSession } from '@/lib/hooks/useCashSession';

interface CashSaleSessionProps {
  onClose: () => void;
  onSave?: (items: CashSessionItem[], total: number) => void;
}

export default function CashSaleSession({ onClose, onSave }: CashSaleSessionProps) {
  // Hook para gestionar la sesión de caja
  const { session, items, totals, error: hookError, searchProductByBarcode, addProduct, removeItem, updateQuantity } = useCashSession();

  const [barcode, setBarcode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mantener el foco en el input del lector de código de barras
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Inicializar sesión si no existe
  useEffect(() => {
    if (session === null && !isProcessing) {
      // Si no hay sesión abierta, se asume que se abrirá desde el parent
      // O se puede iniciar aquí con un saldo inicial
    }
  }, [session, isProcessing]);

  /**
   * Manejo del escaneo de código de barras
   */
  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanBarcode = barcode.trim();

    if (!cleanBarcode) {
      return;
    }

    if (!session) {
      setError('La sesión de caja no está abierta');
      return;
    }

    try {
      setError(null);

      // Buscar producto en la BD local por código de barras
      const product = await searchProductByBarcode(cleanBarcode);

      if (product) {
        // Agregar al carrito
        await addProduct(product, 1);
        setBarcode('');
      } else {
        setError(`Producto no encontrado: ${cleanBarcode}`);
        setBarcode('');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al procesar código';
      setError(message);
    }
  };

  /**
   * Completar la venta
   */
  const handleFinishSale = async () => {
    if (!session || items.length === 0 || isProcessing) {
      return;
    }

    try {
      setIsProcessing(true);

      // Aquí irá la lógica para:
      // 1. Cerrar la sesión
      // 2. Guardar en pendingSales (si es necesario)
      // 3. Notificar al parent

      if (onSave && totals) {
        onSave(items, totals.subtotal);
      }

      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al completar venta';
      setError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Mostrar estado de carga
  if (!session) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-[#FFFBF0] rounded-2xl p-8 max-w-md text-center">
          <p className="text-gray-600 mb-4">Inicializando sesión de caja...</p>
          <button onClick={onClose} className="btn btn-secondary">
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#FFFBF0] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Cabecera */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-[#1a237e] text-white">
          <div>
            <h2 className="text-2xl font-bold">Punto de Venta</h2>
            <p className="text-blue-100 text-sm">Escanee productos o ingrese código manualmente</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/10 p-2 rounded-full transition"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden gap-6 p-6">
          {/* Lado Izquierdo: Input y Lista de productos */}
          <div className="flex-1 flex flex-col">
            {/* Input de código de barras */}
            <form onSubmit={handleBarcodeSubmit} className="mb-6">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Escanear código de barras..."
                  className="input w-full pl-10"
                  autoComplete="off"
                  autoFocus
                />
                <span className="absolute left-3 top-3 text-gray-400">🔍</span>
              </div>
              {(error || hookError) && (
                <p className="text-red-500 text-sm mt-2">{error || hookError}</p>
              )}
            </form>

            {/* Lista de productos en el carrito */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
                  <span className="text-4xl mb-2">🛒</span>
                  <p>El carrito está vacío</p>
                  <p className="text-xs mt-1">Escanee un producto para comenzar</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between hover:shadow-md transition"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#1a237e]">{item.product_name}</h4>
                        <p className="text-sm text-gray-500">
                          ${item.unit_price.toFixed(2)} c/u
                        </p>
                      </div>

                      {/* Controles de cantidad */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-gray-100 rounded-lg">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.id, Math.max(1, item.quantity - 1))
                            }
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded-md transition"
                          >
                            −
                          </button>
                          <span className="w-8 text-center font-medium text-sm">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded-md transition"
                          >
                            +
                          </button>
                        </div>

                        {/* Total del item */}
                        <div className="text-right w-20">
                          <p className="font-bold text-[#1a237e]">
                            ${item.total_price.toFixed(2)}
                          </p>
                        </div>

                        {/* Botón eliminar */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 transition p-1"
                          aria-label="Eliminar"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Lado Derecho: Resumen y Botones */}
          <div className="md:w-64 flex flex-col">
            {/* Resumen */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
              <h3 className="font-semibold text-[#1a237e] mb-4">Resumen</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Artículos:</span>
                  <span className="font-medium">{totals?.uniqueProducts || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cantidad:</span>
                  <span className="font-medium">{totals?.itemCount || 0}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-bold text-lg text-[#1a237e]">
                    ${(totals?.subtotal || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="space-y-3 flex flex-col">
              <button
                onClick={handleFinishSale}
                disabled={items.length === 0 || isProcessing}
                className="btn btn-success w-full"
              >
                {isProcessing ? 'Procesando...' : 'Completar Venta'}
              </button>
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="btn btn-secondary w-full"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
