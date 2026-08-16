'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { buscarProducto, buscarProductosPorCoincidencia, registrarVentaOfflineFirst, syncVentasPendientes } from '@/lib/sale-operations';
import TicketImpresion from './TicketImpresion';
import CerrarCajaModal from './CerrarCajaModal';
import './ticket-print.css';

type CartItem = {
  product_id: string;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
};

type UltimaVenta = {
  items: CartItem[];
  total: number;
  subtotal: number;
  descuento: number;
  metodo_pago: string;
  fecha: Date;
  offline: boolean;
};

export default function CajaOperativa({
  sesion,
  usuarioId,
  ventasIniciales,
}: {
  sesion: { id: string; monto_inicial?: number };
  usuarioId: string;
  ventasIniciales: any[];
}) {
  const [codigo, setCodigo] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'tarjeta' | 'transferencia' | 'mercado_pago'>('efectivo');
  const [descuento, setDescuento] = useState(0);
  const [buscando, setBuscando] = useState(false);
  const [sugerencias, setSugerencias] = useState<any[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [ultimaVenta, setUltimaVenta] = useState<UltimaVenta | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [pendientes, setPendientes] = useState(0);
  const [mostrarArqueo, setMostrarArqueo] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const totalCarrito = cart.reduce((acc, i) => acc + i.cantidad * i.precio_unitario, 0);
  const totalAPagar = totalCarrito - descuento;

  // Búsqueda en tiempo real (autocomplete)
  useEffect(() => {
    if (!codigo.trim() || codigo.trim().length < 2) {
      setSugerencias([]);
      setMostrarSugerencias(false);
      return;
    }

    const timer = setTimeout(async () => {
      const resultados = await buscarProductosPorCoincidencia(codigo.trim());
      setSugerencias(resultados);
      setMostrarSugerencias(true);
    }, 250);

    return () => clearTimeout(timer);
  }, [codigo]);

  // Monitor de conexión
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      const resultado = await syncVentasPendientes();
      if (resultado.procesadas > 0) {
        setPendientes(0);
        router.refresh();
      }
    };
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [router]);

  function agregarProducto(producto: any) {
    if (producto.stock_actual <= 0) {
      setErrorMsg(`"${producto.nombre}" no tiene stock disponible`);
      return;
    }
    setErrorMsg('');
    setCart((prev) => {
      const existe = prev.find((i) => i.product_id === producto.id);
      if (existe) {
        return prev.map((i) =>
          i.product_id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i
        );
      }
      return [
        ...prev,
        {
          product_id: producto.id,
          nombre: producto.nombre,
          cantidad: 1,
          precio_unitario: producto.precio_venta,
        },
      ];
    });
    setCodigo('');
    setSugerencias([]);
    setMostrarSugerencias(false);
    inputRef.current?.focus();
  }

  async function handleScan(e: React.FormEvent) {
    e.preventDefault();
    if (!codigo.trim()) return;

    // Si hay sugerencias activas, tomar la primera coincidencia exacta o primera sugerencia
    if (sugerencias.length > 0) {
      agregarProducto(sugerencias[0]);
      return;
    }

    setBuscando(true);
    setErrorMsg('');
    try {
      const producto = await buscarProducto(codigo.trim());
      if (!producto) {
        setErrorMsg(`No se encontró ningún producto con "${codigo}"`);
        return;
      }
      agregarProducto(producto);
    } catch {
      setErrorMsg('Error al buscar el producto');
    } finally {
      setBuscando(false);
    }
  }

  function actualizarCantidad(productId: string, cantidad: number) {
    if (cantidad <= 0) {
      setCart((prev) => prev.filter((i) => i.product_id !== productId));
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.product_id === productId ? { ...i, cantidad } : i))
    );
  }

  function quitarItem(productId: string) {
    setCart((prev) => prev.filter((i) => i.product_id !== productId));
  }

  async function handleCobrar() {
    if (cart.length === 0) return;

    const confirmado = window.confirm(`¿Estás seguro de que deseas registrar y cobrar esta venta por $${totalAPagar.toFixed(2)}?`);
    if (!confirmado) return;

    setProcesando(true);
    setErrorMsg('');
    try {
      const resultado = await registrarVentaOfflineFirst({
        usuario_id: usuarioId,
        caja_sesion_id: sesion.id,
        metodo_pago: metodoPago,
        descuento,
        subtotal: totalCarrito,
        total: totalAPagar,
        items: cart.map((i) => ({
          product_id: i.product_id,
          cantidad: i.cantidad,
          precio_unitario: i.precio_unitario,
        })),
      });

      if (resultado.status === 'pending' || resultado.status === 'failed') {
        setPendientes((p) => p + 1);
      }

      setUltimaVenta({
        items: cart,
        total: totalAPagar,
        subtotal: totalCarrito,
        descuento,
        metodo_pago: metodoPago,
        fecha: new Date(),
        offline: resultado.status !== 'synced',
      });

      setCart([]);
      setDescuento(0);
      if (resultado.status === 'synced') router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message ?? 'Error al registrar la venta');
    } finally {
      setProcesando(false);
    }
  }

  const totalFormatted = totalAPagar.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const subtotalFormatted = totalCarrito.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-6">
      {/* Barra superior de estado y acciones */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-blue-200 shadow-xs">
        <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full ${isOnline ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
          <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-600' : 'bg-amber-600'}`} aria-hidden="true" />
          <span>{isOnline ? 'En Línea — Sincronización Automática' : 'Modo Offline — Ventas guardadas en la base local'}</span>
          {pendientes > 0 && (
            <span className="ml-2 bg-amber-200 text-amber-900 rounded-full px-2 py-0.5 text-xs font-mono font-bold">
              {pendientes} pendiente{pendientes > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <button
          onClick={() => setMostrarArqueo(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-medium text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-[0.98]"
        >
          Realizar Arqueo y Cerrar Caja
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Columna izquierda: escaneo + carrito */}
        <div className="md:col-span-2 space-y-4">
          <form onSubmit={handleScan} className="bg-white rounded-2xl border border-blue-200 p-5 relative shadow-xs">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Buscar o Escanear Producto
            </label>
            <input
              ref={inputRef}
              autoFocus
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              onFocus={() => { if (sugerencias.length > 0) setMostrarSugerencias(true); }}
              disabled={buscando}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50/50 font-mono"
              placeholder="Escaneá el código de barras o escribí un nombre..."
            />

            {/* Lista desplegable de sugerencias */}
            {mostrarSugerencias && sugerencias.length > 0 && (
              <ul className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-blue-200 rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-gray-100">
                {sugerencias.map((prod) => (
                  <li
                    key={prod.id}
                    onClick={() => agregarProducto(prod)}
                    className="px-4 py-3 hover:bg-blue-50/60 cursor-pointer flex justify-between items-center transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{prod.nombre}</p>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">Cód: {prod.codigo_barras || 'N/A'} · Stock: {prod.stock_actual}</p>
                    </div>
                    <span className="font-bold font-mono text-blue-900 text-base">${prod.precio_venta?.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </li>
                ))}
              </ul>
            )}

            {errorMsg && <p className="text-red-600 text-xs font-medium mt-2">{errorMsg}</p>}
          </form>

          {/* Tabla de Carrito */}
          <div className="bg-white rounded-2xl border border-blue-200 overflow-hidden shadow-xs">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="text-left p-3.5 px-4">Producto</th>
                  <th className="text-center p-3.5">Cant.</th>
                  <th className="text-right p-3.5">Precio</th>
                  <th className="text-right p-3.5">Subtotal</th>
                  <th className="p-3.5 text-right">Quitar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cart.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-gray-400 text-sm">
                      🛒 Escaneá o seleccioná un producto para iniciar la venta
                    </td>
                  </tr>
                )}
                {cart.map((item) => (
                  <tr key={item.product_id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3.5 px-4 font-semibold text-gray-900">{item.nombre}</td>
                    <td className="p-3.5 text-center">
                      <input
                        type="number"
                        min={1}
                        value={item.cantidad}
                        onChange={(e) => actualizarCantidad(item.product_id, Number(e.target.value))}
                        className="w-16 border border-gray-300 rounded-lg px-2 py-1 text-center font-mono font-semibold bg-gray-50/50"
                      />
                    </td>
                    <td className="p-3.5 text-right font-mono font-medium text-gray-700">${item.precio_unitario.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-blue-900">${(item.cantidad * item.precio_unitario).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="p-3.5 text-right">
                      <button onClick={() => quitarItem(item.product_id)} className="text-red-600 hover:text-red-800 font-semibold text-xs transition-colors">
                        ✕ Quitar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Columna derecha: totales + cobro */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-blue-200 p-5 space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-blue-900 border-b border-gray-100 pb-3">Resumen de Venta</h3>

            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span className="font-mono font-semibold text-gray-900">${subtotalFormatted}</span>
            </div>

            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Descuento ($)</span>
              <input
                type="number"
                min={0}
                value={descuento}
                onChange={(e) => setDescuento(Number(e.target.value))}
                className="w-24 border border-gray-300 rounded-xl px-2.5 py-1 text-right font-mono font-semibold bg-gray-50/50"
              />
            </div>

            <div className="flex justify-between items-center border-t border-gray-200 pt-3">
              <span className="font-bold text-gray-900 text-base">Total a Cobrar</span>
              <span className="font-bold font-mono text-2xl text-blue-900">${totalFormatted}</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Método de pago
              </label>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value as typeof metodoPago)}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50/50 font-medium focus:ring-2 focus:ring-blue-600 outline-none"
              >
                <option value="efectivo">💵 Efectivo</option>
                <option value="tarjeta">💳 Tarjeta (Débito/Crédito)</option>
                <option value="transferencia">🏦 Transferencia Bancaria</option>
                <option value="mercado_pago">📱 Mercado Pago (QR)</option>
              </select>
            </div>

            <button
              onClick={handleCobrar}
              disabled={cart.length === 0 || procesando}
              className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl px-4 py-3.5 font-bold font-mono text-lg transition-all shadow-xs active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {procesando ? 'Procesando Venta...' : `Cobrar $${totalFormatted}`}
            </button>
          </div>
        </div>
      </div>

      {ultimaVenta && (
        <TicketImpresion
          items={ultimaVenta.items}
          total={ultimaVenta.total}
          subtotal={ultimaVenta.subtotal}
          descuento={ultimaVenta.descuento}
          metodoPago={ultimaVenta.metodo_pago}
          fecha={ultimaVenta.fecha}
          offline={ultimaVenta.offline}
          onCerrar={() => setUltimaVenta(null)}
        />
      )}

      {mostrarArqueo && (
        <CerrarCajaModal
          sesionId={sesion.id}
          montoInicial={sesion.monto_inicial ?? 0}
          ventas={ventasIniciales}
          onCerrarModal={() => setMostrarArqueo(false)}
        />
      )}
    </div>
  );
}