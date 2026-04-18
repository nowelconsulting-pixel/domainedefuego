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
    `px-4 py-2 rounded-full text-base font-semibold transition-all duration-200 ${
      isActive
        ? 'bg-nv-green text-white shadow-sm'
        : 'text-gray-600 hover:text-forest hover:bg-nv-green-light'
    }`;

  return (
    <>
    <nav className="bg-white/95 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-50" style={{ boxShadow: '0 1px 24px rgba(0,0,0,0.07)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── MOBILE header : 3 colonnes symétriques ── */}
        <div className="flex lg:hidden items-center h-[64px]">
          {/* Colonne gauche : spacer = même largeur que le burger */}
          <div className="w-10 flex-shrink-0" />
          {/* Colonne centre : logo centré */}
          <div className="flex-1 flex justify-center">
            <Link to="/" onClick={() => setOpen(false)}>
              <Logo />
            </Link>
          </div>
          {/* Colonne droite : burger */}
          <button
            className="w-10 flex-shrink-0 flex items-center justify-center rounded-lg text-muted hover:bg-nv-green-light transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* ── DESKTOP header ── */}
        <div className="hidden lg:flex items-center justify-between h-[80px] gap-6">

          <Link to="/" onClick={() => setOpen(false)} className="flex-shrink-0">
            <Logo />
          </Link>

          {/* Desktop nav */}
          <div className="flex flex-1 justify-center items-center gap-2">
            {navItems.map(item =>
              item.children?.length ? (
                <div key={item.id} className="relative group">
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-1 px-4 py-2 rounded-full text-base font-semibold transition-all duration-200 ${
                        isActive ? 'bg-nv-green text-white shadow-sm' : 'text-gray-600 hover:text-forest hover:bg-nv-green-light'
                      }`
                    }
                  >
                    {item.label}
                    <ChevronDown size={13} className="opacity-60 group-hover:rotate-180 transition-transform duration-200" />
                  </NavLink>
                  <div className="absolute top-full left-0 hidden group-hover:block pt-2 z-50">
                    <div className="bg-white shadow-2xl rounded-2xl py-2 min-w-[210px] border border-gray-100" style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>
                      {item.children.map(child => (
                        <NavLink
                          key={child.id}
                          to={child.to}
                          className={({ isActive }) =>
                            `block px-5 py-2.5 text-[15px] font-medium transition-all duration-150 ${
                              isActive ? 'text-nv-green bg-nv-green-light font-semibold' : 'text-gray-600 hover:text-forest hover:bg-gray-50'
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
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="w-px h-6 bg-site-border" />
            <Link to="/faire-un-don" className="btn-don">
              Faire un don ♥
            </Link>
          </div>
        </div>
      </div>

      {/* ── Mobile menu déroulant ── */}
      {open && (
        <div className="lg:hidden border-t border-gray-200/60 bg-white max-h-[calc(100vh-64px)] overflow-y-auto">
          <div className="px-4 py-4 space-y-1">
            {navItems.map(item => (
              <div key={item.id}>
                {item.children?.length ? (
                  <>
                    <button
                      onClick={() => setMobileOpen(mobileOpen === item.id ? null : item.id)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-full text-sm font-semibold text-gray-600 hover:bg-nv-green-light/50 transition-colors"
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        size={15}
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
                            `block px-4 py-2.5 rounded-full text-sm transition-colors ${
                              isActive ? 'text-nv-green bg-nv-green-light font-semibold' : 'text-gray-600 hover:bg-nv-green-light/40'
                            }`
                          }
                        >
                          {item.label}
                        </NavLink>
                        {item.children.map(child => (
                          <NavLink
                            key={child.id}
                            to={child.to}
                            onClick={() => setOpen(false)}
                            className={({ isActive }) =>
                              `block px-4 py-2.5 rounded-full text-sm transition-colors ${
                                isActive ? 'text-nv-green bg-nv-green-light font-semibold' : 'text-gray-600 hover:bg-nv-green-light/40'
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
                        isActive ? 'text-nv-green bg-nv-green-light' : 'text-gray-600 hover:bg-nv-green-light/50'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                )}
              </div>
            ))}
            <div className="pt-3 border-t border-gray-100 mt-3">
              <Link to="/faire-un-don" onClick={() => setOpen(false)} className="btn-don w-full justify-center">
                Faire un don ♥
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
    <Link
      to="/faire-un-don"
      className="btn-don md:hidden fixed bottom-5 right-5 z-50 shadow-xl"
      style={{ borderRadius: '9999px' }}
    >
      Faire un don ♥
    </Link>
    </>
  );
}
