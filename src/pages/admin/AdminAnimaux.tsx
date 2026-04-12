import { useState } from 'react';
import { Plus, Edit2, Archive, X, Save, AlertCircle } from 'lucide-react';
import { useAnimaux } from '../../hooks/useData';
import type { Animal } from '../../types';

const emptyAnimal: Omit<Animal, 'id'> = {
  nom: '', espece: 'Chien', race: '', naissance: 2020, sexe: 'Mâle',
  departement: '', statut: 'Disponible', description: '',
  entente_chiens: false, entente_chats: false, entente_enfants: false,
  vaccine: false, sterilise: false, identifie: false,
  participation_frais: 0, association_nom: '', association_ville: '',
  photos: [], video_youtube: '',
};

const statutColors: Record<string, string> = {
  'Disponible': 'bg-green-100 text-green-700',
  'Réservé': 'bg-orange-100 text-orange-700',
  'Adopté': 'bg-gray-100 text-gray-600',
};

type FormAnimal = Omit<Animal, 'id'> & { id?: string; photos_text?: string };

export default function AdminAnimaux() {
  const { data: animaux, save } = useAnimaux();
  const [modal, setModal] = useState<FormAnimal | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saved, setSaved] = useState(false);

  const openNew = () => {
    setIsNew(true);
    setModal({ ...emptyAnimal, photos_text: '' });
    setSaved(false);
  };

  const openEdit = (animal: Animal) => {
    setIsNew(false);
    setModal({ ...animal, photos_text: animal.photos.join('\n') });
    setSaved(false);
  };

  const archive = (id: string) => {
    if (!animaux) return;
    if (!confirm('Archiver cet animal (statut → Adopté) ?')) return;
    save(animaux.map(a => a.id === id ? { ...a, statut: 'Adopté' } : a));
  };

  const saveAnimal = () => {
    if (!modal || !animaux) return;
    const photos = (modal.photos_text || '').split('\n').map(s => s.trim()).filter(Boolean);
    const updated = { ...modal, photos };
    delete (updated as FormAnimal).photos_text;

    if (isNew) {
      const id = `${modal.nom.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
      save([...animaux, { ...(updated as Animal), id }]);
    } else {
      save(animaux.map(a => a.id === modal.id ? (updated as Animal) : a));
    }
    setSaved(true);
    setTimeout(() => setModal(null), 800);
  };

  const set = (k: keyof FormAnimal, v: string | number | boolean) =>
    setModal(prev => prev ? { ...prev, [k]: v } : null);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(animaux, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'animaux.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (Array.isArray(parsed)) { save(parsed); alert('Importé avec succès !'); }
        else alert('Format invalide.');
      } catch { alert('Fichier JSON invalide.'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des animaux</h1>
        <div className="flex gap-3">
          <button onClick={exportData} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Exporter JSON
          </button>
          <label className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            Importer JSON
            <input type="file" accept=".json" className="hidden" onChange={importData} />
          </label>
          <button onClick={openNew} className="btn-primary text-sm">
            <Plus size={16} />Ajouter un animal
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Photo</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Nom</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Espèce</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Statut</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Département</th>
              <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(animaux ?? []).map(animal => (
              <tr key={animal.id} className="hover:bg-gray-50">
                <td className="py-3 px-4">
                  {animal.photos[0] ? (
                    <img src={animal.photos[0]} alt={animal.nom} className="w-12 h-10 object-cover rounded-lg" />
                  ) : (
                    <div className="w-12 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-lg">🐾</div>
                  )}
                </td>
                <td className="py-3 px-4 font-medium text-gray-900">{animal.nom}</td>
                <td className="py-3 px-4 text-gray-600">{animal.espece} · {animal.race}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statutColors[animal.statut] ?? ''}`}>
                    {animal.statut}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-600">{animal.departement}</td>
                <td className="py-3 px-4">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(animal)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors" title="Modifier">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => archive(animal.id)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors" title="Archiver">
                      <Archive size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(animaux ?? []).length === 0 && (
          <div className="text-center py-12 text-gray-400">Aucun animal enregistré</div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">
                {isNew ? 'Ajouter un animal' : `Modifier ${modal.nom}`}
              </h2>
              <button onClick={() => setModal(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Infos de base */}
              <div className="grid grid-cols-2 gap-4">
                <div><label className="form-label">Nom *</label><input className="form-input" value={modal.nom} onChange={e => set('nom', e.target.value)} /></div>
                <div>
                  <label className="form-label">Espèce *</label>
                  <select className="form-input" value={modal.espece} onChange={e => set('espece', e.target.value)}>
                    {['Chien','Chat','Lapin','Autre'].map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div><label className="form-label">Race</label><input className="form-input" value={modal.race} onChange={e => set('race', e.target.value)} /></div>
                <div><label className="form-label">Année de naissance</label><input type="number" className="form-input" value={modal.naissance} onChange={e => set('naissance', parseInt(e.target.value))} /></div>
                <div>
                  <label className="form-label">Sexe *</label>
                  <select className="form-input" value={modal.sexe} onChange={e => set('sexe', e.target.value)}>
                    <option>Mâle</option><option>Femelle</option>
                  </select>
                </div>
                <div><label className="form-label">Département</label><input className="form-input" value={modal.departement} onChange={e => set('departement', e.target.value)} /></div>
                <div>
                  <label className="form-label">Statut *</label>
                  <select className="form-input" value={modal.statut} onChange={e => set('statut', e.target.value)}>
                    {['Disponible','Réservé','Adopté'].map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div><label className="form-label">Participation aux frais (€)</label><input type="number" className="form-input" value={modal.participation_frais} onChange={e => set('participation_frais', parseInt(e.target.value))} /></div>
                <div><label className="form-label">Association (nom)</label><input className="form-input" value={modal.association_nom} onChange={e => set('association_nom', e.target.value)} /></div>
                <div><label className="form-label">Association (ville)</label><input className="form-input" value={modal.association_ville} onChange={e => set('association_ville', e.target.value)} /></div>
              </div>

              {/* Description */}
              <div>
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={4} value={modal.description} onChange={e => set('description', e.target.value)} />
              </div>

              {/* Checkboxes */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Santé</p>
                  {(['vaccine','sterilise','identifie'] as const).map(k => (
                    <label key={k} className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="checkbox" className="w-4 h-4 accent-coral-500" checked={modal[k] as boolean} onChange={e => set(k, e.target.checked)} />
                      {k === 'vaccine' ? 'Vacciné(e)' : k === 'sterilise' ? 'Stérilisé(e)' : 'Identifié(e)'}
                    </label>
                  ))}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Ententes</p>
                  {(['entente_chiens','entente_chats','entente_enfants'] as const).map(k => (
                    <label key={k} className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="checkbox" className="w-4 h-4 accent-coral-500" checked={modal[k] as boolean} onChange={e => set(k, e.target.checked)} />
                      {k === 'entente_chiens' ? 'Chiens' : k === 'entente_chats' ? 'Chats' : 'Enfants'}
                    </label>
                  ))}
                </div>
              </div>

              {/* Photos */}
              <div>
                <label className="form-label">URLs des photos (une par ligne, max 10)</label>
                <textarea
                  className="form-input font-mono text-sm"
                  rows={4}
                  value={modal.photos_text}
                  onChange={e => set('photos_text', e.target.value)}
                  placeholder="https://example.com/photo1.jpg&#10;https://example.com/photo2.jpg"
                />
              </div>

              {/* Vidéo */}
              <div>
                <label className="form-label">ID vidéo YouTube (optionnel)</label>
                <input className="form-input" value={modal.video_youtube || ''} onChange={e => set('video_youtube', e.target.value)} placeholder="Ex: dQw4w9WgXcQ" />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                Annuler
              </button>
              <button
                onClick={saveAnimal}
                disabled={!modal.nom}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  saved ? 'bg-green-500 text-white' : 'bg-coral-500 hover:bg-coral-600 text-white'
                } disabled:opacity-50`}
              >
                {saved ? <><AlertCircle size={16} />Sauvegardé !</> : <><Save size={16} />Sauvegarder</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
