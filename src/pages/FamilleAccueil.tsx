import { useState } from 'react';
import { Home, Heart, Clock, Shield, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import FormFamilleAccueil from '../components/FormFamilleAccueil';
import { usePageContent } from '../hooks/usePageContent';
import SystemPageBlocks from '../components/SystemPageBlocks';

const AVANTAGE_ICONS = [Home, Heart, Clock, Shield];

export default function FamilleAccueil() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const pc = usePageContent('famille-accueil');
  const pcAvantages = (pc.avantages as Array<{ titre: string; desc: string }>) || [];
  const avantages = AVANTAGE_ICONS
    .map((icon, i) => ({
      icon,
      titre: pcAvantages[i]?.titre ?? '',
      desc:  pcAvantages[i]?.desc  ?? '',
    }))
    .filter(a => a.titre || a.desc);
  const faqs = (pc.faq as Array<{ q: string; r: string }>) || [];

  return (
    <div className="min-h-screen bg-page">

      {/* Hero */}
      <div className="bg-forest text-white py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-5 leading-tight">
            {(pc.hero_title as string) || "Devenir famille d'accueil"}
          </h1>
          <p className="text-white/70 text-xl leading-relaxed">
            {(pc.hero_subtitle as string) || "En devenant famille d'accueil, vous offrez un foyer temporaire à un animal en attente d'adoption. Un geste simple, un impact immense."}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">

        {/* Avantages */}
        {avantages.length > 0 && (
          <section>
            <h2 className="text-2xl font-extrabold text-forest text-center mb-12">
              {(pc.avantages_title as string) || "Pourquoi devenir famille d'accueil ?"}
            </h2>
            <div className="flex flex-wrap justify-center gap-6">
              {avantages.map((a, i) => {
                const Icon = a.icon;
                return (
                  <div key={i} className="bg-surface rounded-[20px] p-6 border-2 border-site-border text-center w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] min-w-[200px] max-w-[280px]">
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
        )}

        {/* FAQ */}
        {faqs.length > 0 && (
          <section>
            <h2 className="text-2xl font-extrabold text-forest text-center mb-10">
              {(pc.faq_title as string) || 'Questions fréquentes'}
            </h2>
            <div className="space-y-3 max-w-3xl mx-auto">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-surface rounded-[20px] border-2 border-site-border overflow-hidden">
                  <button
                    className="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-page transition-colors"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="font-semibold text-forest">{faq.q}</span>
                    {openFaq === i
                      ? <ChevronUp size={20} className="text-nv-green flex-shrink-0 ml-4" />
                      : <ChevronDown size={20} className="text-hint flex-shrink-0 ml-4" />}
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
        )}

        {/* Form */}
        <section>
          <h2 className="text-2xl font-extrabold text-forest text-center mb-10">
            {(pc.form_title as string) || "Candidature famille d'accueil"}
          </h2>
          <div className="max-w-3xl mx-auto">
            <FormFamilleAccueil />
          </div>
        </section>

      </div>

      <SystemPageBlocks pageId="sys-fa" />

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
