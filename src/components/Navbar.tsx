import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';
import type { AdminPage } from '../types/admin';
import { SYSTEM_PAGES } from '../types/admin';

interface NavItem { to: string; label: string; order: number; }

function buildNavItems(): NavItem[] {
  const overrides: Record<string, number> = (() => {
    try { return JSON.parse(localStorage.getItem('system_page_orders') || '{}'); }
    catch { return {}; }
  })();
  const systemItems: NavItem[] = SYSTEM_PAGES
    .filter(p => p.status === 'published' && p.show_in_nav)
    .map(p => ({ to: p.slug ? `/${p.slug}` : '/', label: p.title, order: overrides[p.id] ?? p.menu_order }));

  const custom: NavItem[] = [];
  try {
    const stored = localStorage.getItem('admin_pages');
    if (stored) {
      (JSON.parse(stored) as AdminPage[])
        .filter(p => p.status === 'published' && !p.system && p.slug && (p.show_in_nav ?? true))
        .forEach(p => custom.push({ to: `/${p.slug}`, label: p.title, order: p.menu_order }));
    }
  } catch { /* ignore */ }

  return [...systemItems, ...custom].sort((a, b) => a.order - b.order);
}

export default function Navbar() {
  const [open, setOpen]         = useState(false);
  const [navItems, setNavItems] = useState<NavItem[]>(buildNavItems);

  // Refresh when navigating (in case admin pages changed)
  useEffect(() => { setNavItems(buildNavItems()); }, []);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" onClick={() => setOpen(false)}>
            <Logo size={36} />
          </Link>

          {/* Desktop */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'text-coral-500 bg-coral-50'
                      : 'text-gray-700 hover:text-coral-500 hover:bg-gray-50'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Mobile burger */}
          <button
            className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'text-coral-500 bg-coral-50' : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
