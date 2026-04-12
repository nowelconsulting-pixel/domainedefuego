export type Role = 'superadmin' | 'admin' | 'editeur' | 'benevole';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  active: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface AdminSession {
  userId: string;
  name: string;
  email: string;
  role: Role;
}

export type BlockType = 'text' | 'image' | 'card' | 'cta' | 'gallery' | 'contact_form';

export interface Block {
  id: string;
  type: BlockType;
  data: Record<string, string | string[]>;
}

export interface AdminPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  blocks: Block[];
  seo_description: string;
  menu_icon: string;
  menu_order: number;
  parent_id: string | null;
  status: 'published' | 'draft';
  system: boolean;
  updatedAt: string;
  createdAt: string;
}

export type CandidatureStatus = 'nouvelle' | 'en_cours' | 'acceptee' | 'refusee';
export type CandidatureType = 'adoption' | 'fa';

export interface Candidature {
  id: string;
  type: CandidatureType;
  status: CandidatureStatus;
  animal?: string;
  nom: string;
  email: string;
  telephone: string;
  data: Record<string, string>;
  notes: string;
  createdAt: string;
}

export const ROLE_LABELS: Record<Role, string> = {
  superadmin: 'Super Admin',
  admin: 'Administrateur',
  editeur: 'Éditeur',
  benevole: 'Bénévole',
};

export const ROLE_COLORS: Record<Role, string> = {
  superadmin: 'bg-purple-100 text-purple-700',
  admin: 'bg-blue-100 text-blue-700',
  editeur: 'bg-green-100 text-green-700',
  benevole: 'bg-yellow-100 text-yellow-700',
};

// Role permissions
export function canManageUsers(role: Role) { return role === 'superadmin'; }
export function canEditConfig(role: Role) { return role === 'superadmin' || role === 'admin'; }
export function canEditPages(role: Role) { return role !== 'benevole'; }
export function canEditAnimaux(_role: Role) { return true; }

export const SYSTEM_PAGES: Pick<AdminPage, 'id' | 'title' | 'slug' | 'menu_order' | 'system' | 'status'>[] = [
  { id: 'sys-accueil',   title: 'Accueil',            slug: '',               menu_order: 0,  system: true, status: 'published' },
  { id: 'sys-animaux',   title: 'Nos animaux',        slug: 'animaux',        menu_order: 10, system: true, status: 'published' },
  { id: 'sys-adopter',   title: 'Adopter',            slug: 'adopter',        menu_order: 20, system: true, status: 'published' },
  { id: 'sys-fa',        title: "Famille d'accueil",  slug: 'famille-accueil',menu_order: 30, system: true, status: 'published' },
  { id: 'sys-don',       title: 'Faire un don',       slug: 'faire-un-don',   menu_order: 40, system: true, status: 'published' },
  { id: 'sys-contact',   title: 'Contact',            slug: 'contact',        menu_order: 50, system: true, status: 'published' },
];
