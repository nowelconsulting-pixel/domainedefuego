import { useState } from 'react';
import emailjs from '@emailjs/browser';
import { ChevronRight, ChevronLeft, CheckCircle2, AlertCircle } from 'lucide-react';

const STEPS = ['Identité', 'Logement', 'Situation', 'Disponibilités'];

const DEFAULT_TYPES  = ['Chien', 'Chat', 'Lapin', 'Autre'];
const DEFAULT_DUREES = [
  'Court terme (quelques jours)',
  'Moyen terme (quelques semaines)',
  'Long terme (plusieurs mois)',
  'Flexible selon les besoins',
];

function loadFaConfig() {
  try {
    const raw = localStorage.getItem('form_config');
    if (raw) {
      const cfg = JSON.parse(raw)?.fa ?? {};
      return {
        active:        cfg.active !== false,
        intro:         (cfg.intro as string) || '',
        types_animaux: Array.isArray(cfg.types_animaux) && cfg.types_animaux.length > 0 ? cfg.types_animaux as string[] : DEFAULT_TYPES,
        durees:        Array.isArray(cfg.durees)        && cfg.durees.length        > 0 ? cfg.durees        as string[] : DEFAULT_DUREES,
      };
    }
  } catch { /* ignore */ }
  return { active: true, intro: '', types_animaux: DEFAULT_TYPES, durees: DEFAULT_DUREES };
}

interface FormData {
  prenom: string; nom: string; email: string; telephone: string;
  adresse: string; code_postal: string; ville: string;
  type_logement: string; jardin: string; surface: string; statut_occupant: string;
  statut_familial: string; enfants: string; enfants_ages: string;
  autres_animaux: string; autres_animaux_detail: string;
  duree_disponible: string; types_acceptes: string[];
  urgences: string; experience: string;
}

const initialData: FormData = {
  prenom: '', nom: '', email: '', telephone: '', adresse: '', code_postal: '', ville: '',
  type_logement: '', jardin: '', surface: '', statut_occupant: '',
  statut_familial: '', enfants: '', enfants_ages: '', autres_animaux: '', autres_animaux_detail: '',
  duree_disponible: '', types_acceptes: [], urgences: '', experience: '',
};

// required string fields per step
const REQUIRED: Record<number, (keyof FormData)[]> = {
  0: ['prenom', 'nom', 'email', 'telephone', 'adresse', 'code_postal', 'ville'],
  1: ['type_logement', 'jardin', 'statut_occupant'],
  2: ['statut_familial'],
  3: ['duree_disponible', 'urgences'],
};

