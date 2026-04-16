import { useSearchParams, Link } from 'react-router-dom';
import { ClipboardList, Phone, Heart, CheckCircle2, ChevronRight } from 'lucide-react';
import FormAdoption from '../components/FormAdoption';
import { usePageContent } from '../hooks/usePageContent';

// Icons are presentational — kept in code, content comes from hook
const ETAPE_ICONS = [ClipboardList, Phone, Heart];

export default function Adopter() {
  const [params] = useSearchParams();
  const defaultAnimal = params.get('animal') ?? '';
  const pc = usePageContent('adopter');
  const pcSteps = (pc.process_steps as Array<{ titre: string; desc: string }>) || [];
  const etapes = ETAPE_ICONS.map((icon, i) => ({
    icon,
    titre: pcSteps[i]?.titre ?? '',
    desc:  pcSteps[i]?.desc  ?? '',
  }));
  const conditions = (pc.conditions as Array<{ text: string }>) || [];

  return (
    <div className="min-h-screen bg-page">
      {/* Header */}
      <div className="bg-surface border-b-2 border-site-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-extrabold text-forest mb-3">
            {(pc.hero_title as string) || 'Adopter un animal'}
          </h1>
          <p className="text-muted text-lg max-w-2xl">
            {(pc.hero_subtitle as string) || "L'adoption est un engagement pour toute la vie de l'animal. Nous vous accompagnons à chaque étape."}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Process */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {etapes.map((e, i) => {
            const Icon = e.icon;
            return (
              <div key={i} className="bg-surface rounded-[20px] p-6 border-2 border-site-border flex gap-4">
                <div className="w-12 h-12 bg-nv-green-light rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={22} className="text-nv-green" />
                </div>
                <div>
                  <h3 className="font-bold text-forest mb-2">{e.titre}</h3>
                  <p className="text-sm text-muted leading-relaxed">{e.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Conditions */}
        {conditions.length > 0 && (
          <div className="bg-nv-green-light border border-nv-green/20 rounded-[20px] p-6 mb-12">
            <h3 className="font-bold text-nv-green mb-3">Conditions d'adoption</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {conditions.map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-forest">
                  <CheckCircle2 size={16} className="text-nv-green flex-shrink-0" />
                  {c.text}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold text-forest mb-8">Formulaire de candidature</h2>
          <FormAdoption defaultAnimal={defaultAnimal} />
        </div>
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
