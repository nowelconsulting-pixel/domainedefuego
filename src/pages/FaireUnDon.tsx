import { ExternalLink, Heart, Home, Truck } from 'lucide-react';
import { useConfig } from '../hooks/useData';
import { usePageContent } from '../hooks/usePageContent';

const iconMap: Record<string, React.ElementType> = { Heart, Home, Truck };

export default function FaireUnDon() {
  const { data: config } = useConfig();
  const pc = usePageContent('faire-un-don');
  const utilisations = pc.utilisations as Array<{ titre: string; description: string; icone: string }> | undefined;

  return (
    <div className="min-h-screen bg-page">
      {/* Hero */}
      <div className="bg-nv-green text-white py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">
            {(pc.hero_title as string) || 'Faire un don'}
          </h1>
          <p className="text-white/75 text-xl leading-relaxed">
            {(pc.hero_subtitle as string) || "Votre générosité permet à des centaines d'animaux de trouver une famille chaque année."}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">

        {/* Texte + CTA */}
        <section className="bg-surface rounded-[20px] p-8 md:p-12 border-2 border-site-border text-center max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold text-forest mb-6">
            {(pc.intro_title as string) || 'Soutenez notre action'}
          </h2>
          {(() => {
            const text = (pc.intro_text as string) || '';
            if (text.startsWith('<')) {
              return <div className="prose prose-gray max-w-none text-lg [&_p]:text-muted [&_p]:leading-relaxed [&_p]:mb-4" dangerouslySetInnerHTML={{ __html: text }} />;
            }
            return text.split('\n\n').map((p, i) => (
              <p key={i} className="text-muted leading-relaxed mb-4 text-lg">{p}</p>
            ));
          })()}
          <div className="mt-8">
            <a
              href={(pc.helloasso_url as string) || config?.helloasso_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-lg px-10 py-4 inline-flex"
            >
              <Heart size={22} />
              {(pc.helloasso_btn_label as string) || 'Faire un don via HelloAsso'}
              <ExternalLink size={18} />
            </a>
            <p className="text-xs text-hint mt-3">
              {(pc.helloasso_note as string) || 'HelloAsso est une plateforme sécurisée. 100% de votre don va à l\'association (aucune commission).'}
            </p>
          </div>
        </section>

        {/* Utilisations */}
        {utilisations && utilisations.length > 0 && (
          <section>
            <h2 className="text-2xl font-extrabold text-forest text-center mb-10">À quoi sert votre don ?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {utilisations.map((u, i) => {
                const Icon = iconMap[u.icone] ?? Heart;
                return (
                  <div key={i} className="bg-surface rounded-[20px] p-8 border-2 border-site-border text-center">
                    <div className="w-16 h-16 bg-nv-green-light rounded-2xl flex items-center justify-center mx-auto mb-5">
                      <Icon size={28} className="text-nv-green" />
                    </div>
                    <h3 className="text-lg font-bold text-forest mb-3">{u.titre}</h3>
                    <p className="text-muted leading-relaxed text-sm">{u.description}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Note fiscale */}
        <section className="bg-surface rounded-[20px] p-8 border-2 border-site-border text-center max-w-2xl mx-auto">
          <h3 className="font-bold text-forest mb-3">Réduction fiscale</h3>
          <p className="text-muted text-sm leading-relaxed">
            En tant qu'association loi 1901 reconnue d'intérêt général, vos dons peuvent ouvrir droit à une réduction d'impôt de 66% dans la limite de 20% du revenu imposable. Un reçu fiscal vous sera envoyé par HelloAsso.
          </p>
        </section>
      </div>
    </div>
  );
}
