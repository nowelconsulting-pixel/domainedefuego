import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin } from 'lucide-react';
import type { Animal } from '../types';
import { getAge, getAgeLabel } from '../types';

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

  const age = getAge(animal.naissance);
  const ageLabel = getAgeLabel(animal.naissance);
  const photo = animal.photos[0] || 'https://images.unsplash.com/photo-1548681528-6a5c45b66b42?w=400&q=80';

  return (
    <Link to={`/animaux/${animal.id}`} className="card group block">
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={photo}
          alt={animal.nom}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button
          onClick={toggleLike}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform"
          aria-label={liked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Heart
            size={18}
            className={liked ? 'fill-coral-500 text-coral-500' : 'text-gray-400'}
          />
        </button>
        {animal.statut !== 'Disponible' && (
          <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-semibold ${
            animal.statut === 'Réservé' ? 'bg-orange-400 text-white' : 'bg-gray-500 text-white'
          }`}>
            {animal.statut}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-lg mb-1">{animal.nom}</h3>
        <p className="text-coral-500 text-sm font-medium">
          {animal.espece} · {ageLabel} · {animal.sexe}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {age}
        </p>
        <div className="flex items-center gap-1 mt-2 text-gray-400 text-xs">
          <MapPin size={12} />
          <span>{animal.departement}</span>
        </div>
      </div>
    </Link>
  );
}
