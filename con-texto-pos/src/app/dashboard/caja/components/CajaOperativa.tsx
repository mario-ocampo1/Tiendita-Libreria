'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { buscarProducto, registrarVentaOfflineFirst, syncVentasPendientes } from '@/lib/sale-operations';
import TicketImpresion from './TicketImpresion';
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
  sesion: { id: string };
  usuarioId: string;
  ventasIniciales: any[];
}) {
  const [codigo, setCodigo] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'tarjeta' | 'transferencia' | 'mercado_pago'>('efectivo');
  const [descuento, setDescuento] = useState(0);
  const [buscando, setBuscando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [ultimaVenta, setUltimaVenta] = useState<UltimaVenta | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [pendientes, setPendientes] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const totalCarrito = cart.reduce((acc, i) => acc + i.cantidad * i.precio_unitario, 0);
  const totalAPagar = totalCarrito - descuento;

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

  async function handleScan(e: React.FormEvent) {
    e.preventDefault();
    if (!codigo.trim()) return;
    setBuscando(true);
    setErrorMsg('');
    try {
      const producto = await buscarProducto(codigo.trim());
      if (!producto) {
        setErrorMsg(`No se encontró ningún producto con el código "${codigo}"`);
        return;
      }
      if (producto.stock_actual <= 0) {
        setErrorMsg(`"${producto.nombre}" no tiene stock disponible`);
        return;
      }
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
    } catch {
      setErrorMsg('Error al buscar el producto');
    } finally {
      setCodigo('');
      setBuscando(false);
      inputRef.current?.focus();
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

  return (
    <div className="space-y-4">
      {/* Indicador de conexión */}
      <div className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full w-fit ${isOnline ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
        <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-yellow-500'}`} />
        {isOnline ? 'En línea' : 'Sin conexión — las ventas se guardan localmente'}
        {pendientes > 0 && (
          <span className="ml-2 bg-yellow-200 text-yellow-800 rounded-full px-2 py-0.5 text-xs">
            {pendientes} pendiente{pendientes > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Columna izquierda: escaneo + carrito */}
        <div className="md:col-span-2 space-y-4">
          <form onSubmit={handleScan} className="bg-white rounded-lg border p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Escanear código de barras
            </label>
            <input
              ref={inputRef}
              autoFocus
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              disabled={buscando}
              className="w-full border rounded px-3 py-2 text-lg"
              placeholder="Escaneá o tipeá el código..."
            />
            {errorMsg && <p className="text-red-600 text-sm mt-2">{errorMsg}</p>}
          </form>

          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3">Producto</th>
                  <th className="text-center p-3">Cant.</th>
                  <th className="text-right p-3">Precio</th>
                  <th className="text-right p-3">Subtotal</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {cart.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center p-6 text-gray-400">
                      Todavía no escaneaste ningún producto
                    </td>
                  </tr>
                )}
                {cart.map((item) => (
                  <tr key={item.product_id} className="border-t">
                    <td className="p-3">{item.nombre}</td>
                    <td className="p-3 text-center">
                      <input
                        type="number"
                        min={0}
                        value={item.cantidad}
                        onChange={(e) => actualizarCantidad(item.product_id, Number(e.target.value))}
                        className="w-16 border rounded px-2 py-1 text-center"
                      />
                    </td>
                    <td className="p-3 text-right">${item.precio_unitario.toFixed(2)}</td>
                    <td className="p-3 text-right">${(item.cantidad * item.precio_unitario).toFixed(2)}</td>
                    <td className="p-3 text-right">
                      <button onClick={() => quitarItem(item.product_id)} className="text-red-500 text-xs">
                        Quitar
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
          <div className="bg-white rounded-lg border p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${totalCarrito.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Descuento</span>
              <input
                type="number"
                min={0}
                value={descuento}
                onChange={(e) => setDescuento(Number(e.target.value))}
                className="w-24 border rounded px-2 py-1 text-right"
              />
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-3">
              <span>Total</span>
              <span>${totalAPagar.toFixed(2)}</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de pago
              </label>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value as typeof metodoPago)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
                <option value="mercado_pago">Mercado Pago</option>
              </select>
            </div>

            <button
              onClick={handleCobrar}
              disabled={cart.length === 0 || procesando}
              className="w-full bg-green-600 text-white rounded px-4 py-3 font-semibold disabled:opacity-50"
            >
              {procesando ? 'Procesando...' : `Cobrar $${totalAPagar.toFixed(2)}`}
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
    </div>
  );
}