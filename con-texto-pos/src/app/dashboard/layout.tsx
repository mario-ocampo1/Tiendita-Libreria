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
    <div className="min-h-screen bg-[#e3e3e5]">
      {/* Navbar */}
      <nav className="bg-[#e3e3e5] border-b border-gray-300 shadow-sm">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between">

            <img src="/Logo.jpeg" alt="Con-Texto POS Logo" className="h-10 w-10" />
            <h1 className="text-xl font-semibold text-gray-900">Con-Texto Chacras</h1>
            <UserMenu />
          </div>
        </div>
      </nav>

      {/* Layout de dos columnas */}
      <div className="flex h-[calc(100vh-70px)]">
        {/* Sidebar - Menu lateral */}
        <aside className="w-56 bg-blue-600 text-white">
          <nav className="p-4 space-y-2">
            <a
              href="/dashboard"
              className="block px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-600"
            >
               Resumen
            </a>
            <a
              href="/dashboard/caja"
              className="block px-4 py-2 rounded-lg hover:bg-blue-700"
            >
               Caja del día
            </a>
            <a
              href="/dashboard/ventas"
              className="block px-4 py-2 rounded-lg hover:bg-blue-700"
            >
               Ventas del día
            </a>
          
          </nav>

          {/* Separador visual */}
          <div className="border-t border-blue-700 mx-4 my-4" />

          <nav className="p-4 space-y-2">
            <a
              href="/dashboard/productos"
              className="block px-4 py-2 rounded-lg hover:bg-blue-700"
            >
               Productos
            </a>
            <a
              href="/dashboard/stock"
              className="block px-4 py-2 rounded-lg hover:bg-blue-700"
            >
               Stock y vencimientos
            </a>
            <a
              href="/dashboard/categorias"
              className="block px-4 py-2 rounded-lg hover:bg-blue-700"
            >
             Categorías
            </a>
          </nav>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 overflow-y-auto bg-[#191970]">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
