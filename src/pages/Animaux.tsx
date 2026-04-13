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
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        current === value
          ? 'bg-coral-500 text-white'
          : 'bg-white text-gray-700 border border-gray-200 hover:border-coral-300'
      }`}
    >
      {value}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Nos animaux</h1>
          <p className="text-gray-600">
            {loading
              ? 'Chargement...'
              : `${filtered.length} animal${filtered.length > 1 ? 'ux' : ''} disponible${filtered.length > 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-16 z-10 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3 flex-wrap">
            <SlidersHorizontal size={18} className="text-gray-400 flex-shrink-0" />

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Espèce</span>
              {(['Tous', 'Chien', 'Chat', 'Lapin', 'Autre'] as EspeceFilter[]).map(v => (
                <FilterBtn key={v} value={v} current={espece} set={setEspece} />
              ))}
            </div>

            <div className="hidden sm:block w-px h-6 bg-gray-200" />

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Âge</span>
              {(['Tous', 'Junior', 'Adulte', 'Senior'] as AgeFilter[]).map(v => (
                <FilterBtn key={v} value={v} current={age} set={setAge} />
              ))}
            </div>

            <div className="hidden sm:block w-px h-6 bg-gray-200" />

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sexe</span>
              {(['Tous', 'Mâle', 'Femelle'] as SexeFilter[]).map(v => (
                <FilterBtn key={v} value={v} current={sexe} set={setSexe} />
              ))}
            </div>

            <div className="hidden sm:block w-px h-6 bg-gray-200" />

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Localisation</span>
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
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-24" />
                  <div className="h-4 bg-gray-100 rounded w-40" />
                  <div className="h-3 bg-gray-100 rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🐾</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun animal ne correspond à vos critères
            </h3>
            <p className="text-gray-500 mb-6">
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
