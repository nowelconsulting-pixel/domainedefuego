import { Heart, Eye, Handshake, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageContent } from '../hooks/usePageContent';
import { resolveImageUrl } from '../utils/image';

const valeurIcons = [Heart, Eye, Handshake];

export default function Presentation() {
  const pc = usePageContent('presentation');
  const valeurs = pc.valeurs as Array<{ titre: string; description: string }> | undefined;
  const equipe  = pc.equipe  as Array<{ nom: string; role: string; photo: string }> | undefined;
  const partenaires = pc.partenaires as string[] | undefined;

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
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            {(pc.mission_title as string) || 'Notre mission'}
          </h2>
          {((pc.mission_text as string) || '').split('\n\n').map((p, i) => (
            <p key={i} className="text-gray-700 leading-relaxed mb-6 text-lg">{p}</p>
          ))}
        </div>
      </section>

      {/* Valeurs */}
      {valeurs && valeurs.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-14">Nos valeurs</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {valeurs.map((v, i) => {
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
      {equipe && equipe.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-14">Notre équipe</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              {equipe.map((membre, i) => (
                <div key={i} className="text-center">
                  <div className="w-32 h-32 bg-gray-100 rounded-full mx-auto mb-4 overflow-hidden">
                    {membre.photo ? (
                      <img src={resolveImageUrl(membre.photo)} alt={membre.nom} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">👤</div>
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
      {partenaires && partenaires.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-14">Nos partenaires</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {partenaires.map((p, i) => (
                <div key={i} className="bg-white px-6 py-4 rounded-xl shadow-sm border border-gray-100 text-gray-700 font-medium">
                  {p}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Optional CTA button */}
      {(pc.cta_url as string) && (
        <section className="py-16 bg-coral-500">
          <div className="text-center">
            {(pc.cta_url as string).startsWith('http') ? (
              <a href={pc.cta_url as string} target="_blank" rel="noopener noreferrer"
                className="bg-white text-coral-600 hover:bg-coral-50 font-semibold px-10 py-4 rounded-xl inline-flex items-center gap-2 transition-colors">
                {(pc.cta_label as string) || 'En savoir plus'} <ChevronRight size={20} />
              </a>
            ) : (
              <Link to={pc.cta_url as string}
                className="bg-white text-coral-600 hover:bg-coral-50 font-semibold px-10 py-4 rounded-xl inline-flex items-center gap-2 transition-colors">
                {(pc.cta_label as string) || 'En savoir plus'} <ChevronRight size={20} />
              </Link>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
