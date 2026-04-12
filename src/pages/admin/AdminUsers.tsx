import { useState } from 'react';
import { Plus, Edit2, UserX, UserCheck, X, Save, AlertCircle } from 'lucide-react';
import { useAdminUsers } from '../../hooks/useAdminData';
import { hashPassword, getSession } from '../../utils/auth';
import type { AdminUser, Role } from '../../types/admin';
import { ROLE_LABELS, ROLE_COLORS, canManageUsers } from '../../types/admin';

type ModalMode = 'add' | 'edit';

interface FormUser {
  id?: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  active: boolean;
}

const EMPTY: FormUser = { name: '', email: '', password: '', role: 'editeur', active: true };

export default function AdminUsers() {
  const { users, save } = useAdminUsers();
  const session = getSession();
  const [modal, setModal] = useState<{ mode: ModalMode; data: FormUser } | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!session || !canManageUsers(session.role)) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-3 p-5 bg-red-50 rounded-xl text-red-700">
          <AlertCircle size={22} />
          <div>
            <div className="font-semibold">Accès refusé</div>
            <div className="text-sm">Seul un Super Admin peut gérer les utilisateurs.</div>
          </div>
        </div>
      </div>
    );
  }

  const openAdd = () => { setModal({ mode: 'add', data: { ...EMPTY } }); setError(''); };
  const openEdit = (u: AdminUser) => {
    setModal({ mode: 'edit', data: { id: u.id, name: u.name, email: u.email, password: '', role: u.role, active: u.active } });
    setError('');
  };

  const set = <K extends keyof FormUser>(k: K, v: FormUser[K]) =>
    setModal(prev => prev ? { ...prev, data: { ...prev.data, [k]: v } } : null);

  const handleSave = async () => {
    if (!modal) return;
    const { mode, data } = modal;
    setError(''); setSaving(true);

    if (!data.name.trim() || !data.email.trim()) {
      setError('Nom et email obligatoires.'); setSaving(false); return;
    }
    if (mode === 'add' && !data.password) {
      setError('Mot de passe obligatoire à la création.'); setSaving(false); return;
    }
    const emailExists = users.some(u => u.email.toLowerCase() === data.email.toLowerCase() && u.id !== data.id);
    if (emailExists) {
      setError('Cet email est déjà utilisé.'); setSaving(false); return;
    }

    try {
      if (mode === 'add') {
        const hash = await hashPassword(data.password);
        const newUser: AdminUser = {
          id: `user-${Date.now()}`,
          name: data.name,
          email: data.email,
          passwordHash: hash,
          role: data.role,
          active: data.active,
          createdAt: new Date().toISOString(),
        };
        save([...users, newUser]);
      } else {
        const updated = await Promise.all(users.map(async u => {
          if (u.id !== data.id) return u;
          const passwordHash = data.password ? await hashPassword(data.password) : u.passwordHash;
          return { ...u, name: data.name, email: data.email, role: data.role, active: data.active, passwordHash };
        }));
        save(updated);
      }
      setModal(null);
    } catch {
      setError('Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = (u: AdminUser) => {
    if (u.role === 'superadmin') return; // can't deactivate super admin
    save(users.map(usr => usr.id === u.id ? { ...usr, active: !usr.active } : usr));
  };

  const formatDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—';

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
        <button onClick={openAdd} className="btn-primary text-sm">
          <Plus size={16} />Ajouter un utilisateur
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Nom</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Email</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Rôle</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 hidden md:table-cell">Dernière connexion</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Statut</th>
              <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map(u => (
              <tr key={u.id} className={`hover:bg-gray-50 ${!u.active ? 'opacity-60' : ''}`}>
                <td className="py-3 px-4 font-medium text-gray-900">{u.name}</td>
                <td className="py-3 px-4 text-gray-500">{u.email}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[u.role]}`}>
                    {ROLE_LABELS[u.role]}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-400 text-xs hidden md:table-cell">{formatDate(u.lastLogin)}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {u.active ? 'Actif' : 'Désactivé'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => openEdit(u)} title="Modifier" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                      <Edit2 size={15} />
                    </button>
                    {u.role !== 'superadmin' && (
                      <button onClick={() => toggleActive(u)} title={u.active ? 'Désactiver' : 'Activer'}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                        {u.active ? <UserX size={15} /> : <UserCheck size={15} />}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">{modal.mode === 'add' ? 'Ajouter un utilisateur' : 'Modifier l\'utilisateur'}</h2>
              <button onClick={() => setModal(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="form-label">Nom complet *</label>
                <input className="form-input" value={modal.data.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Email *</label>
                <input type="email" className="form-input" value={modal.data.email} onChange={e => set('email', e.target.value)} />
              </div>
              <div>
                <label className="form-label">
                  Mot de passe {modal.mode === 'edit' && <span className="text-gray-400 font-normal">(laisser vide = inchangé)</span>}
                </label>
                <input type="password" className="form-input" value={modal.data.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder={modal.mode === 'edit' ? '••••••••' : 'Mot de passe initial'} />
              </div>
              <div>
                <label className="form-label">Rôle *</label>
                <select className="form-input" value={modal.data.role} onChange={e => set('role', e.target.value as Role)}>
                  {(Object.entries(ROLE_LABELS) as [Role, string][]).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" className="w-4 h-4 accent-coral-500" checked={modal.data.active}
                  onChange={e => set('active', e.target.checked)} />
                Compte actif
              </label>
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-red-700 text-sm">
                  <AlertCircle size={16} />{error}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-coral-500 hover:bg-coral-600 text-white rounded-lg text-sm font-semibold disabled:opacity-60">
                <Save size={16} />{saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
