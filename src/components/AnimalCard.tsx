import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin } from 'lucide-react';
import type { Animal } from '../types';
import { getAgeLabel } from '../types';

interface AnimalCardProps {
  animal: Animal;
}

export default function AnimalCard({ animal }: AnimalCardProps) {
  const [liked, setLiked] = useState(() => {
    const stored = localStorage.getItem('favoris');
    if (stored) {
      const favs: string[] = JSON.parse(stored);
      return favs.includes(animal.id);
    }
    return false;
  });

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const stored = localStorage.getItem('favoris');
    let favs: string[] = stored ? JSON.parse(stored) : [];
    if (liked) {
      favs = favs.filter(id => id !== animal.id);
    } else {
      favs.push(animal.id);
    }
    localStorage.setItem('favoris', JSON.stringify(favs));
    setLiked(!liked);
  };

  const ageLabel = getAgeLabel(animal.naissance);
  const photo = animal.photos[0] || 'https://images.unsplash.com/photo-1548681528-6a5c45b66b42?w=400&q=80';

  const badgeCls =
    animal.statut === 'Disponible'
      ? 'badge badge-available'
      : animal.statut === 'Réservé'
      ? 'badge badge-reserved'
      : 'badge badge-fostered';

  return (
    <Link
      to={`/animaux/${animal.id}`}
      className="group block rounded-[20px] overflow-hidden border-2 border-site-border bg-surface transition-all duration-200 hover:-translate-y-1 hover:border-nv-green hover:shadow-lg"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <img
          src={photo}
          alt={animal.nom}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Like button */}
        <button
          onClick={toggleLike}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform"
          aria-label={liked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Heart
            size={17}
            className={liked ? 'fill-nv-green text-nv-green' : 'text-hint'}
          />
        </button>

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <span className={badgeCls}>{animal.statut}</span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 pb-5">
        <h3 className="font-extrabold text-forest text-lg leading-tight mb-1">{animal.nom}</h3>
        <p className="text-nv-teal text-sm font-semibold tracking-wide">
          {animal.espece} · {ageLabel} · {animal.sexe}
        </p>
        {animal.departement && (
          <div className="flex items-center gap-1 mt-1.5 text-hint text-xs">
            <MapPin size={11} />
            <span>{animal.departement}</span>
          </div>
        )}
        <div className="mt-3">
          <span className="btn-primary text-sm w-full justify-center">
            Voir la fiche →
          </span>
        </div>
      </div>
    </Link>
  );
}
