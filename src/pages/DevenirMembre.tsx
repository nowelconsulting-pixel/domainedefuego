import { Shield, Heart, Star, Users, Trophy, Zap, CheckCircle2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import FormAdhesion from '../components/FormAdhesion';
import { usePageContent } from '../hooks/usePageContent';
import SystemPageBlocks from '../components/SystemPageBlocks';

const ICON_MAP: Record<string, React.ElementType> = { Shield, Heart, Star, Users, Trophy, Zap };

const DEFAULT_ARGUMENTAIRE = [
  { titre: 'Indépendance des sauvetages', description: "Votre adhésion nous permet d'agir librement et rapidement pour secourir les animaux en détresse, sans compromis.", icone: 'Shield' },
  { titre: 'Excellence des soins', description: "Grâce à vos cotisations, chaque animal bénéficie de soins vétérinaires adaptés et d'un suivi personnalisé.", icone: 'Heart' },
  { titre: 'Changer les mentalités', description: "Ensemble, nous sensibilisons le public à la cause animale et construisons un avenir plus respectueux de la vie.", icone: 'Star' },
];

const DEFAULT_AVANTAGES = [
  { text: 'Droit de vote en Assemblée Générale' },
  { text: 'Newsletter exclusive réservée aux membres' },
  { text: 'Déduction fiscale de 66 % sur votre cotisation' },
  { text: 'Accès aux événements et rencontres associatives' },
  { text: 'Participation active aux décisions de l\'association' },
];

export default function DevenirMembre() {
  const pc = usePageContent('devenir-membre');

  const heroTitle    = (pc.hero_title as string)    || 'Porter la voix des oubliés';
  const heroSubtitle = (pc.hero_subtitle as string)  || "En adhérant à Domaine de Fuego, vous rejoignez une communauté engagée pour offrir une seconde chance aux animaux abandonnés.";

  const argTitle = (pc.argumentaire_title as string) || 'Pourquoi adhérer ?';
  const argItems = (pc.argumentaire as typeof DEFAULT_ARGUMENTAIRE) || DEFAULT_ARGUMENTAIRE;

  const avaTitle    = (pc.avantages_title as string)    || 'Les avantages membres';
  const avaSubtitle = (pc.avantages_subtitle as string) || "En rejoignant l'association, vous bénéficiez de droits et d'avantages concrets.";
  const avaItems    = (pc.avantages as typeof DEFAULT_AVANTAGES) || DEFAULT_AVANTAGES;

  const formTitle    = (pc.form_title as string)    || "Rejoignez-nous";
  const formSubtitle = (pc.form_subtitle as string) || "Remplissez ce formulaire pour devenir membre de l'association. Nous vous répondrons sous 48 h pour finaliser votre adhésion.";
  const showPrice    = pc.show_price !== false;
  const price        = (pc.adhesion_price as string) || '15 € / an';

  return (
    <div className="min-h-screen bg-page">

      {/* Hero */}
      <div className="bg-forest text-white py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-5 leading-tight">
            {heroTitle}
          </h1>
          <p className="text-white/70 text-xl leading-relaxed">
            {heroSubtitle}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">

        {/* Argumentaire */}
        <section>
          <h2 className="text-2xl font-extrabold text-forest text-center mb-12">{argTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {argItems.map((item, i) => {
              const Icon = ICON_MAP[item.icone] ?? Shield;
              return (
                <div key={i} className="bg-surface rounded-[20px] p-8 border-2 border-site-border text-center">
                  <div className="w-16 h-16 bg-nv-green-light rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <Icon size={28} className="text-nv-green" />
                  </div>
                  <h3 className="text-lg font-bold text-forest mb-3">{item.titre}</h3>
                  <p className="text-muted leading-relaxed text-sm">{item.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Avantages */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-extrabold text-forest mb-4">{avaTitle}</h2>
            <p className="text-muted leading-relaxed mb-8">{avaSubtitle}</p>
            {showPrice && (
              <div className="inline-flex items-center gap-3 bg-nv-green/10 border-2 border-nv-green/20 rounded-2xl px-6 py-4">
                <span className="text-3xl font-extrabold text-nv-green">{price}</span>
                <span className="text-sm text-muted">cotisation annuelle</span>
              </div>
            )}
          </div>
          <ul className="space-y-3">
            {avaItems.map((a, i) => (
              <li key={i} className="flex items-start gap-3 bg-surface rounded-xl p-4 border-2 border-site-border">
                <CheckCircle2 size={20} className="text-nv-green flex-shrink-0 mt-0.5" />
                <span className="text-forest font-medium">{a.text}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Form section */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="lg:sticky lg:top-8">
              <h2 className="text-2xl font-extrabold text-forest mb-4">{formTitle}</h2>
              <p className="text-muted leading-relaxed mb-6">{formSubtitle}</p>
              <div className="bg-nv-green/5 border-2 border-nv-green/15 rounded-[20px] p-6 space-y-3">
                <p className="text-sm font-semibold text-forest">Après votre demande :</p>
                {[
                  'Nous examinons votre dossier sous 48 h',
                  'Vous recevez un email de confirmation',
                  'Votre cotisation est réglée en ligne ou par virement',
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-muted">
                    <div className="w-6 h-6 rounded-full bg-nv-green text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
                    {s}
                  </div>
                ))}
              </div>
            </div>
            <FormAdhesion />
          </div>
        </section>

      </div>

      <SystemPageBlocks pageId="sys-devenir-membre" />

      {/* Optional CTA */}
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
