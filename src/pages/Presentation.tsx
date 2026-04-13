import { usePages } from '../hooks/useData';
import { Heart, Eye, Handshake } from 'lucide-react';
import { usePageContent } from '../hooks/usePageContent';

const valeurIcons = [Heart, Eye, Handshake];

export default function Presentation() {
  const { data: pages, loading } = usePages();
  const pres = pages?.presentation;
  const pc = usePageContent('presentation');

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4">
            {(pc.hero_title as string) || 'Notre association'}
          </h1>
          <p className="text-gray-400 text-xl">
            {(pc.hero_subtitle as string) || 'Découvrez qui nous sommes, notre mission et nos valeurs.'}
          </p>
        </div>
      </div>

      {/* Mission */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded" style={{ width: `${80 + Math.random() * 20}%` }} />
              ))}
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">{pres?.titre}</h2>
              {pres?.texte.split('\n\n').map((p, i) => (
                <p key={i} className="text-gray-700 leading-relaxed mb-6 text-lg">
                  {p}
                </p>
              ))}
            </>
          )}
        </div>
      </section>

      {/* Valeurs */}
      {pres?.valeurs && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-14">Nos valeurs</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pres.valeurs.map((v, i) => {
                const Icon = valeurIcons[i] ?? Heart;
                return (
                  <div key={i} className="bg-white rounded-2xl p-8 shadow-sm text-center">
                    <div className="w-16 h-16 bg-coral-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Icon size={28} className="text-coral-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{v.titre}</h3>
                    <p className="text-gray-600 leading-relaxed">{v.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Équipe */}
      {pres?.equipe && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-14">Notre équipe</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              {pres.equipe.map((membre, i) => (
                <div key={i} className="text-center">
                  <div className="w-32 h-32 bg-gray-100 rounded-full mx-auto mb-4 overflow-hidden">
                    {membre.photo ? (
                      <img src={membre.photo} alt={membre.nom} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
                        👤
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900">{membre.nom}</h3>
                  <p className="text-sm text-coral-500">{membre.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Partenaires */}
      {pres?.partenaires && pres.partenaires.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-14">Nos partenaires</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {pres.partenaires.map((p, i) => (
                <div
                  key={i}
                  className="bg-white px-6 py-4 rounded-xl shadow-sm border border-gray-100 text-gray-700 font-medium"
                >
                  {p}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
