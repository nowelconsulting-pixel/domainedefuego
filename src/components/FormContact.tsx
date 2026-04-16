import { useState } from 'react';
import emailjs from '@emailjs/browser';
import { CheckCircle2, AlertCircle, Send } from 'lucide-react';

interface ContactData {
  nom: string; email: string; sujet: string; message: string;
}

const DEFAULT_SUBJECTS = [
  'Question sur un animal', "Candidature adoption", "Famille d'accueil",
  'Don / financement', 'Partenariat', 'Autre',
];

function loadContactConfig() {
  try {
    const raw = localStorage.getItem('form_config');
    if (raw) {
      const cfg = JSON.parse(raw)?.contact ?? {};
      return {
        active: cfg.active !== false,
        intro: (cfg.intro as string) || '',
        subjects: Array.isArray(cfg.subjects) && cfg.subjects.length > 0 ? cfg.subjects as string[] : DEFAULT_SUBJECTS,
      };
    }
  } catch { /* ignore */ }
  return { active: true, intro: '', subjects: DEFAULT_SUBJECTS };
}

function Err({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-red-500 mt-1">{msg}</p>;
}

export default function FormContact() {
  const [cfg]    = useState(loadContactConfig);
  const [data, setData] = useState<ContactData>({ nom: '', email: '', sujet: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  if (!cfg.active) {
    return (
      <div className="bg-gray-50 rounded-2xl p-10 text-center text-gray-500">
        <p className="text-lg font-semibold mb-2">Formulaire temporairement indisponible</p>
        <p className="text-sm">Veuillez nous contacter directement par email.</p>
      </div>
    );
  }

  const set = (k: keyof ContactData, v: string) => {
    setData(p => ({ ...p, [k]: v }));
    setErrors(prev => { const n = { ...prev }; delete n[k]; return n; });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!data.nom.trim()) newErrors.nom = 'Champ obligatoire';
    if (!data.email.trim()) newErrors.email = 'Champ obligatoire';
    if (!data.sujet) newErrors.sujet = 'Champ obligatoire';
    if (!data.message.trim()) newErrors.message = 'Champ obligatoire';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSending(true);
    setError('');
    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_CONTACT,
        data as unknown as Record<string, unknown>,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
      );
      setSent(true);
    } catch {
      setError("Erreur lors de l'envoi. Veuillez réessayer ou nous contacter par email.");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="bg-green-50 rounded-2xl p-10 text-center">
        <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Message envoyé !</h3>
        <p className="text-gray-600">Nous vous répondrons dans les meilleurs délais.</p>
      </div>
    );
  }

  return (
    <form onSubmit={send} noValidate className="space-y-5">
      {cfg.intro && <p className="text-muted text-sm leading-relaxed">{cfg.intro}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="form-label">Nom complet *</label>
          <input
            className={`form-input ${errors.nom ? 'border-red-400' : ''}`}
            value={data.nom}
            onChange={e => set('nom', e.target.value)}
            placeholder="Jean Dupont"
          />
          <Err msg={errors.nom} />
        </div>
        <div>
          <label className="form-label">Email *</label>
          <input
            type="email"
            className={`form-input ${errors.email ? 'border-red-400' : ''}`}
            value={data.email}
            onChange={e => set('email', e.target.value)}
            placeholder="jean@exemple.fr"
          />
          <Err msg={errors.email} />
        </div>
      </div>
      <div>
        <label className="form-label">Sujet *</label>
        <select
          className={`form-input ${errors.sujet ? 'border-red-400' : ''}`}
          value={data.sujet}
          onChange={e => set('sujet', e.target.value)}
        >
          <option value="">Choisir un sujet...</option>
          {cfg.subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <Err msg={errors.sujet} />
      </div>
      <div>
        <label className="form-label">Message *</label>
        <textarea
          className={`form-input ${errors.message ? 'border-red-400' : ''}`}
          rows={6}
          value={data.message}
          onChange={e => set('message', e.target.value)}
          placeholder="Votre message..."
        />
        <Err msg={errors.message} />
      </div>
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 rounded-lg text-red-700 text-sm">
          <AlertCircle size={18} />{error}
        </div>
      )}
      <button type="submit" disabled={sending} className="btn-primary w-full justify-center">
        {sending ? 'Envoi en cours...' : <><Send size={18} />Envoyer le message</>}
      </button>
    </form>
  );
}
