import { useState } from 'react';
import { ClipboardList, Save, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

interface FormConfig {
  contact:  { active: boolean; intro: string; subjects: string[] };
  adoption: { active: boolean; intro: string; charte_text: string };
  fa:       { active: boolean; intro: string; types_animaux: string[]; durees: string[] };
}

const DEFAULTS: FormConfig = {
  contact: {
    active: true,
    intro: '',
    subjects: [
      'Question sur un animal',
      'Candidature adoption',
      "Famille d'accueil",
      'Don / financement',
      'Partenariat',
      'Autre',
    ],
  },
  adoption: {
    active: true,
    intro: '',
    charte_text:
      "J'ai lu et j'accepte la charte d'adoption de Domaine de Fuego. Je m'engage à adopter l'animal en toute responsabilité, pour toute sa vie.",
  },
  fa: {
    active: true,
    intro: '',
    types_animaux: ['Chien', 'Chat', 'Lapin', 'Autre'],
    durees: [
      'Court terme (quelques jours)',
      'Moyen terme (quelques semaines)',
      'Long terme (plusieurs mois)',
      'Flexible selon les besoins',
    ],
  },
};

function loadConfig(): FormConfig {
  try {
    const raw = localStorage.getItem('form_config');
    if (raw) {
      const p = JSON.parse(raw);
      return {
        contact:  { ...DEFAULTS.contact,  ...p.contact },
        adoption: { ...DEFAULTS.adoption, ...p.adoption },
        fa:       { ...DEFAULTS.fa,       ...p.fa },
      };
    }
  } catch { /* ignore */ }
  return structuredClone(DEFAULTS);
}

// ── Editable ordered list ──────────────────────────────────────────────────
function EditableList({
  items,
  placeholder = 'Valeur...',
  onChange,
}: {
  items: string[];
  placeholder?: string;
  onChange: (items: string[]) => void;
}) {
  const update = (i: number, v: string) => {
    const n = [...items]; n[i] = v; onChange(n);
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const n = [...items];
    const j = i + dir;
    if (j < 0 || j >= n.length) return;
    [n[i], n[j]] = [n[j], n[i]];
    onChange(n);
  };

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex flex-col gap-0">
            <button
              type="button"
              onClick={() => move(i, -1)}
              disabled={i === 0}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-20"
            >
              <ChevronUp size={14} />
            </button>
            <button
              type="button"
              onClick={() => move(i, 1)}
              disabled={i === items.length - 1}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-20"
            >
              <ChevronDown size={14} />
            </button>
          </div>
          <input
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coral-400"
            value={item}
            onChange={e => update(i, e.target.value)}
            placeholder={placeholder}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ''])}
        className="flex items-center gap-1.5 text-sm text-coral-500 hover:text-coral-700 font-medium mt-1"
      >
        <Plus size={15} /> Ajouter une option
      </button>
    </div>
  );
}

// ── Toggle switch ──────────────────────────────────────────────────────────
function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: () => void; label: string; hint: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
      <div>
        <p className="font-semibold text-gray-800">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{hint}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`w-12 h-6 rounded-full relative transition-colors ${checked ? 'bg-green-500' : 'bg-gray-300'}`}
      >
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-7' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

// ── Section label ─────────────────────────────────────────────────────────
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-500 mb-2">{hint}</p>}
      {children}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
type Tab = 'contact' | 'adoption' | 'fa';

