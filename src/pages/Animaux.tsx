import { useState, useMemo } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import AnimalCard from '../components/AnimalCard';
import { useAnimaux } from '../hooks/useData';
import { usePageContent } from '../hooks/usePageContent';
import { getAge } from '../types';
import SystemPageBlocks from '../components/SystemPageBlocks';

type EspeceFilter = 'Tous' | 'Chien' | 'Chat' | 'Lapin' | 'Autre';
type AgeFilter = 'Tous' | 'Junior' | 'Adulte' | 'Senior';
type SexeFilter = 'Tous' | 'Mâle' | 'Femelle';
type LocalisationFilter = 'Tous' | 'Refuge' | "Famille d'accueil";

export default function Animaux() {
  const { data: animaux, loading } = useAnimaux();
  const pc = usePageContent('animaux');
  const [espece, setEspece] = useState<EspeceFilter>('Tous');
  const [age, setAge] = useState<AgeFilter>('Tous');
  const [sexe, setSexe] = useState<SexeFilter>('Tous');
  const [localisation, setLocalisation] = useState<LocalisationFilter>('Tous');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!animaux) return [];
    return animaux.filter(a => {
      if (a.statut === 'Adopté' || a.statut === 'Archivé' || a.statut === 'Brouillon') return false;
      if (espece !== 'Tous' && a.espece !== espece) return false;
      if (age !== 'Tous' && getAge(a.naissance) !== age) return false;
      if (sexe !== 'Tous' && a.sexe !== sexe) return false;
      if (localisation !== 'Tous' && a.localisation !== localisation) return false;
      return true;
    });
  }, [animaux, espece, age, sexe, localisation]);

  const activeCount = [espece, age, sexe, localisation].filter(v => v !== 'Tous').length;

  const Pill = ({ value, current, set }: { value: string; current: string; set: (v: string) => void }) => (
    <button
      onClick={() => set(value)}
      className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${
        current === value
          ? 'bg-nv-green text-white'
          : 'bg-page text-muted border border-site-border hover:border-nv-green hover:text-forest'
      }`}
    >
      {value}
    </button>
  );

  const resetAll = () => { setEspece('Tous'); setAge('Tous'); setSexe('Tous'); setLocalisation('Tous'); };

  const FilterGroups = () => (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-extrabold text-hint uppercase tracking-widest mb-2">Espèce</p>
        <div className="flex flex-wrap gap-2">
          {(['Tous', 'Chien', 'Chat', 'Lapin', 'Autre'] as EspeceFilter[]).map(v =>
            <Pill key={v} value={v} current={espece} set={v => setEspece(v as EspeceFilter)} />
          )}
        </div>
      </div>
      <div>
        <p className="text-xs font-extrabold text-hint uppercase tracking-widest mb-2">Âge</p>
        <div className="flex flex-wrap gap-2">
          {(['Tous', 'Junior', 'Adulte', 'Senior'] as AgeFilter[]).map(v =>
            <Pill key={v} value={v} current={age} set={v => setAge(v as AgeFilter)} />
          )}
        </div>
      </div>
      <div>
        <p className="text-xs font-extrabold text-hint uppercase tracking-widest mb-2">Sexe</p>
        <div className="flex flex-wrap gap-2">
          {(['Tous', 'Mâle', 'Femelle'] as SexeFilter[]).map(v =>
            <Pill key={v} value={v} current={sexe} set={v => setSexe(v as SexeFilter)} />
          )}
        </div>
      </div>
      <div>
        <p className="text-xs font-extrabold text-hint uppercase tracking-widest mb-2">Localisation</p>
        <div className="flex flex-wrap gap-2">
          {(['Tous', 'Refuge', "Famille d'accueil"] as LocalisationFilter[]).map(v =>
            <Pill key={v} value={v} current={localisation} set={v => setLocalisation(v as LocalisationFilter)} />
          )}
        </div>
      </div>
      {activeCount > 0 && (
        <button onClick={resetAll} className="text-xs text-hint underline hover:text-forest mt-1">
          Réinitialiser les filtres
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-page">
      {/* Header */}
      <div className="bg-surface border-b-2 border-site-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-extrabold text-forest mb-2">
            {(pc.hero_title as string) || 'Nos animaux'}
          </h1>
          <p className="text-muted">
            {loading
              ? 'Chargement...'
              : `${filtered.length} ${filtered.length > 1 ? 'animaux' : 'animal'} disponible${filtered.length > 1 ? 's' : ''}`}
          </p>
          {(pc.hero_subtitle as string) && (
            <p className="text-hint text-sm mt-1">{pc.hero_subtitle as string}</p>
          )}
        </div>
      </div>

      {/* Mobile: sticky filter button */}
      <div className="md:hidden sticky top-[70px] z-10 bg-surface border-b-2 border-site-border px-4 py-3">
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 text-sm font-semibold text-forest"
        >
          <SlidersHorizontal size={16} className="text-hint" />
          <span>Filtres</span>
          {activeCount > 0 && (
            <span className="bg-nv-green text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:flex md:gap-10 md:items-start">

        {/* Sidebar (desktop only) */}
        <aside className="hidden md:block w-[220px] shrink-0 sticky top-[90px]">
          <div className="flex items-center gap-2 mb-5">
            <SlidersHorizontal size={15} className="text-hint" />
            <span className="text-xs font-extrabold text-forest uppercase tracking-widest">Filtres</span>
            {activeCount > 0 && (
              <button onClick={resetAll} className="ml-auto text-xs text-hint underline hover:text-forest">
                Réinitialiser
              </button>
            )}
          </div>
          <FilterGroups />
        </aside>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-surface rounded-[20px] overflow-hidden animate-pulse border-2 border-site-border">
                  <div className="h-[280px] bg-page" />
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
              <p className="text-muted mb-6">Essayez de modifier vos filtres ou revenez prochainement.</p>
              <button onClick={resetAll} className="btn-primary">
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map(animal => (
                <AnimalCard key={animal.id} animal={animal} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile bottom drawer */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setDrawerOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface rounded-t-2xl shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-extrabold text-forest">Filtres</h2>
                <button onClick={() => setDrawerOpen(false)} className="text-hint hover:text-forest p-1">
                  <X size={20} />
                </button>
              </div>
              <FilterGroups />
              <button
                onClick={() => setDrawerOpen(false)}
                className="btn-primary w-full justify-center mt-6"
              >
                Voir {filtered.length} {filtered.length > 1 ? 'animaux' : 'animal'}
              </button>
            </div>
          </div>
        </>
      )}

      <SystemPageBlocks pageId="sys-animaux" />
    </div>
  );
}
