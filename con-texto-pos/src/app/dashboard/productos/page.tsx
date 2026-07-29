'use client';

import { useState } from 'react';
import { syncProductsFromSupabase, createProduct, updateProduct, deleteProduct, processSyncQueue } from '@/core/sync/productsSync';
import { useEffect } from 'react';
import { localDb, type LocalProduct } from '@/core/db/dexie';
import { useLiveQuery } from 'dexie-react-hooks';
import { NumberedListIcon } from '@heroicons/react/24/solid';

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
    <div className="p-6 space-y-6">
      {/* Encabezado y Acciones */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catálogo de Productos</h1>
          <p className="text-gray-600 text-sm">Gestiona el inventario y sincroniza con la nube.</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleSync}
            disabled={loading}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? 'Sincronizando...' : 'Sincronizar Catálogo'}
          </button>
          <button
            onClick={handleNew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
          >
            + Nuevo Producto
          </button>
        </div>
      </div>

      {/* Tabla de Productos Locales */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-base font-semibold text-gray-800">
            Productos en Inventario ({localProducts?.length || 0})
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
                <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
                  <th className="px-6 py-3 font-medium">Nombre / Título</th>
                  <th className="px-6 py-3 font-medium">Código / ISBN</th>
                  <th className="px-6 py-3 font-medium text-right">Precio</th>
                  <th className="px-6 py-3 font-medium text-right">Stock</th>
                  <th className="px-6 py-3 font-medium text-right">Editar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {localProducts.map((product: LocalProduct) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {product.nombre}
                      {product.pending_sync && (
                        <span className="ml-2 text-xs font-normal text-amber-600" title="Pendiente de sincronizar">
                          ⏳ pendiente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                      {product.codigo_barras}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                      ${product.precio_venta?.toLocaleString('es-AR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 text-right">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${product.stock_actual > 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {product.stock_actual} un.
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 text-right">
                      <button
                        className="text-blue-600 hover:text-blue-800 font-medium"
                        onClick={() => handleEdit(product)}
                      >
                        <NumberedListIcon className="w-5 h-5" />
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
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">
                {editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre o Título *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Rayuela - Julio Cortázar"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código de Barras / ISBN
                </label>
                <input
                  type="text"
                  placeholder="Escanear o ingresar manual"
                  value={formData.codigo_barras}
                  onChange={(e) => setFormData({ ...formData, codigo_barras: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={formData.precio_venta}
                    onChange={(e) => setFormData({ ...formData, precio_venta: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock {editingProduct ? 'Actual' : 'Inicial'}
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.stock_actual}
                    onChange={(e) => setFormData({ ...formData, stock_actual: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-gray-100">
                {editingProduct ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                ) : (
                  <span />
                )}

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
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