export default function AdminFormulaires() {
  const [tab, setTab]       = useState<Tab>('contact');
  const [config, setConfig] = useState<FormConfig>(loadConfig);
  const [saved, setSaved]   = useState(false);

  const save = () => {
    localStorage.setItem('form_config', JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const patchContact  = (p: Partial<FormConfig['contact']>)  => setConfig(c => ({ ...c, contact:  { ...c.contact,  ...p } }));
  const patchAdoption = (p: Partial<FormConfig['adoption']>) => setConfig(c => ({ ...c, adoption: { ...c.adoption, ...p } }));
  const patchFa       = (p: Partial<FormConfig['fa']>)       => setConfig(c => ({ ...c, fa:       { ...c.fa,       ...p } }));

  const TABS: { id: Tab; label: string }[] = [
    { id: 'contact',  label: 'Contact' },
    { id: 'adoption', label: 'Adoption' },
    { id: 'fa',       label: "Famille d'accueil" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <ClipboardList size={24} className="text-coral-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Formulaires</h1>
            <p className="text-sm text-gray-500 mt-0.5">Personnalisez les formulaires du site</p>
          </div>
        </div>
        <button
          onClick={save}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            saved ? 'bg-green-500 text-white' : 'bg-coral-500 text-white hover:bg-coral-600'
          }`}
        >
          <Save size={16} />
          {saved ? 'Enregistré !' : 'Enregistrer'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-7">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id
                ? 'border-coral-500 text-coral-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── CONTACT ── */}
      {tab === 'contact' && (
        <div className="space-y-6">
          <Toggle
            checked={config.contact.active}
            onChange={() => patchContact({ active: !config.contact.active })}
            label="Formulaire actif"
            hint="Afficher le formulaire de contact sur le site"
          />
          <Field label="Texte d'introduction" hint="Affiché au-dessus du formulaire (optionnel)">
            <textarea
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coral-400"
              rows={3}
              value={config.contact.intro}
              onChange={e => patchContact({ intro: e.target.value })}
              placeholder="Ex : Vous pouvez nous écrire pour toute question…"
            />
          </Field>
          <Field label="Sujets disponibles" hint='Options affichées dans la liste déroulante "Sujet"'>
            <EditableList
              items={config.contact.subjects}
              onChange={subjects => patchContact({ subjects })}
            />
          </Field>
        </div>
      )}

      {/* ── ADOPTION ── */}
      {tab === 'adoption' && (
        <div className="space-y-6">
          <Toggle
            checked={config.adoption.active}
            onChange={() => patchAdoption({ active: !config.adoption.active })}
            label="Formulaire actif"
            hint="Afficher le formulaire de candidature adoption sur le site"
          />
          <Field label="Texte d'introduction" hint="Affiché avant le formulaire (optionnel)">
            <textarea
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coral-400"
              rows={3}
              value={config.adoption.intro}
              onChange={e => patchAdoption({ intro: e.target.value })}
              placeholder="Ex : Merci de remplir ce formulaire avec soin…"
            />
          </Field>
          <Field label="Texte de la charte d'adoption" hint="Case à cocher obligatoire à l'étape 4 — Projet">
            <textarea
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coral-400"
              rows={4}
              value={config.adoption.charte_text}
              onChange={e => patchAdoption({ charte_text: e.target.value })}
            />
          </Field>
        </div>
      )}

      {/* ── FAMILLE D'ACCUEIL ── */}
      {tab === 'fa' && (
        <div className="space-y-6">
          <Toggle
            checked={config.fa.active}
            onChange={() => patchFa({ active: !config.fa.active })}
            label="Formulaire actif"
            hint="Afficher le formulaire famille d'accueil sur le site"
          />
          <Field label="Texte d'introduction" hint="Affiché avant le formulaire (optionnel)">
            <textarea
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coral-400"
              rows={3}
              value={config.fa.intro}
              onChange={e => patchFa({ intro: e.target.value })}
              placeholder="Ex : Devenez famille d'accueil et aidez un animal…"
            />
          </Field>
          <Field
            label="Types d'animaux acceptés"
            hint='Cases à cocher proposées à l\'étape "Disponibilités"'
          >
            <EditableList
              items={config.fa.types_animaux}
              onChange={types_animaux => patchFa({ types_animaux })}
            />
          </Field>
          <Field label="Options de durée" hint='Liste déroulante "Durée disponible"'>
            <EditableList
              items={config.fa.durees}
              onChange={durees => patchFa({ durees })}
            />
          </Field>
        </div>
      )}
    </div>
  );
}
