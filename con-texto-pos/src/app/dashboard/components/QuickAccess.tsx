interface QuickAccessLink {
  label: string;
  href: string;
  icon: string;
}

const QUICK_ACCESS_LINKS: QuickAccessLink[] = [
  {
    label: '+ Nueva venta',
    href: '/dashboard/ventas/nueva',
    icon: '🛍️',
  },
  {
    label: 'Ver ventas',
    href: '/dashboard/ventas',
    icon: '📋',
  },
  {
    label: 'Productos',
    href: '/dashboard/productos',
    icon: '📦',
  },
  {
    label: 'Stock',
    href: '/dashboard/stock',
    icon: '📊',
  },
];

export default function QuickAccess() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Accesos rápidos
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {QUICK_ACCESS_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 transition-colors"
          >
            <span className="text-2xl">{link.icon}</span>
            <span className="text-xs font-medium text-center text-gray-700">
              {link.label}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
