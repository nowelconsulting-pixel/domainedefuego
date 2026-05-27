import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Heart, Shield, Tag,
  Dog, Cat, Baby, CheckCircle2, XCircle, Euro
} from 'lucide-react';
import { useAnimaux } from '../hooks/useData';
import { getAgeLabel, getPlaceholder } from '../types';
import { resolveImageUrl } from '../utils/image';

export default function AnimalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: animaux, loading } = useAnimaux();
  const [activePhoto, setActivePhoto] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nv-green" />
      </div>
    );
  }

  const animal = animaux?.find(a => a.id === id);

  if (!animal || animal.statut === 'Archivé' || animal.statut === 'Brouillon') {
    return (
      <div className="min-h-screen bg-page flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="text-6xl">🐾</div>
        <h1 className="text-2xl font-bold text-forest">Animal introuvable</h1>
        <p className="text-muted">Cet animal n'existe pas ou a déjà été adopté.</p>
        <Link to="/animaux" className="btn-primary">Voir tous les animaux</Link>
      </div>
    );
  }

  const Check = ({ ok, label }: { ok: boolean; label: string }) => (
    <div className="flex items-center gap-2">
      {ok ? (
        <CheckCircle2 size={18} className="text-nv-green flex-shrink-0" />
      ) : (
        <XCircle size={18} className="text-red-400 flex-shrink-0" />
      )}
      <span className={`text-sm ${ok ? 'text-forest' : 'text-hint'}`}>{label}</span>
    </div>
  );

  const badgeCls =
    animal.statut === 'Disponible'
      ? 'badge badge-available'
      : animal.statut === 'Réservé'
      ? 'badge badge-reserved'
      : 'badge badge-fostered';

  return (
    <div className="min-h-screen bg-page py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted hover:text-nv-green mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Retour
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Gallery */}
          <div>
            <div className="rounded-[20px] overflow-hidden bg-[#F5F3EF] border-2 border-site-border h-[400px]">
              {animal.photos.length > 0 ? (
                <img
                  src={resolveImageUrl(animal.photos[activePhoto])}
                  alt={`${animal.nom} - photo ${activePhoto + 1}`}
                  className="w-full h-full object-contain object-center"
                />
              ) : (
                <img
                  src={getPlaceholder(animal.espece)}
                  alt={animal.espece}
                  className="w-full h-full object-contain object-center opacity-50"
                />
              )}
            </div>
            {animal.photos.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                {animal.photos.map((photo, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhoto(i)}
                    className={`flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      i === activePhoto ? 'border-nv-green' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={resolveImageUrl(photo)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            {animal.video_youtube && (
              <div className="mt-4 rounded-xl overflow-hidden border-2 border-site-border aspect-video">
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
                <span className={`${badgeCls} mb-3`}>{animal.statut}</span>
              )}
              <h1 className="text-4xl font-extrabold text-forest mb-1 mt-2">{animal.nom}</h1>
              <p className="text-nv-teal font-semibold text-lg">
                {animal.espece} · {animal.race}
              </p>
            </div>

            {/* Identité */}
            <div className="bg-surface rounded-[20px] p-6 border-2 border-site-border">
              <h2 className="font-bold text-forest mb-4">Fiche d'identité</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm text-muted">
                  <Heart size={16} className="text-nv-teal flex-shrink-0" />
                  <span>{getAgeLabel(animal.naissance)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted">
                  <Shield size={16} className="text-nv-teal flex-shrink-0" />
                  <span>{animal.sexe}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted">
                  <MapPin size={16} className="text-nv-teal flex-shrink-0" />
                  <span>{animal.departement}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted">
                  <Tag size={16} className="text-nv-teal flex-shrink-0" />
                  <span>{animal.race}</span>
                </div>
              </div>
            </div>

            {/* Santé */}
            <div className="bg-surface rounded-[20px] p-6 border-2 border-site-border">
              <h2 className="font-bold text-forest mb-4">Santé</h2>
              <div className="space-y-2">
                <Check ok={animal.vaccine} label="Vacciné(e)" />
                <Check ok={animal.sterilise} label="Stérilisé(e)" />
                <Check ok={animal.identifie} label="Identifié(e) (puce / tatouage)" />
              </div>
            </div>

            {/* Ententes — only show if at least one value is known */}
            {(animal.entente_chiens !== null || animal.entente_chats !== null || animal.entente_enfants !== null) && (
              <div className="bg-surface rounded-[20px] p-6 border-2 border-site-border">
                <h2 className="font-bold text-forest mb-4">Ententes</h2>
                <div className="space-y-2">
                  {animal.entente_chiens !== null && (
                    <div className="flex items-center gap-2">
                      {animal.entente_chiens ? (
                        <CheckCircle2 size={18} className="text-nv-green" />
                      ) : (
                        <XCircle size={18} className="text-red-400" />
                      )}
                      <Dog size={16} className="text-hint" />
                      <span className={`text-sm ${animal.entente_chiens ? 'text-forest' : 'text-hint'}`}>
                        Entente avec les chiens
                      </span>
                    </div>
                  )}
                  {animal.entente_chats !== null && (
                    <div className="flex items-center gap-2">
                      {animal.entente_chats ? (
                        <CheckCircle2 size={18} className="text-nv-green" />
                      ) : (
                        <XCircle size={18} className="text-red-400" />
                      )}
                      <Cat size={16} className="text-hint" />
                      <span className={`text-sm ${animal.entente_chats ? 'text-forest' : 'text-hint'}`}>
                        Entente avec les chats
                      </span>
                    </div>
                  )}
                  {animal.entente_enfants !== null && (
                    <div className="flex items-center gap-2">
                      {animal.entente_enfants ? (
                        <CheckCircle2 size={18} className="text-nv-green" />
                      ) : (
                        <XCircle size={18} className="text-red-400" />
                      )}
                      <Baby size={16} className="text-hint" />
                      <span className={`text-sm ${animal.entente_enfants ? 'text-forest' : 'text-hint'}`}>
                        Entente avec les enfants
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Frais + Association */}
            <div className="bg-surface rounded-[20px] p-6 border-2 border-site-border">
              <div className="flex items-center gap-2 mb-2">
                <Euro size={18} className="text-nv-teal" />
                <span className="font-bold text-forest">
                  Participation aux frais : {animal.participation_frais} €
                </span>
              </div>
              <p className="text-xs text-hint mb-4">
                Couvre une partie des frais vétérinaires, vaccinations, identification.
              </p>
              <div className="border-t border-site-border pt-4">
                <p className="text-sm text-muted">
                  Prise en charge par{' '}
                  <span className="font-semibold text-forest">{animal.association_nom}</span>
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
              <div className="bg-page text-muted text-center py-4 rounded-xl font-medium border-2 border-site-border">
                Cet animal n'est plus disponible à l'adoption
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {animal.description && (
          <div className="mt-10 bg-surface rounded-[20px] p-8 border-2 border-site-border">
            <h2 className="text-xl font-bold text-forest mb-4">À propos de {animal.nom}</h2>
            <p className="text-muted leading-relaxed whitespace-pre-line">{animal.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
