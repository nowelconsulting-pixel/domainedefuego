import { useState } from 'react';
import { ClipboardList, Save, Plus, Trash2, ChevronUp, ChevronDown, Pencil } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────

interface SelectOptions {
  type_logement: string[];
  jardin: string[];
  statut_occupant: string[];
  statut_familial: string[];
}

interface FormConfig {
  contact:  { active: boolean; intro: string; subjects: string[] };
  adoption: { active: boolean; intro: string; charte_text: string; options: SelectOptions & { heures_seul: string[] } };
  fa:       { active: boolean; intro: string; types_animaux: string[]; durees: string[]; options: SelectOptions & { urgences: string[] } };
}

export type FieldType = 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'checkbox';

export interface CustomField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder: string;
  options: string[];
}

export interface CustomForm {
  id: string;
  title: string;
  slug: string;
  active: boolean;
  intro: string;
  success_message: string;
  fields: CustomField[];
}

// ── Defaults ───────────────────────────────────────────────────────────────

const DEFAULT_SELECT: SelectOptions = {
  type_logement:   ['Maison', 'Appartement', 'Autre'],
  jardin:          ['Oui, clôturé', 'Oui, non clôturé', 'Non'],
  statut_occupant: ['Propriétaire', 'Locataire avec autorisation', 'Locataire (à vérifier)'],
  statut_familial: ['Seul(e)', 'En couple', 'Famille avec enfant(s)'],
};

const DEFAULTS: FormConfig = {
  contact: {
    active: true, intro: '',
    subjects: ['Question sur un animal', 'Candidature adoption', "Famille d'accueil", 'Don / financement', 'Partenariat', 'Autre'],
  },
  adoption: {
    active: true, intro: '',
    charte_text: "J'ai lu et j'accepte la charte d'adoption de Domaine de Fuego. Je m'engage à adopter l'animal en toute responsabilité, pour toute sa vie.",
    options: { ...DEFAULT_SELECT, heures_seul: ['Moins de 4h', '4 à 6h', '6 à 8h', 'Plus de 8h'] },
  },
  fa: {
    active: true, intro: '',
    types_animaux: ['Chien', 'Chat', 'Lapin', 'Autre'],
    durees: ['Court terme (quelques jours)', 'Moyen terme (quelques semaines)', 'Long terme (plusieurs mois)', 'Flexible selon les besoins'],
    options: { ...DEFAULT_SELECT, statut_familial: ['Seul(e)', 'En couple', 'Famille'], urgences: ['Oui, selon disponibilités', 'Non'] },
  },
};

// ── localStorage helpers ───────────────────────────────────────────────────

function loadConfig(): FormConfig {
  try {
    const raw = localStorage.getItem('form_config');
    if (raw) {
      const p = JSON.parse(raw);
      return {
        contact:  { ...DEFAULTS.contact,  ...p.contact },
        adoption: { ...DEFAULTS.adoption, ...p.adoption, options: { ...DEFAULTS.adoption.options, ...(p.adoption?.options ?? {}) } },
        fa:       { ...DEFAULTS.fa,       ...p.fa,       options: { ...DEFAULTS.fa.options,       ...(p.fa?.options       ?? {}) } },
      };
    }
  } catch { /* ignore */ }
  return structuredClone(DEFAULTS);
}

export function loadCustomForms(): CustomForm[] {
  try { const raw = localStorage.getItem('custom_forms'); if (raw) return JSON.parse(raw); } catch { /* ignore */ }
  return [];
}

// ── Shared UI components ───────────────────────────────────────────────────

