import { useState, useEffect } from 'react';
import { Save, Download, Upload, CheckCircle2, Plus, Trash2, Construction } from 'lucide-react';
import { useConfig } from '../../hooks/useData';
import type { Config } from '../../types';

interface MaintenanceConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  show_don_btn: boolean;
  preview_code: string;
}

const DEFAULT_PREVIEW_CODE = 'Bigdodo33$';

function loadMaintenanceConfig(): MaintenanceConfig {
  if (localStorage.getItem('site_maintenance') === null) {
    localStorage.setItem(
      'site_maintenance',
      import.meta.env.VITE_MAINTENANCE_MODE === 'true' ? 'true' : 'false',
    );
  }
  const enabled = localStorage.getItem('site_maintenance') === 'true';
  try {
    const raw = localStorage.getItem('maintenance_config');
    if (raw) {
      const s = JSON.parse(raw) as Partial<MaintenanceConfig>;
      return {
        enabled,
        title:        s.title        || 'Le site arrive bientôt 🐾',
        subtitle:     s.subtitle     || "Nous préparons actuellement la plateforme d'adoption.\nMerci pour votre patience.",
        show_don_btn: s.show_don_btn ?? true,
        preview_code: s.preview_code || DEFAULT_PREVIEW_CODE,
      };
    }
  } catch { /**/ }
  return {
    enabled,
    title: 'Le site arrive bientôt 🐾',
    subtitle: "Nous préparons actuellement la plateforme d'adoption.\nMerci pour votre patience.",
    show_don_btn: true,
    preview_code: DEFAULT_PREVIEW_CODE,
  };
}

