import { useState } from 'react';
import { Home, Heart, Clock, Shield, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import FormFamilleAccueil from '../components/FormFamilleAccueil';
import { usePageContent } from '../hooks/usePageContent';

// Icon list stays in code — icons are presentational and can't be serialised to JSON
const AVANTAGE_ICONS = [Home, Heart, Clock, Shield];

export default function FamilleAccueil() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const pc = usePageContent('famille-accueil');
  const pcAvantages = (pc.avantages as Array<{ titre: string; desc: string }>) || [];
  const avantages = AVANTAGE_ICONS.map((icon, i) => ({
    icon,
    titre: pcAvantages[i]?.titre ?? '',
    desc:  pcAvantages[i]?.desc  ?? '',
  }));
  const faqs = (pc.faq as Array<{ q: string; r: string }>) || [];

  return (
    <div className="min-h-screen bg-page">
      {/* Header */}
      <div className="bg-surface border-b-2 border-site-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-extrabold text-forest mb-3">
            {(pc.hero_title as string) || "Devenir famille d'accueil"}
          </h1>
          <p className="text-muted text-lg max-w-2xl">
            {(pc.hero_subtitle as string) || "En devenant famille d'accueil, vous offrez un foyer temporaire à un animal en attente d'adoption. Un geste simple, un impact immense."}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

        {/* Avantages */}
        <section>
          <h2 className="text-2xl font-extrabold text-forest mb-8">Pourquoi devenir famille d'accueil ?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {avantages.map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={i} className="bg-surface rounded-[20px] p-6 border-2 border-site-border text-center">
                  <div className="w-14 h-14 bg-nv-green-light rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon size={26} className="text-nv-green" />
                  </div>
                  <h3 className="font-bold text-forest mb-2">{a.titre}</h3>
                  <p className="text-sm text-muted leading-relaxed">{a.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-extrabold text-forest mb-8">Questions fréquentes</h2>
          <div className="space-y-3 max-w-3xl">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-surface rounded-[20px] border-2 border-site-border overflow-hidden">
                <button
                  className="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-page transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold text-forest">{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp size={20} className="text-nv-green flex-shrink-0 ml-4" />
                  ) : (
                    <ChevronDown size={20} className="text-hint flex-shrink-0 ml-4" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-muted leading-relaxed border-t border-site-border pt-4">
                    {faq.r}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Form */}
        <section>
          <h2 className="text-2xl font-extrabold text-forest mb-8">Candidature famille d'accueil</h2>
          <div className="max-w-3xl">
            <FormFamilleAccueil />
          </div>
        </section>

      </div>

      {/* Optional CTA button */}
      {(pc.cta_url as string) && (
        <div className="bg-nv-green py-14 text-center">
          {(pc.cta_url as string).startsWith('http') ? (
            <a href={pc.cta_url as string} target="_blank" rel="noopener noreferrer"
              className="bg-white text-nv-green hover:bg-nv-green-light font-semibold px-10 py-4 rounded-xl inline-flex items-center gap-2 transition-colors">
              {(pc.cta_label as string) || 'En savoir plus'} <ChevronRight size={20} />
            </a>
          ) : (
            <Link to={pc.cta_url as string}
              className="bg-white text-nv-green hover:bg-nv-green-light font-semibold px-10 py-4 rounded-xl inline-flex items-center gap-2 transition-colors">
              {(pc.cta_label as string) || 'En savoir plus'} <ChevronRight size={20} />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
