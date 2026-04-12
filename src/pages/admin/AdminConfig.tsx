import { useState, useEffect } from 'react';
import { Save, Download, Upload, CheckCircle2 } from 'lucide-react';
import { useConfig } from '../../hooks/useData';
import type { Config } from '../../types';

// ─── Field defined OUTSIDE component to prevent remount on re-render ─────────
interface FieldProps {
  label: string;
  value: string | number;
  type?: string;
  placeholder?: string;
  onChange: (v: string) => void;
}
function Field({ label, value, type = 'text', placeholder, onChange }: FieldProps) {
  return (
    <div>
      <label className="form-label">{label}</label>
      <input
        type={type}
        className="form-input"
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

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
        return { ...prev, chiffres: { ...prev.chiffres, [parts[1]]: typeof value === 'string' ? parseInt(value) || 0 : value } };
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
    const pages   = localStorage.getItem('pages');
    const adminPg = localStorage.getItem('admin_pages');
    const allData = {
      config: form, animaux: animaux ? JSON.parse(animaux) : null,
      pages: pages ? JSON.parse(pages) : null,
      admin_pages: adminPg ? JSON.parse(adminPg) : null,
      exported_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `domainedefuego-backup-${new Date().toISOString().slice(0,10)}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const importAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed.config) { save(parsed.config); setForm(parsed.config); }
        if (parsed.animaux)    localStorage.setItem('animaux',     JSON.stringify(parsed.animaux));
        if (parsed.pages)      localStorage.setItem('pages',       JSON.stringify(parsed.pages));
        if (parsed.admin_pages)localStorage.setItem('admin_pages', JSON.stringify(parsed.admin_pages));
        alert('Import réussi ! Rechargez la page pour voir les changements.');
      } catch { alert('Fichier JSON invalide.'); }
    };
    reader.readAsText(file); e.target.value = '';
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
          <h2 className="font-semibold text-gray-900">Contact & Coordonnées</h2>
          <Field label="Email destinataire (formulaires)" value={form.email_destinataire} onChange={v => set('email_destinataire', v)} />
          <Field label="Email de contact (affiché)" value={form.email_contact} onChange={v => set('email_contact', v)} />
          <Field label="Téléphone" value={form.telephone} onChange={v => set('telephone', v)} />
          <Field label="Adresse" value={form.adresse} onChange={v => set('adresse', v)} />
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Réseaux sociaux & Don</h2>
          <Field label="URL Facebook" value={form.facebook_url} onChange={v => set('facebook_url', v)} />
          <Field label="URL Instagram" value={form.instagram_url} onChange={v => set('instagram_url', v)} />
          <Field label="URL HelloAsso (faire un don)" value={form.helloasso_url} onChange={v => set('helloasso_url', v)} />
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Chiffres clés (page d'accueil)</h2>
          <Field label="Animaux adoptés" value={form.chiffres.animaux_adoptes} type="number" onChange={v => set('chiffres.animaux_adoptes', v)} />
          <Field label="Familles d'accueil actives" value={form.chiffres.familles_accueil} type="number" onChange={v => set('chiffres.familles_accueil', v)} />
          <Field label="Années d'existence" value={form.chiffres.annees_existence} type="number" onChange={v => set('chiffres.annees_existence', v)} />
        </div>

        <button onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all ${saved ? 'bg-green-500' : 'bg-coral-500 hover:bg-coral-600'}`}>
          {saved ? <><CheckCircle2 size={18} />Sauvegardé !</> : <><Save size={18} />Sauvegarder</>}
        </button>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-sm text-yellow-800">
          <strong>Sauvegarde :</strong> Les données sont en localStorage. Exportez régulièrement pour éviter toute perte.
        </div>
      </div>
    </div>
  );
}
