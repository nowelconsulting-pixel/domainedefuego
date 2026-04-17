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

export type BlockType =
  | 'text' | 'image' | 'card' | 'cta' | 'gallery' | 'contact_form'
  | 'faq' | 'testimonial' | 'video' | 'separator' | 'columns2'
  | 'hero_banner' | 'stat' | 'team' | 'embed' | 'featured-article' | 'form';

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
  show_in_nav: boolean;
  show_in_footer: boolean;
  updatedAt: string;
  createdAt: string;
}

export type CandidatureStatus = 'nouvelle' | 'en_cours' | 'acceptee' | 'refusee';
export type CandidatureType = string;

export interface Candidature {
  id: string;
  type: CandidatureType;
  form_title?: string;
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

export const SYSTEM_PAGES: Pick<AdminPage, 'id' | 'title' | 'slug' | 'menu_order' | 'parent_id' | 'system' | 'status' | 'show_in_nav' | 'show_in_footer'>[] = [
  { id: 'sys-accueil',        title: 'Accueil',            slug: '',                menu_order: 0,  parent_id: null,              system: true, status: 'published', show_in_nav: true,  show_in_footer: false },
  { id: 'sys-presentation',   title: "L'association",      slug: 'presentation',    menu_order: 5,  parent_id: null,              system: true, status: 'published', show_in_nav: true,  show_in_footer: true  },
  { id: 'sys-actualites',     title: 'Actualités',         slug: 'actualites',      menu_order: 6,  parent_id: 'sys-presentation', system: true, status: 'published', show_in_nav: true,  show_in_footer: true  },
  { id: 'sys-devenir-membre', title: 'Devenir membre',     slug: 'devenir-membre',  menu_order: 7,  parent_id: 'sys-presentation', system: true, status: 'published', show_in_nav: true,  show_in_footer: true  },
  { id: 'sys-don',            title: 'Faire un don',       slug: 'faire-un-don',    menu_order: 8,  parent_id: 'sys-presentation', system: true, status: 'published', show_in_nav: true,  show_in_footer: true  },
  { id: 'sys-animaux',        title: 'Nos animaux',        slug: 'animaux',         menu_order: 10, parent_id: null,              system: true, status: 'published', show_in_nav: true,  show_in_footer: true  },
  { id: 'sys-adopter',        title: 'Adopter',            slug: 'adopter',         menu_order: 20, parent_id: null,              system: true, status: 'published', show_in_nav: true,  show_in_footer: true  },
  { id: 'sys-fa',             title: "Famille d'accueil",  slug: 'famille-accueil', menu_order: 30, parent_id: null,              system: true, status: 'published', show_in_nav: true,  show_in_footer: true  },
  { id: 'sys-contact',        title: 'Contact',            slug: 'contact',         menu_order: 50, parent_id: null,              system: true, status: 'published', show_in_nav: true,  show_in_footer: true  },
];
