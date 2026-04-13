export type Permission =
  | 'dashboard'
  | 'animaux_read'
  | 'animaux_write'
  | 'pages_read'
  | 'pages_write'
  | 'candidatures'
  | 'config'
  | 'users'
  | 'roles';

export const PERMISSION_LABELS: Record<Permission, string> = {
  dashboard:      'Voir le tableau de bord',
  animaux_read:   'Voir les animaux',
  animaux_write:  'Gérer les animaux (ajout, modification, suppression)',
  pages_read:     'Voir les pages',
  pages_write:    'Gérer les pages (création, modification)',
  candidatures:   'Gérer les candidatures',
  config:         'Gérer la configuration',
  users:          'Gérer les utilisateurs',
  roles:          'Gérer les rôles',
};

export const ALL_PERMISSIONS: Permission[] = [
  'dashboard',
  'animaux_read', 'animaux_write',
  'pages_read', 'pages_write',
  'candidatures',
  'config',
  'users',
  'roles',
];

export interface RoleConfig {
  id: string;
  label: string;
  system: boolean; // built-in roles cannot be deleted
  permissions: Permission[];
}

const DEFAULT_ROLE_CONFIGS: RoleConfig[] = [
  {
    id: 'superadmin', label: 'Super Admin', system: true,
    permissions: [...ALL_PERMISSIONS],
  },
  {
    id: 'admin', label: 'Administrateur', system: true,
    permissions: ['dashboard','animaux_read','animaux_write','pages_read','pages_write','candidatures','config'],
  },
  {
    id: 'editeur', label: 'Éditeur', system: true,
    permissions: ['dashboard','animaux_read','animaux_write','pages_read','pages_write','candidatures'],
  },
  {
    id: 'benevole', label: 'Bénévole', system: true,
    permissions: ['dashboard','animaux_read','animaux_write'],
  },
];

export function loadRoleConfigs(): RoleConfig[] {
  try {
    const stored = localStorage.getItem('role_configs');
    if (stored) {
      const parsed: RoleConfig[] = JSON.parse(stored);
      // Ensure all system roles are present
      const ids = parsed.map(r => r.id);
      const missing = DEFAULT_ROLE_CONFIGS.filter(r => !ids.includes(r.id));
      return [...missing, ...parsed];
    }
  } catch { /* ignore */ }
  return DEFAULT_ROLE_CONFIGS;
}

export function saveRoleConfigs(configs: RoleConfig[]): void {
  localStorage.setItem('role_configs', JSON.stringify(configs));
}

export function getRoleLabel(roleId: string): string {
  const configs = loadRoleConfigs();
  return configs.find(r => r.id === roleId)?.label ?? roleId;
}
