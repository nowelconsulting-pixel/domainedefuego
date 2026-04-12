import { useState, useEffect } from 'react';
import { Save, Download, Upload, CheckCircle2 } from 'lucide-react';
import { useConfig } from '../../hooks/useData';
import type { Config } from '../../types';

export default function AdminConfig() {
  const { data: config, save } = useConfig();
  const [form, setForm] = useState<Config | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (config) setForm({ ...config });
  }, [config]);

  if (!form) return <div className="p-8 text-gray-400">Chargement...</div>;

  const set = (path: string, value: string | number) => {
    setForm(prev => {
      if (!prev) return prev;
      const parts = path.split('.');
      if (parts.length === 1) return { ...prev, [parts[0]]: value };
      if (parts.length === 2 && parts[0] === 'chiffres') {
        return { ...prev, chiffres: { ...prev.chiffres, [parts[1]]: value } };
      }
      return prev;
    });
  };

  const handleSave = () => {
    if (!form) return;
    save(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const exportAll = () => {
    const animaux = localStorage.getItem('animaux');
    const pages = localStorage.getItem('pages');
    const allData = {
      config: form,
      animaux: animaux ? JSON.parse(animaux) : null,
      pages: pages ? JSON.parse(pages) : null,
      exported_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `domainedefuego-backup-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const importAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed.config) { save(parsed.config); setForm(parsed.config); }
        if (parsed.animaux) localStorage.setItem('animaux', JSON.stringify(parsed.animaux));
        if (parsed.pages) localStorage.setItem('pages', JSON.stringify(parsed.pages));
        alert('Import réussi ! Rechargez la page pour voir les changements.');
      } catch { alert('Fichier JSON invalide.'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const Field = ({ label, path, type = 'text' }: { label: string; path: string; type?: string }) => {
    const val = path.startsWith('chiffres.')
      ? form?.chiffres[path.split('.')[1] as keyof Config['chiffres']]
      : form?.[path as keyof Config];
    return (
      <div>
        <label className="form-label">{label}</label>
        <input
          type={type}
          className="form-input"
          value={val as string | number ?? ''}
          onChange={e => set(path, type === 'number' ? parseInt(e.target.value) : e.target.value)}
        />
      </div>
    );
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Configuration</h1>
        <div className="flex gap-3">
          <button onClick={exportAll} className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download size={16} />Tout exporter
          </button>
          <label className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
            <Upload size={16} />Tout importer
            <input type="file" accept=".json" className="hidden" onChange={importAll} />
          </label>
        </div>
      </div>

      <div className="space-y-8 max-w-3xl">
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 mb-2">Contact & Coordonnées</h2>
          <Field label="Email destinataire (formulaires)" path="email_destinataire" />
          <Field label="Email de contact (affiché)" path="email_contact" />
          <Field label="Téléphone" path="telephone" />
          <Field label="Adresse" path="adresse" />
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 mb-2">Réseaux sociaux & Don</h2>
          <Field label="URL Facebook" path="facebook_url" />
          <Field label="URL Instagram" path="instagram_url" />
          <Field label="URL HelloAsso (faire un don)" path="helloasso_url" />
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 mb-2">Chiffres clés (page d'accueil)</h2>
          <Field label="Animaux adoptés" path="chiffres.animaux_adoptes" type="number" />
          <Field label="Familles d'accueil actives" path="chiffres.familles_accueil" type="number" />
          <Field label="Années d'existence" path="chiffres.annees_existence" type="number" />
        </div>

        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
            saved ? 'bg-green-500 text-white' : 'bg-coral-500 hover:bg-coral-600 text-white'
          }`}
        >
          {saved ? <><CheckCircle2 size={18} />Sauvegardé !</> : <><Save size={18} />Sauvegarder</>}
        </button>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-sm text-yellow-800">
          <strong>Note :</strong> Les données sont sauvegardées dans le localStorage de votre navigateur. Utilisez "Tout exporter" pour créer une sauvegarde et "Tout importer" pour restaurer ou transférer les données vers un autre navigateur/ordinateur.
        </div>
      </div>
    </div>
  );
}