function EditableList({ items, placeholder = 'Valeur...', onChange }: {
  items: string[]; placeholder?: string; onChange: (items: string[]) => void;
}) {
  const update = (i: number, v: string) => { const n = [...items]; n[i] = v; onChange(n); };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const n = [...items]; const j = i + dir;
    if (j < 0 || j >= n.length) return;
    [n[i], n[j]] = [n[j], n[i]]; onChange(n);
  };
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex flex-col">
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-20"><ChevronUp size={14} /></button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-20"><ChevronDown size={14} /></button>
          </div>
          <input className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coral-400"
            value={item} onChange={e => update(i, e.target.value)} placeholder={placeholder} />
          <button type="button" onClick={() => remove(i)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={15} /></button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, ''])}
        className="flex items-center gap-1.5 text-sm text-coral-500 hover:text-coral-700 font-medium mt-1">
        <Plus size={15} /> Ajouter une option
      </button>
    </div>
  );
}

function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: () => void; label: string; hint: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
      <div>
        <p className="font-semibold text-gray-800">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{hint}</p>
      </div>
      <button type="button" onClick={onChange} className={`w-12 h-6 rounded-full relative transition-colors ${checked ? 'bg-green-500' : 'bg-gray-300'}`}>
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-7' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-500 mb-2">{hint}</p>}
      {children}
    </div>
  );
}

