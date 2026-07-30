'use client';
import { useEffect } from 'react';

type Item = { nombre: string; cantidad: number; precio_unitario: number };

type Props = {
  numeroTicket?: number;
  items: Item[];
  subtotal: number;
  descuento: number;
  total: number;
  metodoPago: string;
  fecha: Date;
  offline: boolean;
  onCerrar: () => void;
};

const METODO_LABELS: Record<string, string> = {
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
  mercado_pago: 'Mercado Pago',
};

export default function TicketImpresion({ 
  numeroTicket, 
  items, 
  subtotal, 
  descuento, 
  total, 
  metodoPago, 
  fecha, 
  offline, 
  onCerrar 
}: Props) {
  function imprimir() {
    const originalTitle = document.title;
    // Nombre del archivo PDF (evita el símbolo '#' que los navegadores borran)
    document.title = numeroTicket ? `Ticket-${numeroTicket}` : 'Ticket-de-Venta';

    const restaurarTitulo = () => {
      document.title = originalTitle;
      window.removeEventListener('afterprint', restaurarTitulo);
    };

    window.addEventListener('afterprint', restaurarTitulo);

    setTimeout(() => {
      window.print();
    }, 100);
  }

  // Disparar la impresión automáticamente al registrar la venta
  useEffect(() => {
    imprimir();
  }, []);

  return (
    <>
      {/* Overlay en pantalla — no aparece al imprimir */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 no-print">
        <div className="bg-white rounded-lg shadow-xl p-6 w-80 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg">Venta registrada</h2>
            <button onClick={onCerrar} className="text-gray-500 hover:text-gray-700 text-xl">×</button>
          </div>
          
          <p className="text-sm text-gray-600">
            Total cobrado: <span className="font-bold">${total.toFixed(2)}</span> — {METODO_LABELS[metodoPago] ?? metodoPago}
          </p>

          {/* Indicador Offline */}
          {offline && (
            <p className="text-xs text-yellow-600 bg-yellow-50 rounded p-2">
              Venta guardada localmente. Se sincronizará cuando haya conexión.
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={imprimir}
              className="flex-1 bg-gray-800 text-white rounded px-4 py-2 text-sm"
            >
              Imprimir ticket
            </button>
            <button
              onClick={onCerrar}
              className="flex-1 border rounded px-4 py-2 text-sm"
            >
              Nueva venta
            </button>
          </div>
        </div>
      </div>

      {/* Ticket real — solo visible al imprimir */}
      <div className="ticket-print">
        <div className="ticket-header">
          <p className="ticket-negocio">Con-texto Chacras</p>
          <p className="ticket-sub">Librería y papelería</p>
          <p className="ticket-fecha">
            {fecha.toLocaleDateString('es-AR')} {fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
          </p>
          {numeroTicket && <p className="ticket-numero">Ticket #{numeroTicket}</p>}
        </div>

        <div className="ticket-linea" />

        <table className="ticket-tabla">
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td className="ticket-td-nombre">{item.nombre}</td>
                <td className="ticket-td-cant">{item.cantidad}x</td>
                <td className="ticket-td-precio">${(item.cantidad * item.precio_unitario).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ticket-linea" />

        {descuento > 0 && (
          <div className="ticket-fila">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
        )}
        {descuento > 0 && (
          <div className="ticket-fila">
            <span>Descuento</span>
            <span>-${descuento.toFixed(2)}</span>
          </div>
        )}
        <div className="ticket-fila ticket-total">
          <span>TOTAL</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <div className="ticket-fila">
          <span>Forma de pago</span>
          <span>{METODO_LABELS[metodoPago] ?? metodoPago}</span>
        </div>

        <div className="ticket-linea" />
        <p className="ticket-footer">¡Gracias por tu compra!</p>
      </div>
    </>
  );
}