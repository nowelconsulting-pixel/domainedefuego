// Canonical default content for all system pages.
// usePageContent(slug) falls back to these when no localStorage override exists.
const pageDefaults: Record<string, Record<string, unknown>> = {
  accueil: {
    // Héro
    hero_title: 'Chaque animal mérite un foyer',
    hero_subtitle: "Domaine de Fuego accompagne chiens, chats et autres animaux vers l'adoption responsable depuis 2016.",
    hero_badge: 'Association loi 1901 · Ardèche & Vaucluse',
    hero_bg_url: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1920&q=80',
    hero_cta1_label: 'Voir les animaux',
    hero_cta1_url: '/animaux',
    hero_cta2_label: 'Faire un don',
    hero_cta2_url: '/faire-un-don',
    // Section "Comment ça marche"
    how_title: 'Comment ça marche ?',
    how_subtitle: 'Un processus simple et bienveillant en 3 étapes',
    how_cta_label: 'Déposer une candidature',
    how_cta_url: '/adopter',
    etapes: [
      { num: '01', titre: 'Candidature', desc: 'Remplissez notre formulaire en ligne. Présentez-vous, votre logement et votre projet de vie avec un animal.' },
      { num: '02', titre: 'Entretien',   desc: "Un bénévole de l'association vous contacte pour échanger et vérifier la compatibilité avec l'animal." },
      { num: '03', titre: 'Adoption',    desc: "Signature du contrat d'adoption, versement de la participation aux frais, et votre nouveau compagnon rentre à la maison !" },
    ],
    // Section "Derniers arrivants"
    show_derniers: true,
    derniers_title: 'Derniers arrivants',
    derniers_subtitle: 'Ces animaux attendent leur famille idéale',
    // Témoignages
    temoignages_title: 'Ils ont adopté',
    temoignages_subtitle: 'Les témoignages de nos familles adoptantes',
    temoignages: [
      { texte: "Nous avons adopté Rex il y a 6 mois et c'est le plus beau cadeau qu'on se soit fait. L'équipe de Domaine de Fuego nous a accompagnés avec beaucoup de professionnalisme et de bienveillance.", auteur: 'Marie & Julien', lieu: 'Lyon (69)' },
      { texte: "Lola a rejoint notre famille et elle s'est intégrée en quelques jours seulement. Merci à l'association pour leur suivi post-adoption, c'est vraiment rassurant.", auteur: 'Pascal', lieu: 'Montpellier (34)' },
      { texte: "J'avais des craintes avec mes jeunes enfants mais l'association a très bien évalué la compatibilité. Mia adore nos enfants, c'est magique !", auteur: 'Sandrine', lieu: 'Paris (75)' },
    ],
    // Appel à l'action final
    cta_title: 'Prêt à changer une vie ?',
    cta_subtitle: "Devenez adoptant ou famille d'accueil — chaque geste compte pour nos animaux.",
    cta_btn1_label: 'Adopter un animal',
    cta_btn1_url: '/animaux',
    cta_btn2_label: "Devenir famille d'accueil",
    cta_btn2_url: '/famille-accueil',
    cta_btn3_label: 'Faire un don',
    cta_btn3_url: '/faire-un-don',
  },

  presentation: {
    hero_title: 'Notre association',
    hero_subtitle: 'Découvrez qui nous sommes, notre mission et nos valeurs.',
    mission_title: 'Notre mission',
    mission_text:
      "Domaine de Fuego est une association loi 1901 fondée en 2016 avec une conviction profonde : chaque animal mérite une vie digne, aimante et sécurisée.\n\nNous recueillons des chiens, chats et autres animaux abandonnés, maltraités ou en danger, et nous les confions à des familles d'accueil bienveillantes le temps de trouver la famille adoptante idéale.\n\nNous croyons que l'adoption est un acte de vie, un engagement sur la durée. C'est pourquoi nous accompagnons chaque adoptant avant, pendant et après l'adoption pour garantir le bonheur de l'animal et de sa nouvelle famille.\n\nBasés principalement en Ardèche et dans le Vaucluse, nous intervenons sur tout le territoire français grâce à notre réseau de bénévoles passionnés.",
    valeurs_title: 'Nos valeurs',
    valeurs: [
      { titre: 'Bienveillance', description: 'Chaque animal est traité avec respect, douceur et professionnalisme. Nous refusons toute méthode coercitive.' },
      { titre: 'Transparence',  description: "Nous sommes honnêtes sur le profil de chaque animal, ses besoins et son histoire pour garantir des adoptions durables." },
      { titre: 'Engagement',    description: "Nous accompagnons les adoptants sur le long terme. Une adoption n'est jamais une transaction — c'est un engagement mutuel." },
    ],
    show_equipe: true,
    equipe_title: 'Notre équipe',
    equipe: [
      { nom: 'Sophie Martin',   role: 'Fondatrice & Présidente',         photo: '' },
      { nom: 'Thomas Durand',   role: 'Responsable des adoptions',        photo: '' },
      { nom: 'Camille Bernard', role: "Coordinatrice familles d'accueil", photo: '' },
    ],
    show_partenaires: true,
    partenaires_title: 'Nos partenaires',
    partenaires: ["Mairie d'Aubenas", 'Clinique vétérinaire du Plateau', "Fondation 30 Millions d'Amis", "SPA de l'Ardèche"],
  },

  animaux: {
    hero_title: 'Nos animaux',
    hero_subtitle: 'Trouvez le compagnon qui vous correspond.',
  },

  adopter: {
    hero_title: 'Adopter un animal',
    hero_subtitle: "L'adoption est un engagement pour toute la vie de l'animal. Nous vous accompagnons à chaque étape.",
    process_steps: [
      { titre: '1. Candidature en ligne',   desc: "Remplissez notre formulaire. Nous avons besoin de bien vous connaître pour trouver l'animal qui vous correspond." },
      { titre: '2. Entretien téléphonique', desc: "Un bénévole vous rappelle pour échanger sur votre projet, vos attentes et vous présenter l'animal." },
      { titre: '3. Rencontre & adoption',   desc: "Rencontre avec l'animal, signature du contrat, paiement de la participation aux frais. Bienvenue dans la famille !" },
    ],
    show_conditions: true,
    conditions_title: "Conditions d'adoption",
    conditions: [
      { text: 'Être majeur' },
      { text: 'Avoir un logement adapté' },
      { text: "Avoir l'accord du propriétaire si locataire" },
      { text: "S'engager pour toute la vie de l'animal" },
      { text: 'Accepter une visite de contrôle à domicile' },
      { text: 'Payer la participation aux frais vétérinaires' },
    ],
    show_form: true,
    form_title: 'Formulaire de candidature',
  },

  'famille-accueil': {
    hero_title: "Devenir famille d'accueil",
    hero_subtitle: "En devenant famille d'accueil, vous offrez un foyer temporaire à un animal en attente d'adoption. Un geste simple, un impact immense.",
    avantages_title: "Pourquoi devenir famille d'accueil ?",
    avantages: [
      { titre: 'Chez vous',       desc: "L'animal vit dans votre foyer et s'intègre à votre quotidien dans un environnement chaleureux." },
      { titre: 'Lien unique',     desc: "Vous créez un lien fort avec l'animal le temps de son accueil, une expérience profondément humaine." },
      { titre: 'À votre rythme', desc: "Vous choisissez la durée et le type d'animal selon vos disponibilités et votre mode de vie." },
      { titre: 'Soutien complet', desc: "L'association prend en charge tous les frais vétérinaires et vous accompagne au quotidien." },
    ],
    show_faq: true,
    faq_title: 'Questions fréquentes',
    faq: [
      { q: "Est-ce que je peux adopter l'animal que j'accueille ?",
        r: "Oui, sous certaines conditions. Les familles d'accueil qui souhaitent adopter l'animal dont elles s'occupent sont souvent prioritaires, après validation par l'association." },
      { q: 'Qui paie les frais vétérinaires ?',
        r: "L'association prend en charge l'intégralité des frais vétérinaires (nourriture, soins, médicaments) pendant tout le séjour de l'animal chez vous." },
      { q: 'Combien de temps dure un accueil ?',
        r: "Cela dépend des situations. Un accueil peut durer quelques jours (urgence) ou plusieurs semaines/mois. Vous êtes consulté au préalable et vous restez libre d'accepter ou non." },
      { q: "Puis-je accueillir si j'ai déjà un animal ?",
        r: "Oui, dans la majorité des cas. Nous veillons à la compatibilité entre les animaux. Un test de rencontre est toujours organisé avant de confirmer l'accueil." },
    ],
    show_form: true,
    form_title: "Candidature famille d'accueil",
  },

  'faire-un-don': {
    hero_title: 'Faire un don',
    hero_subtitle: "Votre générosité permet à des centaines d'animaux de trouver une famille chaque année.",
    intro_title: 'Soutenez notre action',
    intro_text:
      "Domaine de Fuego fonctionne grâce aux dons de particuliers comme vous. Aucune subvention publique ne vient financer nos actions — c'est votre générosité qui permet à des centaines d'animaux de trouver une famille chaque année.\n\nVotre don, qu'il soit ponctuel ou mensuel, a un impact direct et concret sur la vie des animaux que nous prenons en charge.",
    helloasso_btn_label: 'Faire un don via HelloAsso',
    helloasso_note: "HelloAsso est une plateforme sécurisée. 100% de votre don va à l'association (aucune commission).",
    show_utilisations: true,
    utilisations_title: 'À quoi sert votre don ?',
    utilisations: [
      { titre: 'Soins vétérinaires',       description: "Vaccinations, stérilisations, traitements médicaux d'urgence pour les animaux en détresse.",         icone: 'Heart' },
      { titre: 'Hébergement & nourriture', description: "Prise en charge complète des animaux pendant leur séjour en famille d'accueil.",                     icone: 'Home'  },
      { titre: 'Sauvetages & transport',   description: "Interventions d'urgence, rapatriements et transports vers les familles d'accueil partout en France.", icone: 'Truck' },
    ],
    show_fiscal: true,
    fiscal_title: 'Réduction fiscale',
    fiscal_text: "En tant qu'association loi 1901 reconnue d'intérêt général, vos dons peuvent ouvrir droit à une réduction d'impôt de 66% dans la limite de 20% du revenu imposable. Un reçu fiscal vous sera envoyé par HelloAsso.",
  },

  contact: {
    hero_title: 'Contact',
    hero_subtitle: "Une question ? N'hésitez pas à nous écrire.",
    coordonnees_title: 'Nos coordonnées',
    reseaux_title: 'Réseaux sociaux',
    show_form: true,
    form_title: 'Envoyer un message',
  },

  'mentions-legales': {
    hero_title: 'Mentions légales',
    hero_subtitle: '',
  },
};

export default pageDefaults;
