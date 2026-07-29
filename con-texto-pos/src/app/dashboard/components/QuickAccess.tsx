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
    <div className="bg-[#FFFBF0] rounded-2xl p-6 border border-[#e8eaf6]">
      <h2 className="text-xl font-semibold text-[#1a237e] mb-4">
        Accesos rápidos
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {QUICK_ACCESS_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-[#e8eaf6] hover:bg-[#d0d5eb] border border-[#d0d5eb] hover:border-[#c5cce0] transition-colors"
          >
            <span className="text-2xl">{link.icon}</span>
            <span className="text-xs font-medium text-center text-[#1a237e]">
              {link.label}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
