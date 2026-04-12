import { ExternalLink, Heart, Home, Truck } from 'lucide-react';
import { usePages, useConfig } from '../hooks/useData';

const iconMap: Record<string, React.ElementType> = {
  Heart,
  Home,
  Truck,
};

export default function FaireUnDon() {
  const { data: pages, loading } = usePages();
  const { data: config } = useConfig();
  const don = pages?.faire_un_don;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-coral-500 text-white py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">Faire un don</h1>
          <p className="text-coral-100 text-xl leading-relaxed">
            Votre générosité permet à des centaines d'animaux de trouver une famille chaque année.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">

        {/* Texte + CTA */}
        <section className="bg-white rounded-2xl p-8 md:p-12 shadow-sm text-center max-w-3xl mx-auto">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[...Array(4)].map((_, i) => <div key={i} className="h-4 bg-gray-200 rounded mx-auto" style={{ width: `${60 + Math.random() * 30}%` }} />)}
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{don?.titre}</h2>
              {don?.texte.split('\n\n').map((p, i) => (
                <p key={i} className="text-gray-700 leading-relaxed mb-4 text-lg">{p}</p>
              ))}
            </>
          )}
          <div className="mt-8">
            <a
              href={config?.helloasso_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-lg px-10 py-4 inline-flex"
            >
              <Heart size={22} />
              Faire un don via HelloAsso
              <ExternalLink size={18} />
            </a>
            <p className="text-xs text-gray-400 mt-3">
              HelloAsso est une plateforme sécurisée. 100% de votre don va à l'association (aucune commission).
            </p>
          </div>
        </section>

        {/* Utilisations */}
        {don?.utilisations && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">À quoi sert votre don ?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {don.utilisations.map((u, i) => {
                const Icon = iconMap[u.icone] ?? Heart;
                return (
                  <div key={i} className="bg-white rounded-2xl p-8 shadow-sm text-center">
                    <div className="w-16 h-16 bg-coral-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                      <Icon size={28} className="text-coral-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{u.titre}</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">{u.description}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Note fiscale */}
        <section className="bg-gray-100 rounded-2xl p-8 text-center max-w-2xl mx-auto">
          <h3 className="font-semibold text-gray-900 mb-3">Réduction fiscale</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            En tant qu'association loi 1901 reconnue d'intérêt général, vos dons peuvent ouvrir droit à une réduction d'impôt de 66% dans la limite de 20% du revenu imposable. Un reçu fiscal vous sera envoyé par HelloAsso.
          </p>
        </section>
      </div>
    </div>
  );
}
