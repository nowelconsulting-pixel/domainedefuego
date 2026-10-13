import type { Candidature } from '../types/admin';

export function getCandidatureTypeLabel(c: Candidature): string {
  if (c.type === 'adoption') return 'Adoption';
  if (c.type === 'fa') return "Famille d'accueil";
  if (c.type === 'contact') return 'Contact';
  if (c.type === 'adhesion') return 'Adhésion';
  return c.form_title || c.type;
}

export function getCandidatureTypeBadgeClass(c: Candidature): string {
  if (c.type === 'adoption') return 'bg-coral-100 text-coral-700';
  if (c.type === 'fa') return 'bg-blue-100 text-blue-700';
  if (c.type === 'contact') return 'bg-gray-100 text-gray-700';
  if (c.type === 'adhesion') return 'bg-green-100 text-green-700';
  return 'bg-purple-100 text-purple-700';
}
