export interface Animal {
  id: string;
  nom: string;
  espece: 'Chien' | 'Chat' | 'Lapin' | 'Autre';
  race: string;
  naissance: number;
  sexe: 'Mâle' | 'Femelle';
  departement: string;
  statut: 'Disponible' | 'En famille d\'accueil' | 'Réservé' | 'Adopté' | 'Archivé';
  description: string;
  entente_chiens: boolean;
  entente_chats: boolean;
  entente_enfants: boolean;
  vaccine: boolean;
  sterilise: boolean;
  identifie: boolean;
  participation_frais: number;
  association_nom: string;
  association_ville: string;
  photos: string[];
  video_youtube?: string;
}

export interface Config {
  email_destinataire: string;
  helloasso_url: string;
  facebook_url: string;
  instagram_url: string;
  linkedin_url: string;
  telephone: string;
  adresse: string;
  email_contact: string;
  chiffres: {
    animaux_adoptes: number;
    familles_accueil: number;
    annees_existence: number;
    custom: { label: string; value: number }[];
  };
}

export interface Pages {
  presentation: {
    titre: string;
    texte: string;
    valeurs: { titre: string; description: string }[];
    equipe: { nom: string; role: string; photo: string }[];
    partenaires: string[];
  };
  faire_un_don: {
    titre: string;
    texte: string;
    utilisations: { titre: string; description: string; icone: string }[];
  };
}

export function getAge(naissance: number): string {
  const age = new Date().getFullYear() - naissance;
  if (age <= 2) return 'Junior';
  if (age <= 8) return 'Adulte';
  return 'Senior';
}

export function getAgeLabel(naissance: number): string {
  const age = new Date().getFullYear() - naissance;
  if (age < 1) return 'Moins d\'1 an';
  if (age === 1) return '1 an';
  return `${age} ans`;
}
