import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import Logo from './Logo';
import type { AdminPage } from '../types/admin';
import { SYSTEM_PAGES } from '../types/admin';

interface NavItem {
  id: string;
  to: string;
  label: string;
  order: number;
  children?: NavItem[];
}

function buildNavItems(): NavItem[] {
  const overrides: Record<string, number> = (() => {
    try { return JSON.parse(localStorage.getItem('system_page_orders') || '{}'); }
    catch { return {}; }
  })();
  const systemData: Record<string, Partial<AdminPage>> = (() => {
    try { return JSON.parse(localStorage.getItem('system_page_data') || '{}'); }
    catch { return {}; }
  })();

  const topItems: NavItem[] = SYSTEM_PAGES
    .filter(p => p.status === 'published' && (systemData[p.id]?.show_in_nav ?? p.show_in_nav))
    .map(p => ({
      id: p.id,
      to: p.slug ? `/${p.slug}` : '/',
      label: systemData[p.id]?.title ?? p.title,
      order: overrides[p.id] ?? (systemData[p.id]?.menu_order ?? p.menu_order),
    }));

  let stored: AdminPage[] = [];
  try {
    const s = localStorage.getItem('admin_pages');
    if (s) stored = JSON.parse(s);
  } catch { /* ignore */ }

  const published = stored.filter(p => p.status === 'published' && !p.system && p.slug && (p.show_in_nav ?? true));

  // Top-level custom pages (no parent)
  published.filter(p => !p.parent_id).forEach(p =>
    topItems.push({ id: p.id, to: `/${p.slug}`, label: p.title, order: p.menu_order })
  );

  // Build child map
  const childMap: Record<string, NavItem[]> = {};
  published.filter(p => p.parent_id).forEach(p => {
    if (!childMap[p.parent_id!]) childMap[p.parent_id!] = [];
    childMap[p.parent_id!].push({ id: p.id, to: `/${p.slug}`, label: p.title, order: p.menu_order });
  });

  return topItems
    .sort((a, b) => a.order - b.order)
    .map(item => ({
      ...item,
      children: childMap[item.id]
        ? childMap[item.id].sort((a, b) => a.order - b.order)
        : undefined,
    }));
}

export default function Navbar() {
  const [open, setOpen]         = useState(false);
  const [navItems, setNavItems] = useState<NavItem[]>(buildNavItems);
  const [mobileOpen, setMobileOpen] = useState<string | null>(null);

  useEffect(() => { setNavItems(buildNavItems()); }, []);

  // Rebuild nav items when any admin page is saved (slug changes, publishes, etc.)
  useEffect(() => {
    const handler = () => setNavItems(buildNavItems());
    window.addEventListener('admin_pages_updated', handler);
    return () => window.removeEventListener('admin_pages_updated', handler);
  }, []);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" onClick={() => setOpen(false)}>
            <Logo size={36} />
          </Link>

          {/* Desktop */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map(item =>
              item.children?.length ? (
                <div key={item.id} className="relative group">
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                        isActive
                          ? 'text-coral-500 bg-coral-50'
                          : 'text-gray-700 hover:text-coral-500 hover:bg-gray-50'
                      }`
                    }
                  >
                    {item.label}
                    <ChevronDown size={14} className="opacity-60 group-hover:rotate-180 transition-transform duration-150" />
                  </NavLink>
                  <div className="absolute top-full left-0 hidden group-hover:block pt-1 z-50">
                    <div className="bg-white shadow-lg rounded-xl py-1.5 min-w-[200px] border border-gray-100">
                      {item.children.map(child => (
                        <NavLink
                          key={child.id}
                          to={child.to}
                          className={({ isActive }) =>
                            `block px-4 py-2.5 text-sm transition-colors ${
                              isActive
                                ? 'text-coral-500 bg-coral-50 font-medium'
                                : 'text-gray-700 hover:text-coral-500 hover:bg-gray-50'
                            }`
                          }
                        >
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <NavLink
                  key={item.id}
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
              )
            )}
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
              <div key={item.id}>
                {item.children?.length ? (
                  <>
                    <button
                      onClick={() => setMobileOpen(mobileOpen === item.id ? null : item.id)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        size={16}
                        className={`text-gray-400 transition-transform duration-150 ${mobileOpen === item.id ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {mobileOpen === item.id && (
                      <div className="ml-4 space-y-0.5 mt-0.5 mb-1">
                        <NavLink
                          to={item.to}
                          end={item.to === '/'}
                          onClick={() => setOpen(false)}
                          className={({ isActive }) =>
                            `block px-4 py-2.5 rounded-lg text-sm transition-colors ${
                              isActive ? 'text-coral-500 bg-coral-50 font-medium' : 'text-gray-600 hover:bg-gray-50'
                            }`
                          }
                        >
                          {item.label} (vue d'ensemble)
                        </NavLink>
                        {item.children.map(child => (
                          <NavLink
                            key={child.id}
                            to={child.to}
                            onClick={() => setOpen(false)}
                            className={({ isActive }) =>
                              `block px-4 py-2.5 rounded-lg text-sm transition-colors ${
                                isActive ? 'text-coral-500 bg-coral-50 font-medium' : 'text-gray-600 hover:bg-gray-50'
                              }`
                            }
                          >
                            {child.label}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <NavLink
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
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