function SectionDivider({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <span className="text-xs font-extrabold uppercase tracking-widest text-gray-400 whitespace-nowrap">{title}</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

// ── Custom form field editor ───────────────────────────────────────────────

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text',     label: 'Texte court' },
  { value: 'email',    label: 'Email' },
  { value: 'tel',      label: 'Téléphone' },
  { value: 'number',   label: 'Nombre' },
  { value: 'textarea', label: 'Texte long' },
  { value: 'select',   label: 'Liste déroulante' },
  { value: 'checkbox', label: 'Case à cocher' },
];

function CustomFormEditor({ form, onSave, onDelete, onBack }: {
  form: CustomForm;
  onSave: (form: CustomForm) => void;
  onDelete: () => void;
  onBack: () => void;
}) {
  const [f, setF] = useState<CustomForm>(form);

  const patch = (p: Partial<CustomForm>) => setF(c => ({ ...c, ...p }));

  const addField = () => {
    const field: CustomField = { id: `field_${Date.now()}`, label: '', type: 'text', required: false, placeholder: '', options: [] };
    setF(c => ({ ...c, fields: [...c.fields, field] }));
  };

  const updateField = (idx: number, p: Partial<CustomField>) =>
    setF(c => { const fields = [...c.fields]; fields[idx] = { ...fields[idx], ...p }; return { ...c, fields }; });

  const removeField = (idx: number) =>
    setF(c => ({ ...c, fields: c.fields.filter((_, i) => i !== idx) }));

  const moveField = (idx: number, dir: -1 | 1) =>
    setF(c => {
      const fields = [...c.fields]; const j = idx + dir;
      if (j < 0 || j >= fields.length) return c;
      [fields[idx], fields[j]] = [fields[j], fields[idx]];
      return { ...c, fields };
    });

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">← Retour</button>
        <span className="text-gray-300">|</span>
        <span className="font-bold text-gray-800 flex-1 truncate">{f.title || 'Nouveau formulaire'}</span>
        <button onClick={onDelete} className="text-sm text-red-400 hover:text-red-600 hover:underline">Supprimer</button>
        <button onClick={() => onSave(f)} className="flex items-center gap-2 px-4 py-2 bg-coral-500 text-white text-sm font-semibold rounded-lg hover:bg-coral-600 transition-colors">
          <Save size={14} /> Enregistrer
        </button>
      </div>

      <Toggle checked={f.active} onChange={() => patch({ active: !f.active })}
        label="Formulaire actif" hint="Rendre ce formulaire accessible sur le site" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Titre">
          <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coral-400"
            value={f.title} onChange={e => patch({ title: e.target.value })} placeholder="Ex : Demande de bénévolat" />
        </Field>
        <Field label="Slug (URL)" hint={`Accessible sur /formulaire/${f.slug || '…'}`}>
          <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coral-400"
            value={f.slug}
            onChange={e => patch({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
            placeholder="demande-benevolat" />
        </Field>
      </div>

      <Field label="Introduction" hint="Texte affiché en haut du formulaire (optionnel)">
        <textarea className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coral-400"
          rows={2} value={f.intro} onChange={e => patch({ intro: e.target.value })} />
      </Field>

      <Field label="Message de succès" hint="Affiché après envoi">
        <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coral-400"
          value={f.success_message} onChange={e => patch({ success_message: e.target.value })}
          placeholder="Merci ! Votre message a bien été envoyé." />
      </Field>

      <SectionDivider title="Champs du formulaire" />

      <div className="space-y-3">
        {f.fields.map((field, idx) => (
          <div key={field.id} className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
            <div className="flex items-start gap-2">
              <div className="flex flex-col pt-1">
                <button type="button" onClick={() => moveField(idx, -1)} disabled={idx === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-20"><ChevronUp size={13} /></button>
                <button type="button" onClick={() => moveField(idx, 1)} disabled={idx === f.fields.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-20"><ChevronDown size={13} /></button>
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-coral-400"
                  value={field.label} onChange={e => updateField(idx, { label: e.target.value })} placeholder="Label du champ" />
                <select className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-coral-400"
                  value={field.type} onChange={e => updateField(idx, { type: e.target.value as FieldType })}>
                  {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-1.5 text-xs text-gray-600 whitespace-nowrap pt-1.5">
                <input type="checkbox" checked={field.required} onChange={e => updateField(idx, { required: e.target.checked })} className="accent-coral-500" />
                Obligatoire
              </label>
              <button type="button" onClick={() => removeField(idx)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded mt-0.5">
                <Trash2 size={14} />
              </button>
            </div>
            {field.type !== 'checkbox' && (
              <input className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-coral-400"
                value={field.placeholder} onChange={e => updateField(idx, { placeholder: e.target.value })}
                placeholder="Texte indicatif (placeholder)…" />
            )}
            {field.type === 'select' && (
              <div className="pl-2">
                <p className="text-xs font-semibold text-gray-500 mb-2">Options de la liste :</p>
                <EditableList items={field.options} onChange={options => updateField(idx, { options })} placeholder="Option…" />
              </div>
            )}
          </div>
        ))}
        <button type="button" onClick={addField}
          className="flex items-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-coral-400 hover:text-coral-500 transition-colors font-medium justify-center">
          <Plus size={16} /> Ajouter un champ
        </button>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

type Tab = 'contact' | 'adoption' | 'fa' | 'custom';

export default function AdminFormulaires() {
  const [tab, setTab]               = useState<Tab>('contact');
  const [config, setConfig]         = useState<FormConfig>(loadConfig);
  const [customForms, setCustomForms] = useState<CustomForm[]>(loadCustomForms);
  const [editingForm, setEditingForm] = useState<CustomForm | null>(null);
  const [saved, setSaved]           = useState(false);

  const persist = (cfg: FormConfig, forms: CustomForm[]) => {
    localStorage.setItem('form_config', JSON.stringify(cfg));
    localStorage.setItem('custom_forms', JSON.stringify(forms));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const save = () => persist(config, customForms);

  const patchContact  = (p: Partial<FormConfig['contact']>)  => setConfig(c => ({ ...c, contact:  { ...c.contact,  ...p } }));
  const patchAdoption = (p: Partial<FormConfig['adoption']>) => setConfig(c => ({ ...c, adoption: { ...c.adoption, ...p } }));
  const patchAdoptionOpts = (p: Partial<FormConfig['adoption']['options']>) =>
    setConfig(c => ({ ...c, adoption: { ...c.adoption, options: { ...c.adoption.options, ...p } } }));
  const patchFa = (p: Partial<FormConfig['fa']>) => setConfig(c => ({ ...c, fa: { ...c.fa, ...p } }));
  const patchFaOpts = (p: Partial<FormConfig['fa']['options']>) =>
    setConfig(c => ({ ...c, fa: { ...c.fa, options: { ...c.fa.options, ...p } } }));

  const createForm = () => {
    const f: CustomForm = { id: `form_${Date.now()}`, title: '', slug: '', active: true, intro: '', success_message: 'Merci ! Votre message a bien été envoyé.', fields: [] };
    const updated = [...customForms, f];
    setCustomForms(updated);
    setEditingForm(f);
  };

  const saveCustomForm = (form: CustomForm) => {
    const updated = customForms.map(x => x.id === form.id ? form : x);
    setCustomForms(updated);
    setEditingForm(form);
    persist(config, updated);
  };

  const deleteCustomForm = (id: string) => {
    const updated = customForms.filter(f => f.id !== id);
    setCustomForms(updated);
    setEditingForm(null);
    persist(config, updated);
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: 'contact',  label: 'Contact' },
    { id: 'adoption', label: 'Adoption' },
    { id: 'fa',       label: "Famille d'accueil" },
    { id: 'custom',   label: 'Formulaires perso' },
  ];

  const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coral-400';

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <ClipboardList size={24} className="text-coral-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Formulaires</h1>
            <p className="text-sm text-gray-500 mt-0.5">Gérez les formulaires du site</p>
          </div>
        </div>
        {tab !== 'custom' && (
          <button onClick={save} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            saved ? 'bg-green-500 text-white' : 'bg-coral-500 text-white hover:bg-coral-600'
          }`}>
            <Save size={16} />
            {saved ? 'Enregistré !' : 'Enregistrer'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-7 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setEditingForm(null); }}
            className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              tab === t.id ? 'border-coral-500 text-coral-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
            {t.id === 'custom' && customForms.length > 0 && (
              <span className="ml-1.5 bg-gray-200 text-gray-600 text-xs rounded-full px-1.5 py-0.5">{customForms.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── CONTACT ── */}
      {tab === 'contact' && (
        <div className="space-y-6">
          <Toggle checked={config.contact.active} onChange={() => patchContact({ active: !config.contact.active })}
            label="Formulaire actif" hint="Afficher le formulaire de contact sur la page /contact" />
          <Field label="Texte d'introduction" hint="Affiché au-dessus du formulaire (optionnel)">
            <textarea className={inputCls} rows={3} value={config.contact.intro}
              onChange={e => patchContact({ intro: e.target.value })}
              placeholder="Ex : Vous pouvez nous écrire pour toute question…" />
          </Field>
          <Field label="Sujets disponibles" hint='Options de la liste déroulante "Sujet"'>
            <EditableList items={config.contact.subjects} onChange={subjects => patchContact({ subjects })} />
          </Field>
        </div>
      )}

      {/* ── ADOPTION ── */}
      {tab === 'adoption' && (
        <div className="space-y-6">
          <Toggle checked={config.adoption.active} onChange={() => patchAdoption({ active: !config.adoption.active })}
            label="Formulaire actif" hint="Afficher le formulaire de candidature adoption" />
          <Field label="Texte d'introduction" hint="Affiché avant le formulaire (optionnel)">
            <textarea className={inputCls} rows={3} value={config.adoption.intro}
              onChange={e => patchAdoption({ intro: e.target.value })}
              placeholder="Ex : Merci de remplir ce formulaire avec soin…" />
          </Field>
          <Field label="Texte de la charte d'adoption" hint="Case à cocher obligatoire — étape 4 (Projet)">
            <textarea className={inputCls} rows={4} value={config.adoption.charte_text}
              onChange={e => patchAdoption({ charte_text: e.target.value })} />
          </Field>

          <SectionDivider title="Listes déroulantes — étape Logement" />
          <Field label="Type de logement">
            <EditableList items={config.adoption.options.type_logement} onChange={v => patchAdoptionOpts({ type_logement: v })} />
          </Field>
          <Field label="Jardin / extérieur">
            <EditableList items={config.adoption.options.jardin} onChange={v => patchAdoptionOpts({ jardin: v })} />
          </Field>
          <Field label="Statut occupant">
            <EditableList items={config.adoption.options.statut_occupant} onChange={v => patchAdoptionOpts({ statut_occupant: v })} />
          </Field>

          <SectionDivider title="Listes déroulantes — étape Situation" />
          <Field label="Situation familiale">
            <EditableList items={config.adoption.options.statut_familial} onChange={v => patchAdoptionOpts({ statut_familial: v })} />
          </Field>
          <Field label="Heures seul par jour">
            <EditableList items={config.adoption.options.heures_seul} onChange={v => patchAdoptionOpts({ heures_seul: v })} />
          </Field>
        </div>
      )}

      {/* ── FAMILLE D'ACCUEIL ── */}
      {tab === 'fa' && (
        <div className="space-y-6">
          <Toggle checked={config.fa.active} onChange={() => patchFa({ active: !config.fa.active })}
            label="Formulaire actif" hint="Afficher le formulaire famille d'accueil" />
          <Field label="Texte d'introduction" hint="Affiché avant le formulaire (optionnel)">
            <textarea className={inputCls} rows={3} value={config.fa.intro}
              onChange={e => patchFa({ intro: e.target.value })}
              placeholder="Ex : Devenez famille d'accueil et aidez un animal…" />
          </Field>

          <SectionDivider title="Étape Disponibilités" />
          <Field label="Types d'animaux acceptés" hint="Cases à cocher">
            <EditableList items={config.fa.types_animaux} onChange={types_animaux => patchFa({ types_animaux })} />
          </Field>
          <Field label="Durées disponibles" hint='Liste déroulante "Durée disponible"'>
            <EditableList items={config.fa.durees} onChange={durees => patchFa({ durees })} />
          </Field>
          <Field label="Urgences acceptées" hint='Liste déroulante "Accueil immédiat"'>
            <EditableList items={config.fa.options.urgences} onChange={v => patchFaOpts({ urgences: v })} />
          </Field>

          <SectionDivider title="Listes déroulantes — étape Logement" />
          <Field label="Type de logement">
            <EditableList items={config.fa.options.type_logement} onChange={v => patchFaOpts({ type_logement: v })} />
          </Field>
          <Field label="Jardin / extérieur">
            <EditableList items={config.fa.options.jardin} onChange={v => patchFaOpts({ jardin: v })} />
          </Field>
          <Field label="Statut occupant">
            <EditableList items={config.fa.options.statut_occupant} onChange={v => patchFaOpts({ statut_occupant: v })} />
          </Field>

          <SectionDivider title="Listes déroulantes — étape Situation" />
          <Field label="Situation familiale">
            <EditableList items={config.fa.options.statut_familial} onChange={v => patchFaOpts({ statut_familial: v })} />
          </Field>
        </div>
      )}

      {/* ── FORMULAIRES PERSO ── */}
      {tab === 'custom' && (
        editingForm ? (
          <CustomFormEditor
            form={editingForm}
            onSave={saveCustomForm}
            onDelete={() => deleteCustomForm(editingForm.id)}
            onBack={() => setEditingForm(null)}
          />
        ) : (
          <div className="space-y-3">
            {customForms.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-semibold">Aucun formulaire personnalisé</p>
                <p className="text-sm mt-1">Créez un formulaire pour le publier sur le site</p>
              </div>
            ) : (
              customForms.map(f => (
                <div key={f.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{f.title || <span className="text-gray-400 italic">Sans titre</span>}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      /formulaire/{f.slug || '…'} · {f.fields.length} champ{f.fields.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${f.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                    {f.active ? 'Actif' : 'Inactif'}
                  </span>
                  <button onClick={() => setEditingForm(f)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0">
                    <Pencil size={13} /> Modifier
                  </button>
                </div>
              ))
            )}
            <button onClick={createForm}
              className="flex items-center gap-2 w-full px-4 py-4 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-coral-400 hover:text-coral-500 transition-colors font-medium justify-center">
              <Plus size={16} /> Créer un nouveau formulaire
            </button>
          </div>
        )
      )}
    </div>
  );
}
