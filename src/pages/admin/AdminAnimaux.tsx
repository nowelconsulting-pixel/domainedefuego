import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Edit2, Archive, X, Save, Copy, Search, ChevronDown } from 'lucide-react';
import { useAnimaux } from '../../hooks/useData';
import type { Animal } from '../../types';
import MediaUploader from '../../components/admin/MediaUploader';
import VideoInput from '../../components/admin/VideoInput';

// ─── Types ──────────────────────────────────────────────────────────────────

type FormAnimal = Omit<Animal, 'id'> & { id?: string };

const EMPTY: FormAnimal = {
  nom: '', espece: 'Chien', race: '', naissance: new Date().getFullYear() - 2,
  sexe: 'Mâle', departement: '', statut: 'Disponible', description: '',
  entente_chiens: false, entente_chats: false, entente_enfants: false,
  vaccine: false, sterilise: false, identifie: false,
  participation_frais: 0, association_nom: '', association_ville: '',
  photos: [], video_youtube: '',
};

const STATUT_COLORS: Record<string, string> = {
  'Disponible': 'bg-green-100 text-green-700',
  'Réservé':    'bg-orange-100 text-orange-700',
  'Adopté':     'bg-gray-100 text-gray-500',
};

// ─── Form Field — defined OUTSIDE to prevent remount on re-render ─────────

