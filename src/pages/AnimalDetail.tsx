import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Heart, Shield, Tag,
  Dog, Cat, Baby, CheckCircle2, XCircle, Euro
} from 'lucide-react';
import { useAnimaux } from '../hooks/useData';
import { getAgeLabel } from '../types';

export default function AnimalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: animaux, loading } = useAnimaux();
  const [activePhoto, setActivePhoto] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-500" />
      </div>
    );
  }

  const animal = animaux?.find(a => a.id === id);

  if (!animal || animal.statut === 'Archivé') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="text-6xl">🐾</div>
        <h1 className="text-2xl font-bold text-gray-900">Animal introuvable</h1>
        <p className="text-gray-500">Cet animal n'existe pas ou a déjà été adopté.</p>
        <Link to="/animaux" className="btn-primary">Voir tous les animaux</Link>
      </div>
    );
  }

  const Check = ({ ok, label }: { ok: boolean; label: string }) => (
    <div className="flex items-center gap-2">
      {ok ? (
        <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
      ) : (
        <XCircle size={18} className="text-red-400 flex-shrink-0" />
      )}
      <span className={`text-sm ${ok ? 'text-gray-700' : 'text-gray-400'}`}>{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-coral-500 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Retour
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Gallery */}
          <div>
            <div className="rounded-2xl overflow-hidden bg-white shadow-md aspect-[4/3]">
              {animal.photos.length > 0 ? (
                <img
                  src={animal.photos[activePhoto]}
                  alt={`${animal.nom} - photo ${activePhoto + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-6xl">
                  🐾
                </div>
              )}
            </div>
            {animal.photos.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                {animal.photos.map((photo, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhoto(i)}
                    className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      i === activePhoto ? 'border-coral-500' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            {animal.video_youtube && (
              <div className="mt-4 rounded-xl overflow-hidden shadow-md aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${animal.video_youtube}`}
                  title={`Vidéo de ${animal.nom}`}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              {animal.statut !== 'Disponible' && (
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-3 ${
                  animal.statut === 'Réservé' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {animal.statut}
                </span>
              )}
              <h1 className="text-4xl font-bold text-gray-900 mb-1">{animal.nom}</h1>
              <p className="text-coral-500 font-medium text-lg">
                {animal.espece} · {animal.race}
              </p>
            </div>

            {/* Identité */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-4">Fiche d'identité</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Heart size={16} className="text-coral-400" />
                  <span>{getAgeLabel(animal.naissance)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Shield size={16} className="text-coral-400" />
                  <span>{animal.sexe}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <MapPin size={16} className="text-coral-400" />
                  <span>{animal.departement}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Tag size={16} className="text-coral-400" />
                  <span>{animal.race}</span>
                </div>
              </div>
            </div>

            {/* Santé */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-4">Santé</h2>
              <div className="space-y-2">
                <Check ok={animal.vaccine} label="Vacciné(e)" />
                <Check ok={animal.sterilise} label="Stérilisé(e)" />
                <Check ok={animal.identifie} label="Identifié(e) (puce / tatouage)" />
              </div>
            </div>

            {/* Ententes */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-4">Ententes</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {animal.entente_chiens ? (
                    <CheckCircle2 size={18} className="text-green-500" />
                  ) : (
                    <XCircle size={18} className="text-red-400" />
                  )}
                  <Dog size={16} className="text-gray-400" />
                  <span className={`text-sm ${animal.entente_chiens ? 'text-gray-700' : 'text-gray-400'}`}>
                    Entente avec les chiens
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {animal.entente_chats ? (
                    <CheckCircle2 size={18} className="text-green-500" />
                  ) : (
                    <XCircle size={18} className="text-red-400" />
                  )}
                  <Cat size={16} className="text-gray-400" />
                  <span className={`text-sm ${animal.entente_chats ? 'text-gray-700' : 'text-gray-400'}`}>
                    Entente avec les chats
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {animal.entente_enfants ? (
                    <CheckCircle2 size={18} className="text-green-500" />
                  ) : (
                    <XCircle size={18} className="text-red-400" />
                  )}
                  <Baby size={16} className="text-gray-400" />
                  <span className={`text-sm ${animal.entente_enfants ? 'text-gray-700' : 'text-gray-400'}`}>
                    Entente avec les enfants
                  </span>
                </div>
              </div>
            </div>

            {/* Frais + Association */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Euro size={18} className="text-coral-400" />
                <span className="font-semibold text-gray-900">
                  Participation aux frais : {animal.participation_frais} €
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Couvre une partie des frais vétérinaires, vaccinations, identification.
              </p>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-600">
                  Prise en charge par{' '}
                  <span className="font-medium text-gray-900">{animal.association_nom}</span>
                  {animal.association_ville && ` — ${animal.association_ville}`}
                </p>
              </div>
            </div>

            {/* CTA */}
            {animal.statut === 'Disponible' ? (
              <Link
                to={`/adopter?animal=${encodeURIComponent(animal.nom)}`}
                className="btn-primary w-full justify-center text-base py-4"
              >
                <Heart size={20} />
                Adopter {animal.nom}
              </Link>
            ) : (
              <div className="bg-gray-100 text-gray-500 text-center py-4 rounded-xl font-medium">
                Cet animal n'est plus disponible à l'adoption
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {animal.description && (
          <div className="mt-10 bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">À propos de {animal.nom}</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{animal.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
