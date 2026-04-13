import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Save, Shield, AlertCircle } from 'lucide-react';
import { getSession } from '../../utils/auth';
import { useAdminUsers } from '../../hooks/useAdminData';
import {
  loadRoleConfigs, saveRoleConfigs,
  ALL_PERMISSIONS, PERMISSION_LABELS,
} from '../../utils/roles';
import type { RoleConfig, Permission } from '../../utils/roles';

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

interface ModalState {
  mode: 'add' | 'edit';
  role: RoleConfig;
}

export default function AdminRoles() {
  const session = getSession();
  const { users } = useAdminUsers();
  const [configs, setConfigs] = useState<RoleConfig[]>(loadRoleConfigs);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [error, setError] = useState('');

  if (!session || session.role !== 'superadmin') {
    return (
      <div className="p-8">
        <div className="flex items-center gap-3 p-5 bg-red-50 rounded-xl text-red-700">
          <AlertCircle size={22} />
          <div>
            <div className="font-semibold">Accès refusé</div>
            <div className="text-sm">Seul un Super Admin peut gérer les rôles.</div>
          </div>
        </div>
      </div>
    );
  }

  const persistConfigs = (updated: RoleConfig[]) => {
    setConfigs(updated);
    saveRoleConfigs(updated);
  };

  const openAdd = () => {
    setModal({
      mode: 'add',
      role: { id: '', label: '', system: false, permissions: [] },
    });
    setError('');
  };

  const openEdit = (role: RoleConfig) => {
    setModal({ mode: 'edit', role: { ...role, permissions: [...role.permissions] } });
    setError('');
  };

  const togglePermission = (perm: Permission) => {
    if (!modal) return;
    const perms = modal.role.permissions.includes(perm)
      ? modal.role.permissions.filter(p => p !== perm)
      : [...modal.role.permissions, perm];
    setModal({ ...modal, role: { ...modal.role, permissions: perms } });
  };

  const handleSave = () => {
    if (!modal) return;
    setError('');
    const { mode, role } = modal;

    if (!role.label.trim()) { setError('Le nom du rôle est obligatoire.'); return; }

    if (mode === 'add') {
      const id = slugify(role.label) || `role_${Date.now()}`;
      if (configs.find(r => r.id === id)) { setError('Un rôle avec ce nom existe déjà.'); return; }
      persistConfigs([...configs, { ...role, id }]);
    } else {
      persistConfigs(configs.map(r => r.id === role.id ? role : r));
    }
    setModal(null);
  };

  const handleDelete = (roleId: string) => {
    const assignedCount = users.filter(u => u.role === roleId).length;
    if (assignedCount > 0) {
      alert(`Impossible de supprimer ce rôle : ${assignedCount} utilisateur(s) y sont assignés.`);
      return;
    }
    if (!confirm('Supprimer ce rôle personnalisé ?')) return;
    persistConfigs(configs.filter(r => r.id !== roleId));
  };

  const PERMISSION_GROUPS: { label: string; perms: Permission[] }[] = [
    { label: 'Général',        perms: ['dashboard'] },
    { label: 'Animaux',        perms: ['animaux_read', 'animaux_write'] },
    { label: 'Pages',          perms: ['pages_read', 'pages_write'] },
    { label: 'Candidatures',   perms: ['candidatures'] },
    { label: 'Configuration',  perms: ['config'] },
    { label: 'Administration', perms: ['users', 'roles'] },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rôles & Permissions</h1>
          <p className="text-sm text-gray-500 mt-1">Configurez les droits d'accès pour chaque rôle.</p>
        </div>
        <button onClick={openAdd} className="btn-primary text-sm">
          <Plus size={16} />Nouveau rôle
        </button>
      </div>

      <div className="space-y-4">
        {configs.map(role => {
          const assignedCount = users.filter(u => u.role === role.id).length;
          return (
            <div key={role.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${role.id === 'superadmin' ? 'bg-purple-100' : 'bg-gray-100'}`}>
                    <Shield size={18} className={role.id === 'superadmin' ? 'text-purple-600' : 'text-gray-500'} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{role.label}</h3>
                      {role.system && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700">Système</span>
                      )}
                      {!role.system && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">Personnalisé</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {assignedCount} utilisateur{assignedCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {role.id !== 'superadmin' && (
                    <button onClick={() => openEdit(role)} title="Modifier les permissions"
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                      <Edit2 size={15} />
                    </button>
                  )}
                  {!role.system && (
                    <button onClick={() => handleDelete(role.id)} title="Supprimer"
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>

              {/* Permission badges */}
              <div className="flex flex-wrap gap-2">
                {ALL_PERMISSIONS.map(perm => (
                  <span
                    key={perm}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      role.permissions.includes(perm)
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-400 line-through'
                    }`}
                  >
                    {PERMISSION_LABELS[perm]}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b flex-shrink-0">
              <h2 className="text-lg font-semibold">
                {modal.mode === 'add' ? 'Nouveau rôle' : `Modifier — ${modal.role.label}`}
              </h2>
              <button onClick={() => setModal(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto">
              {modal.mode === 'add' && (
                <div>
                  <label className="form-label">Nom du rôle *</label>
                  <input
                    className="form-input"
                    value={modal.role.label}
                    onChange={e => setModal({ ...modal, role: { ...modal.role, label: e.target.value } })}
                    placeholder="Ex: Modérateur"
                  />
                </div>
              )}

              <div>
                <p className="form-label mb-3">Permissions</p>
                <div className="space-y-4">
                  {PERMISSION_GROUPS.map(group => (
                    <div key={group.label}>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{group.label}</p>
                      <div className="space-y-2">
                        {group.perms.map(perm => (
                          <label key={perm} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              className="w-4 h-4 accent-coral-500"
                              checked={modal.role.permissions.includes(perm)}
                              onChange={() => togglePermission(perm)}
                            />
                            <span className="text-sm text-gray-700">{PERMISSION_LABELS[perm]}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-red-700 text-sm">
                  <AlertCircle size={16} />{error}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t flex justify-end gap-3 flex-shrink-0">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                Annuler
              </button>
              <button onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2 bg-coral-500 hover:bg-coral-600 text-white rounded-lg text-sm font-semibold">
                <Save size={16} />Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
