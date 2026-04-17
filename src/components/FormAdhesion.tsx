import { useState } from 'react';
import { CheckCircle2, Send } from 'lucide-react';

interface FormData {
  prenom: string; nom: string; email: string; telephone: string;
  adresse: string; code_postal: string; ville: string; motivation: string;
}

const initial: FormData = {
  prenom: '', nom: '', email: '', telephone: '',
  adresse: '', code_postal: '', ville: '', motivation: '',
};

function Err({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-red-500 mt-1">{msg}</p>;
}

export default function FormAdhesion() {
  const [data, setData] = useState<FormData>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k: keyof FormData, v: string) => {
    setData(p => ({ ...p, [k]: v }));
    setErrors(p => { const n = { ...p }; delete n[k]; return n; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.prenom.trim()) e.prenom = 'Champ obligatoire';
    if (!data.nom.trim()) e.nom = 'Champ obligatoire';
    if (!data.email.trim()) e.email = 'Champ obligatoire';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = 'Adresse email invalide';
    if (!data.telephone.trim()) e.telephone = 'Champ obligatoire';
    else if (data.telephone.replace(/\D/g, '').length < 6) e.telephone = 'Numéro invalide';
    if (!data.ville.trim()) e.ville = 'Champ obligatoire';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSending(true);
    try {
      const candidature = {
        id: `adhesion-${Date.now()}`, type: 'adhesion',
        form_title: 'Adhésion', status: 'nouvelle',
        nom: `${data.prenom} ${data.nom}`, email: data.email,
        telephone: data.telephone,
        data: {
          adresse: [data.adresse, data.code_postal, data.ville].filter(Boolean).join(', '),
          motivation: data.motivation,
        },
        notes: '', createdAt: new Date().toISOString(),
      };
      const existing = JSON.parse(localStorage.getItem('candidatures') || '[]');
      localStorage.setItem('candidatures', JSON.stringify([candidature, ...existing]));
      const unread = parseInt(localStorage.getItem('candidatures_unread') || '0');
      localStorage.setItem('candidatures_unread', String(unread + 1));
    } catch { /**/ }
    setSending(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="bg-green-50 rounded-2xl p-10 text-center border-2 border-green-100">
        <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Demande envoyée !</h3>
        <p className="text-gray-600 text-sm">Nous vous contacterons très prochainement pour finaliser votre adhésion.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="bg-surface rounded-[20px] p-8 border-2 border-site-border space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="form-label">Prénom *</label>
          <input className={`form-input ${errors.prenom ? 'border-red-400' : ''}`}
            value={data.prenom} onChange={e => set('prenom', e.target.value)} placeholder="Jean" />
          <Err msg={errors.prenom} />
        </div>
        <div>
          <label className="form-label">Nom *</label>
          <input className={`form-input ${errors.nom ? 'border-red-400' : ''}`}
            value={data.nom} onChange={e => set('nom', e.target.value)} placeholder="Dupont" />
          <Err msg={errors.nom} />
        </div>
        <div>
          <label className="form-label">Email *</label>
          <input type="email" className={`form-input ${errors.email ? 'border-red-400' : ''}`}
            value={data.email} onChange={e => set('email', e.target.value)} placeholder="jean@exemple.fr" />
          <Err msg={errors.email} />
        </div>
        <div>
          <label className="form-label">Téléphone *</label>
          <input type="tel" className={`form-input ${errors.telephone ? 'border-red-400' : ''}`}
            value={data.telephone} onChange={e => set('telephone', e.target.value)} placeholder="06 00 00 00 00" />
          <Err msg={errors.telephone} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="sm:col-span-2">
          <label className="form-label">Adresse</label>
          <input className="form-input" value={data.adresse} onChange={e => set('adresse', e.target.value)} placeholder="12 rue des Fleurs" />
        </div>
        <div>
          <label className="form-label">Code postal</label>
          <input className="form-input" value={data.code_postal} onChange={e => set('code_postal', e.target.value)} placeholder="75001" />
        </div>
      </div>
      <div>
        <label className="form-label">Ville *</label>
        <input className={`form-input ${errors.ville ? 'border-red-400' : ''}`}
          value={data.ville} onChange={e => set('ville', e.target.value)} placeholder="Paris" />
        <Err msg={errors.ville} />
      </div>
      <div>
        <label className="form-label">Pourquoi souhaitez-vous adhérer ?</label>
        <textarea className="form-input" rows={4} value={data.motivation}
          onChange={e => set('motivation', e.target.value)}
          placeholder="Partagez votre motivation, vos envies de vous impliquer..." />
      </div>
      <button type="submit" disabled={sending} className="btn-primary w-full justify-center">
        {sending ? 'Envoi en cours...' : <><Send size={18} />Envoyer ma demande d'adhésion</>}
      </button>
    </form>
  );
}
