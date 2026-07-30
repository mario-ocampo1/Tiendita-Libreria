import type { Metadata } from 'next';
import UserMenu from './components/UserMenu';
import SyncIndicator from './components/SyncIndicator';
import './dashboard.css';

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
    <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
      {/* Navbar */}
      <nav className="bg-[#FAFAF8] border-b border-gray-300 shadow-sm">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/Logo.jpeg" alt="Con-Texto POS Logo" className="h-10 w-10" />
              <h1 className="text-lg font-semibold text-[#1a237e]">Con-Texto Chacras</h1>
            </div>
            <div className="flex items-center gap-4">
              <SyncIndicator />
              <UserMenu />
            </div>
          </div>
        </div>
      </nav>

      {/* Layout de dos columnas */}
      <div className="flex flex-1">
        {/* Sidebar - Menu lateral */}
        <aside className="w-56 bg-[#1a237e] text-white overflow-y-auto">
          <nav className="p-4 space-y-2">
            <a href="/dashboard" className="sidebar-link">
              Resumen
            </a>
            <a href="/dashboard/caja" className="sidebar-link">
              Caja del día
            </a>
            <a href="/dashboard/metricas" className="sidebar-link">
              Métricas
            </a>
          </nav>

          <div className="border-t border-[#283593] mx-4 my-4" />

          <nav className="p-4 space-y-2">
            <a href="/dashboard/productos" className="sidebar-link">
              Productos
            </a>
          </nav>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 overflow-y-auto bg-[#FAFAF8] p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
