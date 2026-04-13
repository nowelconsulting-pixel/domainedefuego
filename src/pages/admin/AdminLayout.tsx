import { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import {
  PawPrint, FileText, Settings, LogOut, Home,
  LayoutDashboard, Users, Inbox, Shield
} from 'lucide-react';
import { getSession, clearSession } from '../../utils/auth';
import type { AdminSession } from '../../types/admin';
import { ROLE_LABELS } from '../../types/admin';
import { useAnimaux } from '../../hooks/useData';
import { useCandidatures } from '../../hooks/useAdminData';

export default function AdminLayout() {
  const navigate = useNavigate();
  const [session, setSession] = useState<AdminSession | null>(null);

  const { data: animaux } = useAnimaux();
  const { unread } = useCandidatures();

  useEffect(() => {
    const s = getSession();
    if (!s) { navigate('/admin', { replace: true }); return; }
    setSession(s);
  }, [navigate]);

  const logout = () => {
    clearSession();
    navigate('/admin', { replace: true });
  };

  const disponibles = animaux?.filter(a => a.statut === 'Disponible').length ?? 0;

  const navItem = (to: string, Icon: React.ElementType, label: string, badge?: number) => (
    <NavLink
      key={to}
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive ? 'bg-coral-500 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
        }`
      }
    >
      <Icon size={18} className="flex-shrink-0" />
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </NavLink>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-900 text-white flex flex-col flex-shrink-0 fixed top-0 left-0 bottom-0 z-20">
        <div className="p-4 border-b border-gray-800">
          <div className="text-white font-bold">Administration</div>
          <div className="text-gray-400 text-xs mt-0.5">Domaine de Fuego</div>
        </div>

        {session && (
          <div className="px-4 py-3 border-b border-gray-800">
            <div className="text-sm font-medium text-white truncate">{session.name}</div>
            <div className="text-xs text-gray-400 truncate">{ROLE_LABELS[session.role]}</div>
          </div>
        )}

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItem('/admin/dashboard', LayoutDashboard, 'Tableau de bord')}

          {navItem('/admin/animaux', PawPrint, 'Animaux', disponibles > 0 ? disponibles : undefined)}

          {navItem('/admin/pages', FileText, 'Pages')}
          {navItem('/admin/candidatures', Inbox, 'Candidatures', unread)}
          {navItem('/admin/users', Users, 'Utilisateurs')}
          {session?.role === 'superadmin' && navItem('/admin/roles', Shield, 'Rôles & Permissions')}
          {navItem('/admin/config', Settings, 'Configuration')}
        </nav>

        <div className="p-3 border-t border-gray-800 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <Home size={18} />
            Voir le site
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-60 overflow-auto min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
