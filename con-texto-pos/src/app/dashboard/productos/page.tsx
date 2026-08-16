'use client';

import { useState, useEffect } from 'react';
import { syncProductsFromSupabase, createProduct, updateProduct, deleteProduct, processSyncQueue } from '@/core/sync/productsSync';
import { localDb, type LocalProduct } from '@/core/db/dexie';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  PencilSquareIcon,
  PlusIcon,
  ArrowPathIcon,
  XMarkIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

export default function ProductosPage() {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Producto que se está editando (null = estamos creando uno nuevo)
  const [editingProduct, setEditingProduct] = useState<LocalProduct | null>(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    codigo_barras: '',
    precio_venta: '',
    stock_actual: '',
  });

  // Escuchar cambios en Dexie en tiempo real
  const localProducts = useLiveQuery(() => localDb.products.toArray());

  // Al reconectar, reintenta pushear todo lo que quedó pendiente offline.
  useEffect(() => {
    const handleOnline = () => {
      processSyncQueue();
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  // Sincronización manual desde la nube
  const handleSync = async () => {
    setLoading(true);
    await syncProductsFromSupabase();
    setLoading(false);
  };

  // Abrir el modal en modo edición, precargando los datos del producto
  const handleEdit = (product: LocalProduct) => {
    setEditingProduct(product);
    setFormData({
      nombre: product.nombre,
      codigo_barras: product.codigo_barras || '',
      precio_venta: product.precio_venta.toString(),
      stock_actual: product.stock_actual.toString(),
    });
    setIsModalOpen(true);
  };

  // Abrir el modal en modo creación, con el formulario limpio
  const handleNew = () => {
    setEditingProduct(null);
    setFormData({ nombre: '', codigo_barras: '', precio_venta: '', stock_actual: '' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  // Eliminar el producto que se está editando (de Dexie y, cuando haya conexión, de Supabase)
  const handleDelete = async () => {
    if (!editingProduct) return;

    const confirmado = window.confirm(
      `¿Seguro que querés eliminar "${editingProduct.nombre}"? Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;

    setLoading(true);
    try {
      await deleteProduct(editingProduct.id);
      handleCloseModal();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar el producto. Revisa la consola.');
    } finally {
      setLoading(false);
    }
  };

  // Guardar (crear o actualizar según corresponda) desde el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.precio_venta) return;

    setLoading(true);

    try {
      const payload = {
        nombre: formData.nombre,
        codigo_barras: formData.codigo_barras || 'SIN-CODIGO',
        precio_venta: parseFloat(formData.precio_venta),
        stock_actual: parseInt(formData.stock_actual) || 0,
      };

      const result = editingProduct
        ? await updateProduct(editingProduct.id, payload)
        : await createProduct(payload);

      if (result.success) {
        setFormData({ nombre: '', codigo_barras: '', precio_venta: '', stock_actual: '' });
        setEditingProduct(null);
        setIsModalOpen(false);
      } else {
        alert(`Error al ${editingProduct ? 'actualizar' : 'crear'} el producto. Revisa la consola.`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`Error al ${editingProduct ? 'actualizar' : 'crear'} el producto. Revisa la consola.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado y Acciones */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Catálogo de Productos</h1>
          <p className="text-gray-600 mt-1">Gestioná el inventario y sincronizá en tiempo real con la nube</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSync}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 border border-gray-200"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>{loading ? 'Sincronizando...' : 'Sincronizar Catálogo'}</span>
          </button>
          <button
            onClick={handleNew}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-xs active:scale-[0.98]"
          >
            <PlusIcon className="w-5 h-5" aria-hidden="true" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Tabla de Productos Locales */}
      <div className="md-card-outlined overflow-hidden p-0">
        <div className="px-6 py-4 border-b border-gray-200/80 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-base font-bold text-blue-900">
            Productos en Inventario <span className="font-mono text-sm text-gray-500 font-normal">({localProducts?.length || 0})</span>
          </h2>
        </div>

        {!localProducts || localProducts.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No hay productos cargados en la base local. Carga uno nuevo o sincroniza desde Supabase.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Nombre / Título</th>
                  <th className="px-6 py-3.5">Código / ISBN</th>
                  <th className="px-6 py-3.5 text-right">Precio</th>
                  <th className="px-6 py-3.5 text-right">Stock</th>
                  <th className="px-6 py-3.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {localProducts.map((product: LocalProduct) => (
                  <tr key={product.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {product.nombre}
                      {product.pending_sync && (
                        <span className="ml-2 text-xs font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200" title="Pendiente de sincronizar">
                          ⏳ pendiente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-mono text-xs">
                      {product.codigo_barras}
                    </td>
                    <td className="px-6 py-4 text-blue-900 text-right font-mono font-bold">
                      ${product.precio_venta?.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-semibold ${product.stock_actual > 5 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.stock_actual} un.
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center justify-center"
                        onClick={() => handleEdit(product)}
                        title="Editar producto"
                        aria-label={`Editar ${product.nombre}`}
                      >
                        <PencilSquareIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para Carga / Edición de Producto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-blue-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/80">
              <h3 className="text-lg font-bold text-blue-900">
                {editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
                aria-label="Cerrar modal"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Nombre o Título *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Rayuela - Julio Cortázar"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all text-sm bg-gray-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Código de Barras / ISBN
                </label>
                <input
                  type="text"
                  placeholder="Escanear o ingresar manual"
                  value={formData.codigo_barras}
                  onChange={(e) => setFormData({ ...formData, codigo_barras: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all font-mono text-sm bg-gray-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Precio ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={formData.precio_venta}
                    onChange={(e) => setFormData({ ...formData, precio_venta: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all font-mono text-sm bg-gray-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Stock {editingProduct ? 'Actual' : 'Inicial'}
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.stock_actual}
                    onChange={(e) => setFormData({ ...formData, stock_actual: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all font-mono text-sm bg-gray-50/50"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-gray-100">
                {editingProduct ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl font-medium text-xs transition-colors disabled:opacity-50"
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span>Eliminar</span>
                  </button>
                ) : (
                  <span />
                )}

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium text-xs transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-xs transition-colors disabled:opacity-50 shadow-xs"
                  >
                    {loading ? 'Guardando...' : editingProduct ? 'Actualizar Producto' : 'Guardar Producto'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