interface FieldProps {
  label: string;
  children: React.ReactNode;
}
function Field({ label, children }: FieldProps) {
  return (
    <div>
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

// ─── Animal Form (page or modal) ─────────────────────────────────────────────

interface AnimalFormProps {
  initial: FormAnimal;
  onSave: (a: FormAnimal) => void;
  onCancel: () => void;
  isNew: boolean;
}

function AnimalForm({ initial, onSave, onCancel, isNew }: AnimalFormProps) {
  const [form, setForm] = useState<FormAnimal>(initial);
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof FormAnimal>(k: K, v: FormAnimal[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = () => {
    if (!form.nom.trim()) { alert('Le nom est obligatoire.'); return; }
    onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">
          {isNew ? 'Ajouter un animal' : `Modifier — ${form.nom || 'sans nom'}`}
        </h2>
        <button onClick={onCancel} className="p-2 hover:bg-gray-200 rounded-lg text-gray-500">
          <X size={20} />
        </button>
      </div>

      <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Identité */}
        <section>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Identité</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nom *">
              <input className="form-input" value={form.nom} onChange={e => set('nom', e.target.value)} />
            </Field>
            <Field label="Espèce *">
              <select className="form-input" value={form.espece} onChange={e => set('espece', e.target.value as Animal['espece'])}>
                {['Chien','Chat','Lapin','Autre'].map(v => <option key={v}>{v}</option>)}
              </select>
            </Field>
            <Field label="Race">
              <input className="form-input" value={form.race} onChange={e => set('race', e.target.value)} />
            </Field>
            <Field label="Année de naissance">
              <input type="number" className="form-input" value={form.naissance}
                onChange={e => set('naissance', parseInt(e.target.value) || 2020)} />
            </Field>
            <Field label="Sexe *">
              <select className="form-input" value={form.sexe} onChange={e => set('sexe', e.target.value as Animal['sexe'])}>
                <option>Mâle</option><option>Femelle</option>
              </select>
            </Field>
            <Field label="Département">
              <input className="form-input" value={form.departement} onChange={e => set('departement', e.target.value)} placeholder="Ex: 95 - Val d'Oise" />
            </Field>
            <Field label="Statut *">
              <select className="form-input" value={form.statut} onChange={e => set('statut', e.target.value as Animal['statut'])}>
                {['Disponible','Réservé','Adopté'].map(v => <option key={v}>{v}</option>)}
              </select>
            </Field>
            <Field label="Participation aux frais (€)">
              <input type="number" className="form-input" value={form.participation_frais}
                onChange={e => set('participation_frais', parseInt(e.target.value) || 0)} />
            </Field>
            <Field label="Association (nom)">
              <input className="form-input" value={form.association_nom} onChange={e => set('association_nom', e.target.value)} />
            </Field>
            <Field label="Association (ville)">
              <input className="form-input" value={form.association_ville} onChange={e => set('association_ville', e.target.value)} />
            </Field>
          </div>
        </section>

        {/* Description */}
        <section>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Description</h3>
          <textarea
            className="form-input w-full"
            rows={5}
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Décrivez le caractère, l'histoire et les besoins de l'animal..."
          />
        </section>

        {/* Checkboxes */}
        <section>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Santé & Ententes</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-600 mb-2">Santé</p>
              {([['vaccine','Vacciné(e)'], ['sterilise','Stérilisé(e)'], ['identifie','Identifié(e)']] as const).map(([k, label]) => (
                <label key={k} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="checkbox" className="w-4 h-4 accent-coral-500"
                    checked={form[k] as boolean} onChange={e => set(k, e.target.checked)} />
                  {label}
                </label>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-600 mb-2">Ententes</p>
              {([['entente_chiens','Avec les chiens'], ['entente_chats','Avec les chats'], ['entente_enfants','Avec les enfants']] as const).map(([k, label]) => (
                <label key={k} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="checkbox" className="w-4 h-4 accent-coral-500"
                    checked={form[k] as boolean} onChange={e => set(k, e.target.checked)} />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* Photos */}
        <section>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Photos</h3>
          <MediaUploader photos={form.photos} onChange={photos => set('photos', photos)} />
        </section>

        {/* Vidéo */}
        <section>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Vidéo (optionnel)</h3>
          <VideoInput value={form.video_youtube ?? ''} onChange={v => set('video_youtube', v)} />
        </section>
      </div>

      <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
        <button onClick={onCancel} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
          Annuler
        </button>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${
            saved ? 'bg-green-500' : 'bg-coral-500 hover:bg-coral-600'
          }`}
        >
          <Save size={16} />{saved ? 'Sauvegardé !' : 'Sauvegarder'}
        </button>
      </div>
    </div>
  );
}

// ─── Main list component ─────────────────────────────────────────────────────

export default function AdminAnimaux() {
  const { data: animaux, save } = useAnimaux();
  const navigate = useNavigate();
  const { action } = useParams<{ action?: string }>();

  const [search, setSearch]         = useState('');
  const [filterStatut, setFilter]   = useState('Tous');
  const [sortBy, setSortBy]         = useState<'nom'|'espece'|'date'>('date');
  const [editingAnimal, setEditing] = useState<FormAnimal | null>(null);
  const [isNew, setIsNew]           = useState(false);

  const isFormOpen = action === 'new' || editingAnimal !== null;

  const filtered = useMemo(() => {
    if (!animaux) return [];
    return animaux
      .filter(a => {
        if (filterStatut !== 'Tous' && a.statut !== filterStatut) return false;
        if (search && !a.nom.toLowerCase().includes(search.toLowerCase()) &&
            !a.race.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'nom') return a.nom.localeCompare(b.nom);
        if (sortBy === 'espece') return a.espece.localeCompare(b.espece);
        return 0; // date = natural order
      });
  }, [animaux, search, filterStatut, sortBy]);

  const openNew = () => { setIsNew(true); setEditing({ ...EMPTY }); navigate('/admin/animaux/new'); };
  const openEdit = (a: Animal) => { setIsNew(false); setEditing({ ...a }); };
  const closeForm = () => { setEditing(null); navigate('/admin/animaux'); };

  const handleSave = (form: FormAnimal) => {
    if (!animaux) return;
    if (isNew) {
      const id = `${form.nom.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now()}`;
      save([...animaux, { ...form, id } as Animal]);
    } else {
      save(animaux.map(a => a.id === form.id ? (form as Animal) : a));
    }
    closeForm();
  };

  const duplicate = (animal: Animal) => {
    if (!animaux) return;
    const id = `${animal.nom.toLowerCase().replace(/\s+/g, '-')}-copie-${Date.now()}`;
    save([...animaux, { ...animal, id, nom: `${animal.nom} (copie)`, statut: 'Disponible' }]);
  };

  const archive = (id: string) => {
    if (!animaux) return;
    if (!confirm('Marquer cet animal comme adopté ?')) return;
    save(animaux.map(a => a.id === id ? { ...a, statut: 'Adopté' as const } : a));
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(animaux, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'animaux.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (Array.isArray(parsed)) { save(parsed); alert('Importé !'); }
        else alert('Format invalide.');
      } catch { alert('JSON invalide.'); }
    };
    reader.readAsText(file); e.target.value = '';
  };

  // Show form if editing
  if (isFormOpen && (editingAnimal !== null || action === 'new')) {
    return (
      <div className="p-8">
        <AnimalForm
          initial={editingAnimal ?? { ...EMPTY }}
          onSave={handleSave}
          onCancel={closeForm}
          isNew={isNew || action === 'new'}
        />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Animaux
          <span className="ml-2 text-sm font-normal text-gray-400">({animaux?.length ?? 0})</span>
        </h1>
        <div className="flex gap-3">
          <button onClick={exportData} className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Exporter</button>
          <label className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
            Importer<input type="file" accept=".json" className="hidden" onChange={importData} />
          </label>
          <button onClick={openNew} className="btn-primary text-sm">
            <Plus size={16} />Ajouter
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="form-input pl-9 py-2"
            placeholder="Rechercher par nom, race..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <select
            className="form-input py-2 pr-8 appearance-none"
            value={filterStatut}
            onChange={e => setFilter(e.target.value)}
          >
            {['Tous','Disponible','Réservé','Adopté'].map(v => <option key={v}>{v}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            className="form-input py-2 pr-8 appearance-none"
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
          >
            <option value="date">Tri : date ajout</option>
            <option value="nom">Tri : nom</option>
            <option value="espece">Tri : espèce</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-500 w-16">Photo</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Nom</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 hidden md:table-cell">Espèce / Race</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Statut</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 hidden lg:table-cell">Département</th>
              <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(animal => (
              <tr key={animal.id} className="hover:bg-gray-50">
                <td className="py-3 px-4">
                  {animal.photos[0] ? (
                    <img src={animal.photos[0]} alt="" className="w-12 h-10 object-cover rounded-lg" loading="lazy" />
                  ) : (
                    <div className="w-12 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">🐾</div>
                  )}
                </td>
                <td className="py-3 px-4 font-medium text-gray-900">{animal.nom}</td>
                <td className="py-3 px-4 text-gray-500 hidden md:table-cell">{animal.espece} · {animal.race}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUT_COLORS[animal.statut] ?? ''}`}>
                    {animal.statut}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-500 hidden lg:table-cell">{animal.departement}</td>
                <td className="py-3 px-4">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => openEdit(animal)} title="Modifier"
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => duplicate(animal)} title="Dupliquer"
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600">
                      <Copy size={15} />
                    </button>
                    <button onClick={() => archive(animal.id)} title="Marquer adopté"
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-orange-500">
                      <Archive size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            {search || filterStatut !== 'Tous' ? 'Aucun résultat pour cette recherche' : 'Aucun animal enregistré'}
          </div>
        )}
      </div>
    </div>
  );
}
