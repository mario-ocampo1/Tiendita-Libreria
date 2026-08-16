'use client';

import { usePathname } from 'next/navigation';
import {
  Squares2X2Icon,
  BanknotesIcon,
  ChartBarIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import UserMenu from './components/UserMenu';
import SyncIndicator from './components/SyncIndicator';
import './dashboard.css';

const NAV_ITEMS = [
  { href: '/dashboard',          label: 'Resumen',   Icon: Squares2X2Icon },
  { href: '/dashboard/caja',     label: 'Caja',      Icon: BanknotesIcon },
  { href: '/dashboard/metricas', label: 'Métricas',  Icon: ChartBarIcon },
  { href: '/dashboard/productos',label: 'Productos', Icon: BookOpenIcon },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--md-background)' }}>

      {/* ── Top App Bar ── */}
      <header className="md-top-bar">
        {/* Logo + Título */}
        <img src="/Logo.jpeg" alt="Con-Texto POS" style={{ height: 36, width: 36, borderRadius: 8, flexShrink: 0 }} />
        <span className="md-top-bar-title">Con-Texto Chacras</span>

        {/* Acciones */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SyncIndicator />
          <UserMenu />
        </div>
      </header>

      {/* ── Body con Drawer + Contenido ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Navigation Drawer (Desktop) */}
        <nav className="md-nav-drawer" aria-label="Navegación principal">
          <p className="md-nav-section-label">Operaciones</p>

          {NAV_ITEMS.slice(0, 2).map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={`md-nav-item ${isActive(item.href) ? 'active' : ''}`}
            >
              <item.Icon className="w-5 h-5 nav-icon" aria-hidden="true" />
              <span>{item.label}</span>
            </a>
          ))}

          <div className="md-nav-divider" />
          <p className="md-nav-section-label">Análisis</p>

          {NAV_ITEMS.slice(2).map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={`md-nav-item ${isActive(item.href) ? 'active' : ''}`}
            >
              <item.Icon className="w-5 h-5 nav-icon" aria-hidden="true" />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        {/* Contenido principal */}
        <main
          className="md-main-content"
          style={{ flex: 1, overflowY: 'auto', padding: '24px', background: 'var(--md-background)' }}
        >
          {children}
        </main>
      </div>

      {/* ── Bottom Navigation Bar (Móvil) ── */}
      <div className="md-bottom-nav">
        <div className="md-bottom-nav-inner">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={`md-bottom-nav-item ${isActive(item.href) ? 'active' : ''}`}
            >
              <span className="bn-indicator">
                <item.Icon className="w-5 h-5" aria-hidden="true" />
              </span>
              <span className="bn-label">{item.label}</span>
            </a>
          ))}
        </div>
      </div>

    </div>
  );
}