function saveMaintenanceConfig(mc: MaintenanceConfig) {
  localStorage.setItem('maintenance_config', JSON.stringify(mc));
  localStorage.setItem('site_maintenance', mc.enabled ? 'true' : 'false');
  window.dispatchEvent(new Event('maintenance_changed'));
}

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
  const [mc, setMc] = useState<MaintenanceConfig>(loadMaintenanceConfig);
  const [mcSaved, setMcSaved] = useState(false);

  useEffect(() => {
    if (config) {
      setForm({
        ...config,
        chiffres: {
          ...config.chiffres,
          custom: config.chiffres.custom ?? [],
        },
      });
    }
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

  const addCustomIndicator = () => {
    setForm(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        chiffres: {
          ...prev.chiffres,
          custom: [...(prev.chiffres.custom ?? []), { label: '', value: 0 }],
        },
      };
    });
  };

  const updateCustomIndicator = (idx: number, field: 'label' | 'value', raw: string) => {
    setForm(prev => {
      if (!prev) return prev;
      const custom = [...(prev.chiffres.custom ?? [])];
      custom[idx] = {
        ...custom[idx],
        [field]: field === 'value' ? parseInt(raw) || 0 : raw,
      };
      return { ...prev, chiffres: { ...prev.chiffres, custom } };
    });
  };

  const removeCustomIndicator = (idx: number) => {
    setForm(prev => {
      if (!prev) return prev;
      const custom = (prev.chiffres.custom ?? []).filter((_, i) => i !== idx);
      return { ...prev, chiffres: { ...prev.chiffres, custom } };
    });
  };

  const handleSave = () => {
    if (!form) return;
    save(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveMaintenance = () => {
    saveMaintenanceConfig(mc);
    setMcSaved(true);
    setTimeout(() => setMcSaved(false), 2000);
  };

  const exportAll = () => {
    const animaux = localStorage.getItem('animaux');
    const pages   = localStorage.getItem('pages');
    const adminPg = localStorage.getItem('admin_pages');
    const PAGE_SLUGS = ['accueil','presentation','animaux','adopter','famille-accueil','faire-un-don','contact','mentions-legales','blog','devenir-membre'];
    const pageContent: Record<string, unknown> = {};
    for (const s of PAGE_SLUGS) {
      try { const r = localStorage.getItem(`page_content_${s}`); if (r) pageContent[s] = JSON.parse(r); } catch { /* ignore */ }
    }
    const allData = {
      config: form, animaux: animaux ? JSON.parse(animaux) : null,
      pages: pages ? JSON.parse(pages) : null,
      page_content: Object.keys(pageContent).length ? pageContent : null,
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
        {/* Contact */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Contact & Coordonnées</h2>
          <Field label="Email destinataire (formulaires)" value={form.email_destinataire} onChange={v => set('email_destinataire', v)} />
          <Field label="Email de contact (affiché)" value={form.email_contact} onChange={v => set('email_contact', v)} />
          <Field label="Téléphone" value={form.telephone} onChange={v => set('telephone', v)} />
          <Field label="Adresse" value={form.adresse} onChange={v => set('adresse', v)} />
        </div>

        {/* Social */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Réseaux sociaux & Don</h2>
          <Field label="URL Facebook" value={form.facebook_url} onChange={v => set('facebook_url', v)} />
          <Field label="URL Instagram" value={form.instagram_url} onChange={v => set('instagram_url', v)} />
          <Field label="URL LinkedIn" value={form.linkedin_url ?? ''} onChange={v => set('linkedin_url', v)} placeholder="https://www.linkedin.com/company/..." />
          <Field label="URL HelloAsso (faire un don)" value={form.helloasso_url} onChange={v => set('helloasso_url', v)} />
        </div>

        {/* Chiffres clés */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
          <div>
            <h2 className="font-semibold text-gray-900">Chiffres clés (page d'accueil)</h2>
            <p className="text-xs text-gray-400 mt-1">
              Les indicateurs à 0 ou vides sont masqués sur le site public.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-600">Indicateurs fixes</h3>
            <Field label="Animaux adoptés" value={form.chiffres.animaux_adoptes} type="number"
              onChange={v => set('chiffres.animaux_adoptes', v)} />
            <Field label="Familles d'accueil actives" value={form.chiffres.familles_accueil} type="number"
              onChange={v => set('chiffres.familles_accueil', v)} />
            <Field label="Années d'existence" value={form.chiffres.annees_existence} type="number"
              onChange={v => set('chiffres.annees_existence', v)} />
          </div>

          <div className="space-y-3 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">Indicateurs personnalisés</h3>
              <button
                type="button"
                onClick={addCustomIndicator}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-coral-50 text-coral-600 rounded-lg hover:bg-coral-100 font-medium"
              >
                <Plus size={14} />Ajouter un indicateur
              </button>
            </div>

            {(form.chiffres.custom ?? []).length === 0 && (
              <p className="text-sm text-gray-400 italic">Aucun indicateur personnalisé. Cliquez sur "Ajouter" pour en créer un.</p>
            )}

            {(form.chiffres.custom ?? []).map((item, idx) => (
              <div key={idx} className="flex items-end gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <label className="form-label">Libellé</label>
                  <input
                    className="form-input"
                    value={item.label}
                    onChange={e => updateCustomIndicator(idx, 'label', e.target.value)}
                    placeholder="Ex: bénévoles actifs"
                  />
                </div>
                <div className="w-28">
                  <label className="form-label">Nombre</label>
                  <input
                    type="number"
                    className="form-input"
                    value={item.value}
                    onChange={e => updateCustomIndicator(idx, 'value', e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeCustomIndicator(idx)}
                  className="mb-0.5 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all ${saved ? 'bg-green-500' : 'bg-coral-500 hover:bg-coral-600'}`}>
          {saved ? <><CheckCircle2 size={18} />Sauvegardé !</> : <><Save size={18} />Sauvegarder</>}
        </button>

        {/* Maintenance */}
        <div className={`rounded-xl shadow-sm p-6 space-y-5 ${mc.enabled ? 'bg-amber-50 border-2 border-amber-300' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Construction size={20} className={mc.enabled ? 'text-amber-600' : 'text-gray-400'} />
              <div>
                <h2 className="font-semibold text-gray-900">Site en construction</h2>
                <p className="text-xs text-gray-400 mt-0.5">Affiche une page d'attente aux visiteurs</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const updated = { ...mc, enabled: !mc.enabled };
                setMc(updated);
                saveMaintenanceConfig(updated); // immediate effect — no need to click Enregistrer
              }}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${mc.enabled ? 'bg-amber-500' : 'bg-gray-200'}`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${mc.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {mc.enabled && (
            <div className="rounded-lg bg-amber-100 border border-amber-200 px-4 py-2 text-sm text-amber-800 font-medium">
              ⚠️ Le site est actuellement en mode maintenance — les visiteurs voient la page d'attente.
            </div>
          )}

          <div>
            <label className="form-label">Titre de la page</label>
            <input className="form-input" value={mc.title}
              onChange={e => setMc(p => ({ ...p, title: e.target.value }))}
              placeholder="Le site arrive bientôt 🐾" />
          </div>
          <div>
            <label className="form-label">Sous-titre</label>
            <textarea className="form-input" rows={3} value={mc.subtitle}
              onChange={e => setMc(p => ({ ...p, subtitle: e.target.value }))}
              placeholder="Nous préparons actuellement la plateforme..." />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="show_don_btn" checked={mc.show_don_btn}
              onChange={e => setMc(p => ({ ...p, show_don_btn: e.target.checked }))}
              className="rounded border-gray-300" />
            <label htmlFor="show_don_btn" className="text-sm text-gray-700">Afficher le bouton "Faire un don"</label>
          </div>
          <div>
            <label className="form-label">Code d'accès preview</label>
            <input className="form-input" type="text" value={mc.preview_code}
              onChange={e => setMc(p => ({ ...p, preview_code: e.target.value }))}
              placeholder="Ex: MonCode2024!" />
            <p className="text-xs text-gray-400 mt-1">Ce code permet à certaines personnes d'accéder au site même en mode maintenance.</p>
          </div>
          <button onClick={handleSaveMaintenance}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-white text-sm transition-all ${mcSaved ? 'bg-green-500' : 'bg-amber-500 hover:bg-amber-600'}`}>
            {mcSaved ? <><CheckCircle2 size={16} />Sauvegardé !</> : <><Save size={16} />Enregistrer</>}
          </button>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-sm text-yellow-800">
          <strong>Sauvegarde :</strong> Les données sont en localStorage. Exportez régulièrement pour éviter toute perte.
        </div>
      </div>
    </div>
  );
}
