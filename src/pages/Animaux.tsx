import { useState, useMemo } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import AnimalCard from '../components/AnimalCard';
import { useAnimaux } from '../hooks/useData';
import { getAge } from '../types';

type EspeceFilter = 'Tous' | 'Chien' | 'Chat' | 'Lapin' | 'Autre';
type AgeFilter = 'Tous' | 'Junior' | 'Adulte' | 'Senior';
type SexeFilter = 'Tous' | 'Mâle' | 'Femelle';
type LocalisationFilter = 'Tous' | 'Refuge' | 'Famille d\'accueil';

export default function Animaux() {
  const { data: animaux, loading } = useAnimaux();
  const [espece, setEspece] = useState<EspeceFilter>('Tous');
  const [age, setAge] = useState<AgeFilter>('Tous');
  const [sexe, setSexe] = useState<SexeFilter>('Tous');
  const [localisation, setLocalisation] = useState<LocalisationFilter>('Tous');

  const filtered = useMemo(() => {
    if (!animaux) return [];
    return animaux.filter(a => {
      if (a.statut === 'Adopté' || a.statut === 'Archivé') return false;
      if (espece !== 'Tous' && a.espece !== espece) return false;
      if (age !== 'Tous' && getAge(a.naissance) !== age) return false;
      if (sexe !== 'Tous' && a.sexe !== sexe) return false;
      if (localisation !== 'Tous' && a.localisation !== localisation) return false;
      return true;
    });
  }, [animaux, espece, age, sexe, localisation]);

  const FilterBtn = <T extends string>({
    value,
    current,
    set,
  }: {
    value: T;
    current: T;
    set: (v: T) => void;
  }) => (
    <button
      onClick={() => set(value)}
      className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
        current === value
          ? 'bg-nv-green text-white'
          : 'bg-surface text-muted border border-site-border hover:border-nv-green hover:text-forest'
      }`}
    >
      {value}
    </button>
  );

  return (
    <div className="min-h-screen bg-page">
      {/* Header */}
      <div className="bg-surface border-b-2 border-site-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-extrabold text-forest mb-2">Nos animaux</h1>
          <p className="text-muted">
            {loading
              ? 'Chargement...'
              : `${filtered.length} animal${filtered.length > 1 ? 'ux' : ''} disponible${filtered.length > 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-[70px] z-10 bg-surface border-b-2 border-site-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3 flex-wrap">
            <SlidersHorizontal size={18} className="text-hint flex-shrink-0" />

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-extrabold text-hint uppercase tracking-widest">Espèce</span>
              {(['Tous', 'Chien', 'Chat', 'Lapin', 'Autre'] as EspeceFilter[]).map(v => (
                <FilterBtn key={v} value={v} current={espece} set={setEspece} />
              ))}
            </div>

            <div className="hidden sm:block w-px h-6 bg-site-border" />

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-extrabold text-hint uppercase tracking-widest">Âge</span>
              {(['Tous', 'Junior', 'Adulte', 'Senior'] as AgeFilter[]).map(v => (
                <FilterBtn key={v} value={v} current={age} set={setAge} />
              ))}
            </div>

            <div className="hidden sm:block w-px h-6 bg-site-border" />

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-extrabold text-hint uppercase tracking-widest">Sexe</span>
              {(['Tous', 'Mâle', 'Femelle'] as SexeFilter[]).map(v => (
                <FilterBtn key={v} value={v} current={sexe} set={setSexe} />
              ))}
            </div>

            <div className="hidden sm:block w-px h-6 bg-site-border" />

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-extrabold text-hint uppercase tracking-widest">Localisation</span>
              {(['Tous', 'Refuge', 'Famille d\'accueil'] as LocalisationFilter[]).map(v => (
                <FilterBtn key={v} value={v} current={localisation} set={setLocalisation} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-surface rounded-[20px] overflow-hidden animate-pulse border-2 border-site-border">
                <div className="aspect-[4/3] bg-page" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-page rounded w-24" />
                  <div className="h-4 bg-page rounded w-40" />
                  <div className="h-3 bg-page rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🐾</div>
            <h3 className="text-xl font-bold text-forest mb-2">
              Aucun animal ne correspond à vos critères
            </h3>
            <p className="text-muted mb-6">
              Essayez de modifier vos filtres ou revenez prochainement.
            </p>
            <button
              onClick={() => { setEspece('Tous'); setAge('Tous'); setSexe('Tous'); setLocalisation('Tous'); }}
              className="btn-primary"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(animal => (
              <AnimalCard key={animal.id} animal={animal} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
