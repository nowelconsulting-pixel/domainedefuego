import { useState } from 'react';
import emailjs from '@emailjs/browser';
import { CheckCircle2, AlertCircle, Send } from 'lucide-react';

interface ContactData {
  nom: string;
  email: string;
  sujet: string;
  message: string;
}

const sujets = [
  'Question sur un animal',
  'Candidature adoption',
  'Famille d\'accueil',
  'Don / financement',
  'Partenariat',
  'Autre',
];

export default function FormContact() {
  const [data, setData] = useState<ContactData>({ nom: '', email: '', sujet: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof ContactData, v: string) => setData(p => ({ ...p, [k]: v }));

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <form onSubmit={send} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="form-label">Nom complet *</label>
          <input
            className="form-input"
            value={data.nom}
            onChange={e => set('nom', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="form-label">Email *</label>
          <input
            type="email"
            className="form-input"
            value={data.email}
            onChange={e => set('email', e.target.value)}
            required
          />
        </div>
      </div>
      <div>
        <label className="form-label">Sujet *</label>
        <select
          className="form-input"
          value={data.sujet}
          onChange={e => set('sujet', e.target.value)}
          required
        >
          <option value="">Choisir un sujet...</option>
          {sujets.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="form-label">Message *</label>
        <textarea
          className="form-input"
          rows={6}
          value={data.message}
          onChange={e => set('message', e.target.value)}
          required
          placeholder="Votre message..."
        />
      </div>
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 rounded-lg text-red-700 text-sm">
          <AlertCircle size={18} />{error}
        </div>
      )}
      <button type="submit" disabled={sending} className="btn-primary w-full justify-center">
        {sending ? 'Envoi en cours...' : (
          <><Send size={18} />Envoyer le message</>
        )}
      </button>
    </form>
  );
}
