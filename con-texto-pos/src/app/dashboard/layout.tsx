import type { Metadata } from 'next';
import UserMenu from './components/UserMenu';

export const metadata: Metadata = {
  title: 'Dashboard | Con-Texto POS',
  description: 'Dashboard de ventas y gestión',
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Con-Texto POS</h1>
            <UserMenu />
          </div>
        </div>
      </nav>

      {/* Layout de dos columnas */}
      <div className="flex h-[calc(100vh-70px)]">
        {/* Sidebar - Menu lateral */}
        <aside className="w-56 bg-emerald-900 text-white">
          <nav className="p-4 space-y-2">
            <a
              href="/dashboard"
              className="block px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600"
            >
               Resumen
            </a>
            <a
              href="/dashboard/caja"
              className="block px-4 py-2 rounded-lg hover:bg-emerald-700"
            >
               Caja del día
            </a>
            <a
              href="/dashboard/ventas"
              className="block px-4 py-2 rounded-lg hover:bg-emerald-700"
            >
               Ventas del día
            </a>
          
          </nav>

          {/* Separador visual */}
          <div className="border-t border-emerald-700 mx-4 my-4" />

          <nav className="p-4 space-y-2">
            <a
              href="/dashboard/productos"
              className="block px-4 py-2 rounded-lg hover:bg-emerald-700"
            >
               Productos
            </a>
            <a
              href="/dashboard/stock"
              className="block px-4 py-2 rounded-lg hover:bg-emerald-700"
            >
               Stock y vencimientos
            </a>
            <a
              href="/dashboard/categorias"
              className="block px-4 py-2 rounded-lg hover:bg-emerald-700"
            >
             Categorías
            </a>
          </nav>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
