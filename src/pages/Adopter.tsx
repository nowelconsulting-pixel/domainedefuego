import { useSearchParams } from 'react-router-dom';
import { ClipboardList, Phone, Heart, CheckCircle2 } from 'lucide-react';
import FormAdoption from '../components/FormAdoption';

const etapes = [
  {
    icon: ClipboardList,
    titre: '1. Candidature en ligne',
    desc: 'Remplissez notre formulaire. Nous avons besoin de bien vous connaître pour trouver l\'animal qui vous correspond.',
  },
  {
    icon: Phone,
    titre: '2. Entretien téléphonique',
    desc: 'Un bénévole vous rappelle pour échanger sur votre projet, vos attentes et vous présenter l\'animal.',
  },
  {
    icon: Heart,
    titre: '3. Rencontre & adoption',
    desc: 'Rencontre avec l\'animal, signature du contrat, paiement de la participation aux frais. Bienvenue dans la famille !',
  },
];

export default function Adopter() {
  const [params] = useSearchParams();
  const defaultAnimal = params.get('animal') ?? '';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Adopter un animal</h1>
          <p className="text-gray-600 text-lg max-w-2xl">
            L'adoption est un engagement pour toute la vie de l'animal. Nous vous accompagnons à chaque étape.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Process */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {etapes.map((e, i) => {
            const Icon = e.icon;
            return (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm flex gap-4">
                <div className="w-12 h-12 bg-coral-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={22} className="text-coral-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{e.titre}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{e.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Conditions */}
        <div className="bg-coral-50 border border-coral-200 rounded-2xl p-6 mb-12">
          <h3 className="font-semibold text-coral-700 mb-3">Conditions d'adoption</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              'Être majeur',
              'Avoir un logement adapté',
              'Avoir l\'accord du propriétaire si locataire',
              'S\'engager pour toute la vie de l\'animal',
              'Accepter une visite de contrôle à domicile',
              'Payer la participation aux frais vétérinaires',
            ].map((c, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-coral-800">
                <CheckCircle2 size={16} className="text-coral-500 flex-shrink-0" />
                {c}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Formulaire de candidature</h2>
          <FormAdoption defaultAnimal={defaultAnimal} />
        </div>
      </div>
    </div>
  );
}