function Err({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-red-500 mt-1">{msg}</p>;
}

export default function FormFamilleAccueil() {
  const [cfg]   = useState(loadFaConfig);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof FormData, v: string | boolean) => {
    setData(prev => ({ ...prev, [k]: v }));
    setErrors(prev => { const n = { ...prev }; delete n[k as string]; return n; });
  };

  const toggleType = (t: string) => {
    setData(prev => ({
      ...prev,
      types_acceptes: prev.types_acceptes.includes(t)
        ? prev.types_acceptes.filter(x => x !== t)
        : [...prev.types_acceptes, t],
    }));
    setErrors(prev => { const n = { ...prev }; delete n.types_acceptes; return n; });
  };

  const validateStep = (s: number): boolean => {
    const required = REQUIRED[s] ?? [];
    const newErrors: Record<string, string> = {};
    for (const field of required) {
      if (!data[field]) newErrors[field as string] = 'Champ obligatoire';
    }
    if (s === 3 && data.types_acceptes.length === 0) {
      newErrors.types_acceptes = 'Champ obligatoire';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const next = () => {
    if (validateStep(step)) setStep(s => Math.min(s + 1, 3));
  };

  const sendEmail = async () => {
    if (!validateStep(3)) return;
    setSending(true);
    setError('');
    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_FA,
        { ...data, types_acceptes: data.types_acceptes.join(', ') },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
      );
      const candidature = {
        id: `fa-${Date.now()}`, type: 'fa', status: 'nouvelle',
        nom: `${data.prenom} ${data.nom}`, email: data.email, telephone: data.telephone,
        data: {
          adresse: `${data.adresse}, ${data.code_postal} ${data.ville}`,
          logement: `${data.type_logement}, jardin: ${data.jardin}`,
          situation: data.statut_familial,
          enfants: data.enfants === 'Oui' ? `Oui (${data.enfants_ages})` : 'Non',
          duree: data.duree_disponible,
          types_acceptes: data.types_acceptes.join(', '),
          urgences: data.urgences,
          experience: data.experience,
        },
        notes: '', createdAt: new Date().toISOString(),
      };
      const existing = JSON.parse(localStorage.getItem('candidatures') || '[]');
      localStorage.setItem('candidatures', JSON.stringify([candidature, ...existing]));
      const unread = parseInt(localStorage.getItem('candidatures_unread') || '0');
      localStorage.setItem('candidatures_unread', String(unread + 1));
      setSent(true);
    } catch {
      setError("Une erreur est survenue lors de l'envoi. Veuillez réessayer.");
    } finally {
      setSending(false);
    }
  };

  if (!cfg.active) {
    return (
      <div className="bg-gray-50 rounded-2xl p-10 text-center text-gray-500">
        <p className="text-lg font-semibold mb-2">Formulaire temporairement indisponible</p>
        <p className="text-sm">Les candidatures famille d'accueil sont momentanément suspendues. Revenez bientôt.</p>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="bg-green-50 rounded-2xl p-10 text-center">
        <CheckCircle2 size={56} className="text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Candidature envoyée !</h3>
        <p className="text-gray-600">
          Merci pour votre candidature famille d'accueil. Nous vous contacterons très prochainement.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      {cfg.intro && (
        <div className="px-6 pt-5 pb-0">
          <p className="text-sm text-gray-600 leading-relaxed">{cfg.intro}</p>
        </div>
      )}
      {/* Progress */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((_s, i) => (
            <div key={i} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                i < step ? 'bg-green-500 text-white' : i === step ? 'bg-coral-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-1 w-full min-w-[20px] mx-1 rounded ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
        <p className="text-sm font-medium text-gray-700">Étape {step + 1}/{STEPS.length} — {STEPS[step]}</p>
      </div>

      <div className="p-6 md:p-8">
        {step === 0 && (
          <div className="space-y-5">
            <h3 className="text-xl font-semibold text-gray-900">Votre identité</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="form-label">Prénom *</label>
                <input className={`form-input ${errors.prenom ? 'border-red-400' : ''}`} value={data.prenom} onChange={e => set('prenom', e.target.value)} placeholder="Jean" />
                <Err msg={errors.prenom} />
              </div>
              <div>
                <label className="form-label">Nom *</label>
                <input className={`form-input ${errors.nom ? 'border-red-400' : ''}`} value={data.nom} onChange={e => set('nom', e.target.value)} placeholder="Dupont" />
                <Err msg={errors.nom} />
              </div>
              <div>
                <label className="form-label">Email *</label>
                <input type="email" className={`form-input ${errors.email ? 'border-red-400' : ''}`} value={data.email} onChange={e => set('email', e.target.value)} placeholder="jean@exemple.fr" />
                <Err msg={errors.email} />
              </div>
              <div>
                <label className="form-label">Téléphone *</label>
                <input type="tel" className={`form-input ${errors.telephone ? 'border-red-400' : ''}`} value={data.telephone} onChange={e => set('telephone', e.target.value)} placeholder="06 00 00 00 00" />
                <Err msg={errors.telephone} />
              </div>
            </div>
            <div>
              <label className="form-label">Adresse *</label>
              <input className={`form-input ${errors.adresse ? 'border-red-400' : ''}`} value={data.adresse} onChange={e => set('adresse', e.target.value)} placeholder="12 rue des Fleurs" />
              <Err msg={errors.adresse} />
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="form-label">Code postal *</label>
                <input className={`form-input ${errors.code_postal ? 'border-red-400' : ''}`} value={data.code_postal} onChange={e => set('code_postal', e.target.value)} placeholder="07200" />
                <Err msg={errors.code_postal} />
              </div>
              <div>
                <label className="form-label">Ville *</label>
                <input className={`form-input ${errors.ville ? 'border-red-400' : ''}`} value={data.ville} onChange={e => set('ville', e.target.value)} placeholder="Aubenas" />
                <Err msg={errors.ville} />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <h3 className="text-xl font-semibold text-gray-900">Votre logement</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="form-label">Type de logement *</label>
                <select className={`form-input ${errors.type_logement ? 'border-red-400' : ''}`} value={data.type_logement} onChange={e => set('type_logement', e.target.value)}>
                  <option value="">Choisir...</option>
                  <option>Maison</option><option>Appartement</option><option>Autre</option>
                </select>
                <Err msg={errors.type_logement} />
              </div>
              <div>
                <label className="form-label">Jardin / extérieur *</label>
                <select className={`form-input ${errors.jardin ? 'border-red-400' : ''}`} value={data.jardin} onChange={e => set('jardin', e.target.value)}>
                  <option value="">Choisir...</option>
                  <option>Oui, clôturé</option><option>Oui, non clôturé</option><option>Non</option>
                </select>
                <Err msg={errors.jardin} />
              </div>
              <div>
                <label className="form-label">Surface (m²)</label>
                <input type="number" className="form-input" value={data.surface} onChange={e => set('surface', e.target.value)} placeholder="Ex: 70" />
              </div>
              <div>
                <label className="form-label">Statut *</label>
                <select className={`form-input ${errors.statut_occupant ? 'border-red-400' : ''}`} value={data.statut_occupant} onChange={e => set('statut_occupant', e.target.value)}>
                  <option value="">Choisir...</option>
                  <option>Propriétaire</option>
                  <option>Locataire avec autorisation</option>
                  <option>Locataire (à vérifier)</option>
                </select>
                <Err msg={errors.statut_occupant} />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h3 className="text-xl font-semibold text-gray-900">Votre situation</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="form-label">Situation familiale *</label>
                <select className={`form-input ${errors.statut_familial ? 'border-red-400' : ''}`} value={data.statut_familial} onChange={e => set('statut_familial', e.target.value)}>
                  <option value="">Choisir...</option>
                  <option>Seul(e)</option><option>En couple</option><option>Famille</option>
                </select>
                <Err msg={errors.statut_familial} />
              </div>
              <div>
                <label className="form-label">Enfants à la maison ?</label>
                <select className="form-input" value={data.enfants} onChange={e => set('enfants', e.target.value)}>
                  <option value="">Choisir...</option>
                  <option>Non</option><option>Oui</option>
                </select>
              </div>
            </div>
            {data.enfants === 'Oui' && (
              <div>
                <label className="form-label">Âge(s) des enfants</label>
                <input className="form-input" value={data.enfants_ages} onChange={e => set('enfants_ages', e.target.value)} placeholder="Ex: 4 ans, 8 ans" />
              </div>
            )}
            <div>
              <label className="form-label">Autres animaux à la maison ?</label>
              <select className="form-input" value={data.autres_animaux} onChange={e => set('autres_animaux', e.target.value)}>
                <option value="">Choisir...</option>
                <option>Non</option><option>Oui</option>
              </select>
            </div>
            {data.autres_animaux === 'Oui' && (
              <div>
                <label className="form-label">Précisez</label>
                <input className="form-input" value={data.autres_animaux_detail} onChange={e => set('autres_animaux_detail', e.target.value)} placeholder="Ex: 1 chat, 1 labrador" />
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h3 className="text-xl font-semibold text-gray-900">Vos disponibilités</h3>
            <div>
              <label className="form-label">Durée disponible *</label>
              <select className={`form-input ${errors.duree_disponible ? 'border-red-400' : ''}`} value={data.duree_disponible} onChange={e => set('duree_disponible', e.target.value)}>
                <option value="">Choisir...</option>
                {cfg.durees.map(d => <option key={d}>{d}</option>)}
              </select>
              <Err msg={errors.duree_disponible} />
            </div>
            <div>
              <label className="form-label">Types d'animaux acceptés *</label>
              <div className="flex flex-wrap gap-3 mt-2">
                {cfg.types_animaux.map(t => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-coral-500"
                      checked={data.types_acceptes.includes(t)}
                      onChange={() => toggleType(t)}
                    />
                    <span className="text-sm text-gray-700">{t}</span>
                  </label>
                ))}
              </div>
              <Err msg={errors.types_acceptes} />
            </div>
            <div>
              <label className="form-label">Urgences acceptées (accueil immédiat) ? *</label>
              <select className={`form-input ${errors.urgences ? 'border-red-400' : ''}`} value={data.urgences} onChange={e => set('urgences', e.target.value)}>
                <option value="">Choisir...</option>
                <option>Oui, selon disponibilités</option>
                <option>Non</option>
              </select>
              <Err msg={errors.urgences} />
            </div>
            <div>
              <label className="form-label">Votre expérience avec les animaux</label>
              <textarea
                className="form-input"
                rows={4}
                value={data.experience}
                onChange={e => set('experience', e.target.value)}
                placeholder="Racontez-nous votre expérience passée avec des animaux..."
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 rounded-lg text-red-700 text-sm">
                <AlertCircle size={18} />{error}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
          <button onClick={() => setStep(s => Math.max(s - 1, 0))} disabled={step === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-40 transition-colors">
            <ChevronLeft size={20} />Précédent
          </button>
          {step < 3 ? (
            <button onClick={next} className="btn-primary">
              Suivant<ChevronRight size={20} />
            </button>
          ) : (
            <button onClick={sendEmail} disabled={sending}
              className="btn-primary disabled:opacity-50">
              {sending ? 'Envoi...' : 'Envoyer ma candidature'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
