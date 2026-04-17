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

  // Build all system page items (top-level and children)
  const allSystemItems = SYSTEM_PAGES
    .filter(p => p.status === 'published' && (systemData[p.id]?.show_in_nav ?? p.show_in_nav))
    .map(p => ({
      id: p.id,
      to: p.slug ? `/${p.slug}` : '/',
      label: systemData[p.id]?.title ?? p.title,
      order: overrides[p.id] ?? (systemData[p.id]?.menu_order ?? p.menu_order),
      parent_id: p.parent_id ?? null,
    }));

  let stored: AdminPage[] = [];
  try {
    const s = localStorage.getItem('admin_pages');
    if (s) stored = JSON.parse(s);
  } catch { /* ignore */ }

  const published = stored.filter(p => p.status === 'published' && !p.system && p.slug && (p.show_in_nav ?? true));

  // Build child map from both system children and custom pages
  const childMap: Record<string, NavItem[]> = {};

  allSystemItems.filter(p => p.parent_id).forEach(p => {
    if (!childMap[p.parent_id!]) childMap[p.parent_id!] = [];
    childMap[p.parent_id!].push({ id: p.id, to: p.to, label: p.label, order: p.order });
  });

  published.filter(p => !p.parent_id).forEach(p =>
    allSystemItems.push({ id: p.id, to: `/${p.slug}`, label: p.title, order: p.menu_order, parent_id: null })
  );
  published.filter(p => p.parent_id).forEach(p => {
    if (!childMap[p.parent_id!]) childMap[p.parent_id!] = [];
    childMap[p.parent_id!].push({ id: p.id, to: `/${p.slug}`, label: p.title, order: p.menu_order });
  });

  return allSystemItems
    .filter(p => !p.parent_id)
    .sort((a, b) => a.order - b.order)
    .map(item => ({
      ...item,
      children: childMap[item.id]
        ? childMap[item.id].sort((a, b) => a.order - b.order)
        : undefined,
    }));
}

export default function Navbar() {
  const [open, setOpen]             = useState(false);
  const [navItems, setNavItems]     = useState<NavItem[]>(buildNavItems);
  const [mobileOpen, setMobileOpen] = useState<string | null>(null);

  useEffect(() => { setNavItems(buildNavItems()); }, []);

  useEffect(() => {
    const handler = () => setNavItems(buildNavItems());
    window.addEventListener('admin_pages_updated', handler);
    return () => window.removeEventListener('admin_pages_updated', handler);
  }, []);

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded-full text-base font-semibold transition-colors duration-150 ${
      isActive
        ? 'bg-nv-green-light text-nv-green'
        : 'text-muted hover:text-forest hover:bg-nv-green-light/50'
    }`;

  return (
    <nav className="bg-surface border-b-2 border-site-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[80px] gap-6">

          {/* Logo */}
          <Link to="/" onClick={() => setOpen(false)} className="flex-shrink-0">
            <Logo size={54} />
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex flex-1 justify-center items-center gap-2">
            {navItems.map(item =>
              item.children?.length ? (
                <div key={item.id} className="relative group">
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-1 px-4 py-2 rounded-full text-base font-semibold transition-colors duration-150 ${
                        isActive ? 'bg-nv-green-light text-nv-green' : 'text-muted hover:text-forest hover:bg-nv-green-light/50'
                      }`
                    }
                  >
                    {item.label}
                    <ChevronDown size={13} className="opacity-60 group-hover:rotate-180 transition-transform duration-200" />
                  </NavLink>
                  <div className="absolute top-full left-0 hidden group-hover:block pt-2 z-50">
                    <div className="bg-surface shadow-xl rounded-xl py-1.5 min-w-[200px] border border-site-border">
                      {item.children.map(child => (
                        <NavLink
                          key={child.id}
                          to={child.to}
                          className={({ isActive }) =>
                            `block px-4 py-2.5 text-base transition-colors ${
                              isActive ? 'text-nv-green bg-nv-green-light font-semibold' : 'text-muted hover:text-forest hover:bg-nv-green-light/40'
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
                <NavLink key={item.id} to={item.to} end={item.to === '/'} className={linkCls}>
                  {item.label}
                </NavLink>
              )
            )}
          </div>

          {/* Desktop — divider + btn-don */}
          <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
            <div className="w-px h-6 bg-site-border" />
            <Link to="/faire-un-don" className="btn-don">
              Faire un don ♥
            </Link>
          </div>

          {/* Mobile burger */}
          <button
            className="lg:hidden p-2 rounded-lg text-muted hover:bg-nv-green-light transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t-2 border-site-border bg-surface/95 backdrop-blur-md max-h-[calc(100vh-80px)] overflow-y-auto">
          <div className="px-4 py-4 space-y-1">
            {navItems.map(item => (
              <div key={item.id}>
                {item.children?.length ? (
                  <>
                    <button
                      onClick={() => setMobileOpen(mobileOpen === item.id ? null : item.id)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-full text-sm font-semibold text-muted hover:bg-nv-green-light/50 transition-colors"
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        size={15}
                        className={`text-hint transition-transform duration-150 ${mobileOpen === item.id ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {mobileOpen === item.id && (
                      <div className="ml-4 space-y-0.5 mt-0.5 mb-1">
                        <NavLink
                          to={item.to}
                          end={item.to === '/'}
                          onClick={() => setOpen(false)}
                          className={({ isActive }) =>
                            `block px-4 py-2.5 rounded-full text-sm transition-colors ${
                              isActive ? 'text-nv-green bg-nv-green-light font-semibold' : 'text-muted hover:bg-nv-green-light/40'
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
                              `block px-4 py-2.5 rounded-full text-sm transition-colors ${
                                isActive ? 'text-nv-green bg-nv-green-light font-semibold' : 'text-muted hover:bg-nv-green-light/40'
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
                      `block px-4 py-3 rounded-full text-sm font-semibold transition-colors ${
                        isActive ? 'text-nv-green bg-nv-green-light' : 'text-muted hover:bg-nv-green-light/50'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                )}
              </div>
            ))}

            {/* btn-don in mobile */}
            <div className="pt-3 border-t border-site-border mt-3">
              <Link to="/faire-un-don" onClick={() => setOpen(false)} className="btn-don w-full justify-center">
                Faire un don ♥
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
