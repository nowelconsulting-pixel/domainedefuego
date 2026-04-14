import { useState } from 'react';
import { Home, Heart, Clock, Shield, ChevronDown, ChevronUp } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            {(pc.hero_title as string) || "Devenir famille d'accueil"}
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl">
            {(pc.hero_subtitle as string) || "En devenant famille d'accueil, vous offrez un foyer temporaire à un animal en attente d'adoption. Un geste simple, un impact immense."}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

        {/* Avantages */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Pourquoi devenir famille d'accueil ?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {avantages.map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm text-center">
                  <div className="w-14 h-14 bg-coral-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon size={26} className="text-coral-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{a.titre}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{a.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Questions fréquentes</h2>
          <div className="space-y-3 max-w-3xl">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <button
                  className="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-medium text-gray-900">{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp size={20} className="text-coral-500 flex-shrink-0 ml-4" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400 flex-shrink-0 ml-4" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                    {faq.r}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Form */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Candidature famille d'accueil</h2>
          <div className="max-w-3xl">
            <FormFamilleAccueil />
          </div>
        </section>

      </div>
    </div>
  );
}
