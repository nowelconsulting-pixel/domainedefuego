import { useState } from 'react';
import emailjs from '@emailjs/browser';
import { ChevronRight, ChevronLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAnimaux } from '../hooks/useData';

const STEPS = ['Identité', 'Logement', 'Situation', 'Projet'];

interface FormData {
  // Step 1
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  code_postal: string;
  ville: string;
  // Step 2
  type_logement: string;
  jardin: string;
  surface: string;
  statut_occupant: string;
  // Step 3
  statut_familial: string;
  enfants: string;
  enfants_ages: string;
  autres_animaux: string;
  autres_animaux_detail: string;
  heures_seul: string;
  vacances: string;
  // Step 4
  animal_souhaite: string;
  pourquoi_adopter: string;
  charte_acceptee: boolean;
}

const initialData: FormData = {
  prenom: '', nom: '', email: '', telephone: '', adresse: '', code_postal: '', ville: '',
  type_logement: '', jardin: '', surface: '', statut_occupant: '',
  statut_familial: '', enfants: '', enfants_ages: '', autres_animaux: '', autres_animaux_detail: '',
  heures_seul: '', vacances: '',
  animal_souhaite: '', pourquoi_adopter: '', charte_acceptee: false,
};

export default function FormAdoption({ defaultAnimal = '' }: { defaultAnimal?: string }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>({ ...initialData, animal_souhaite: defaultAnimal });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const { data: animaux } = useAnimaux();
  const disponibles = animaux?.filter(a => a.statut === 'Disponible') ?? [];

  const set = (k: keyof FormData, v: string | boolean) =>
    setData(prev => ({ ...prev, [k]: v }));

  const next = () => setStep(s => Math.min(s + 1, 3));
  const prev = () => setStep(s => Math.max(s - 1, 0));

  const sendEmail = async () => {
    setSending(true);
    setError('');
    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ADOPTION,
        { ...data, charte_acceptee: data.charte_acceptee ? 'Oui' : 'Non' },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
      );
      // Save candidature to localStorage for admin tracking
      const candidature = {
        id: `adoption-${Date.now()}`,
        type: 'adoption',
        status: 'nouvelle',
        animal: data.animal_souhaite || undefined,
        nom: `${data.prenom} ${data.nom}`,
        email: data.email,
        telephone: data.telephone,
        data: {
          adresse: `${data.adresse}, ${data.code_postal} ${data.ville}`,
          logement: `${data.type_logement}, jardin: ${data.jardin}`,
          statut: data.statut_occupant,
          situation: data.statut_familial,
          enfants: data.enfants === 'Oui' ? `Oui (${data.enfants_ages})` : 'Non',
          autres_animaux: data.autres_animaux === 'Oui' ? data.autres_animaux_detail : 'Non',
          heures_seul: data.heures_seul,
          vacances: data.vacances,
          pourquoi_adopter: data.pourquoi_adopter,
        },
        notes: '',
        createdAt: new Date().toISOString(),
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

  if (sent) {
    return (
      <div className="bg-green-50 rounded-2xl p-10 text-center">
        <CheckCircle2 size={56} className="text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Candidature envoyée !</h3>
        <p className="text-gray-600">
          Merci pour votre candidature. Un membre de notre équipe vous contactera dans les plus brefs délais.
          Un email de confirmation vous a été envoyé à l'adresse <strong>{data.email}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      {/* Progress */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((_s, i) => (
            <div key={i} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  i < step ? 'bg-green-500 text-white' :
                  i === step ? 'bg-coral-500 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}
              >
                {i < step ? '✓' : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-1 w-full min-w-[20px] mx-1 rounded transition-all ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
        <p className="text-sm font-medium text-gray-700">
          Étape {step + 1}/{STEPS.length} — {STEPS[step]}
        </p>
      </div>

      <div className="p-6 md:p-8">
        {/* Step 1 */}
        {step === 0 && (
          <div className="space-y-5">
            <h3 className="text-xl font-semibold text-gray-900">Votre identité</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="form-label">Prénom *</label>
                <input className="form-input" value={data.prenom} onChange={e => set('prenom', e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Nom *</label>
                <input className="form-input" value={data.nom} onChange={e => set('nom', e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Email *</label>
                <input type="email" className="form-input" value={data.email} onChange={e => set('email', e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Téléphone *</label>
                <input type="tel" className="form-input" value={data.telephone} onChange={e => set('telephone', e.target.value)} required />
              </div>
            </div>
            <div>
              <label className="form-label">Adresse *</label>
              <input className="form-input" value={data.adresse} onChange={e => set('adresse', e.target.value)} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="form-label">Code postal *</label>
                <input className="form-input" value={data.code_postal} onChange={e => set('code_postal', e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Ville *</label>
                <input className="form-input" value={data.ville} onChange={e => set('ville', e.target.value)} required />
              </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 1 && (
          <div className="space-y-5">
            <h3 className="text-xl font-semibold text-gray-900">Votre logement</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="form-label">Type de logement *</label>
                <select className="form-input" value={data.type_logement} onChange={e => set('type_logement', e.target.value)}>
                  <option value="">Choisir...</option>
                  <option value="Maison">Maison</option>
                  <option value="Appartement">Appartement</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              <div>
                <label className="form-label">Jardin / extérieur *</label>
                <select className="form-input" value={data.jardin} onChange={e => set('jardin', e.target.value)}>
                  <option value="">Choisir...</option>
                  <option value="Oui, clôturé">Oui, clôturé</option>
                  <option value="Oui, non clôturé">Oui, non clôturé</option>
                  <option value="Non">Non</option>
                </select>
              </div>
              <div>
                <label className="form-label">Surface approximative (m²)</label>
                <input type="number" className="form-input" value={data.surface} onChange={e => set('surface', e.target.value)} placeholder="Ex: 70" />
              </div>
              <div>
                <label className="form-label">Statut *</label>
                <select className="form-input" value={data.statut_occupant} onChange={e => set('statut_occupant', e.target.value)}>
                  <option value="">Choisir...</option>
                  <option value="Propriétaire">Propriétaire</option>
                  <option value="Locataire avec autorisation">Locataire avec autorisation</option>
                  <option value="Locataire (à vérifier)">Locataire (à vérifier)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 2 && (
          <div className="space-y-5">
            <h3 className="text-xl font-semibold text-gray-900">Votre situation</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="form-label">Situation familiale *</label>
                <select className="form-input" value={data.statut_familial} onChange={e => set('statut_familial', e.target.value)}>
                  <option value="">Choisir...</option>
                  <option value="Seul(e)">Seul(e)</option>
                  <option value="En couple">En couple</option>
                  <option value="Famille">Famille avec enfant(s)</option>
                </select>
              </div>
              <div>
                <label className="form-label">Enfants à la maison ? *</label>
                <select className="form-input" value={data.enfants} onChange={e => set('enfants', e.target.value)}>
                  <option value="">Choisir...</option>
                  <option value="Non">Non</option>
                  <option value="Oui">Oui</option>
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
              <label className="form-label">Autres animaux à la maison ? *</label>
              <select className="form-input" value={data.autres_animaux} onChange={e => set('autres_animaux', e.target.value)}>
                <option value="">Choisir...</option>
                <option value="Non">Non</option>
                <option value="Oui">Oui</option>
              </select>
            </div>
            {data.autres_animaux === 'Oui' && (
              <div>
                <label className="form-label">Précisez lesquels</label>
                <input className="form-input" value={data.autres_animaux_detail} onChange={e => set('autres_animaux_detail', e.target.value)} placeholder="Ex: 1 chat, 1 labrador" />
              </div>
            )}
            <div>
              <label className="form-label">Combien d'heures l'animal serait-il seul par jour ? *</label>
              <select className="form-input" value={data.heures_seul} onChange={e => set('heures_seul', e.target.value)}>
                <option value="">Choisir...</option>
                <option value="Moins de 4h">Moins de 4h</option>
                <option value="4 à 6h">4 à 6h</option>
                <option value="6 à 8h">6 à 8h</option>
                <option value="Plus de 8h">Plus de 8h</option>
              </select>
            </div>
            <div>
              <label className="form-label">Que faites-vous de l'animal pendant les vacances ? *</label>
              <textarea
                className="form-input"
                rows={3}
                value={data.vacances}
                onChange={e => set('vacances', e.target.value)}
                placeholder="Ex: pension, famille de confiance, emmenez-le avec vous..."
              />
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 3 && (
          <div className="space-y-5">
            <h3 className="text-xl font-semibold text-gray-900">Votre projet</h3>
            <div>
              <label className="form-label">Animal souhaité</label>
              <select className="form-input" value={data.animal_souhaite} onChange={e => set('animal_souhaite', e.target.value)}>
                <option value="">Pas de préférence</option>
                {disponibles.map(a => (
                  <option key={a.id} value={a.nom}>{a.nom} ({a.espece} · {a.race})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Pourquoi souhaitez-vous adopter ? *</label>
              <textarea
                className="form-input"
                rows={5}
                value={data.pourquoi_adopter}
                onChange={e => set('pourquoi_adopter', e.target.value)}
                placeholder="Parlez-nous de votre projet, vos attentes, votre expérience avec les animaux..."
              />
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 w-5 h-5 accent-coral-500"
                checked={data.charte_acceptee}
                onChange={e => set('charte_acceptee', e.target.checked)}
              />
              <span className="text-sm text-gray-700">
                J'ai lu et j'accepte la charte d'adoption de Domaine de Fuego. Je m'engage à adopter l'animal en toute responsabilité, pour toute sa vie. *
              </span>
            </label>

            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 rounded-lg text-red-700 text-sm">
                <AlertCircle size={18} className="flex-shrink-0" />
                {error}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={prev}
            disabled={step === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={20} />
            Précédent
          </button>
          {step < 3 ? (
            <button onClick={next} className="btn-primary">
              Suivant
              <ChevronRight size={20} />
            </button>
          ) : (
            <button
              onClick={sendEmail}
              disabled={sending || !data.charte_acceptee || !data.pourquoi_adopter}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? 'Envoi en cours...' : 'Envoyer ma candidature'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
