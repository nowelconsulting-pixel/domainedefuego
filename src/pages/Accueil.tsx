import { Link } from 'react-router-dom';
import { Heart, Users, Calendar, ChevronRight, Star } from 'lucide-react';
import AnimalCard from '../components/AnimalCard';
import { useAnimaux, useConfig } from '../hooks/useData';
import { usePageContent } from '../hooks/usePageContent';

// Smart CTA: renders a link or a visually-disabled span when url is empty
function Cta({ label, url, className, children }: { label: string; url: string; className?: string; children?: React.ReactNode }) {
  const cls = `${className ?? ''} inline-flex items-center gap-2`.trim();
  if (!label) return null;
  if (!url) return <span className={`${cls} opacity-40 cursor-not-allowed`}>{label}{children}</span>;
  if (url.startsWith('http')) return <a href={url} className={cls} target="_blank" rel="noopener noreferrer">{label}{children}</a>;
  return <Link to={url} className={cls}>{label}{children}</Link>;
}

export default function Accueil() {
  const { data: animaux } = useAnimaux();
  const { data: config } = useConfig();
  const pc = usePageContent('accueil');
  const derniers = animaux?.filter(a => a.statut === 'Disponible').slice(0, 3) ?? [];
  const etapes = (pc.etapes as Array<{ num: string; titre: string; desc: string }>) || [];
  const temoignages = (pc.temoignages as Array<{ texte: string; auteur: string; lieu: string }>) || [];

  const heroCta1Label = (pc.hero_cta1_label as string) || 'Voir les animaux';
  const heroCta1Url   = (pc.hero_cta1_url   as string) ?? '/animaux';
  const heroCta2Label = (pc.hero_cta2_label as string) || 'Faire un don';
  const heroCta2Url   = (pc.hero_cta2_url   as string) ?? '/faire-un-don';

  const howCtaLabel = (pc.how_cta_label as string) || 'Déposer une candidature';
  const howCtaUrl   = (pc.how_cta_url   as string) ?? '/adopter';

  const ctaBtn1Label = (pc.cta_btn1_label as string) || 'Adopter un animal';
  const ctaBtn1Url   = (pc.cta_btn1_url   as string) ?? '/animaux';
  const ctaBtn2Label = (pc.cta_btn2_label as string) || "Devenir famille d'accueil";
  const ctaBtn2Url   = (pc.cta_btn2_url   as string) ?? '/famille-accueil';
  const ctaBtn3Label = (pc.cta_btn3_label as string) || 'Faire un don';
  const ctaBtn3Url   = (pc.cta_btn3_url   as string) ?? '/faire-un-don';

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gray-900">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage: `url(${(pc.hero_bg_url as string) || 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1920&q=80'})`,
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <span className="inline-block bg-coral-500/20 text-coral-400 border border-coral-500/30 px-4 py-1 rounded-full text-sm font-medium mb-6">
              {(pc.hero_badge as string) || 'Association loi 1901 · Ardèche & Vaucluse'}
            </span>
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              {(pc.hero_title as string) || 'Chaque animal mérite un foyer'}
            </h1>
            <p className="text-xl text-gray-300 mb-10 leading-relaxed">
              {(pc.hero_subtitle as string) || "Domaine de Fuego accompagne chiens, chats et autres animaux vers l'adoption responsable depuis 2016."}
            </p>
            <div className="flex flex-wrap gap-4">
              <Cta label={heroCta1Label} url={heroCta1Url} className="btn-primary text-base px-8 py-4">
                <ChevronRight size={20} />
              </Cta>
              <Cta label={heroCta2Label} url={heroCta2Url} className="btn-secondary text-base px-8 py-4">
                <Heart size={20} />
              </Cta>
            </div>
          </div>
        </div>
      </section>

      {/* CHIFFRES CLÉS */}
      {config && (() => {
        const items: { value: number; label: string }[] = [
          ...(config.chiffres.animaux_adoptes ? [{ value: config.chiffres.animaux_adoptes, label: 'animaux adoptés' }] : []),
          ...(config.chiffres.familles_accueil ? [{ value: config.chiffres.familles_accueil, label: "familles d'accueil actives" }] : []),
          ...(config.chiffres.annees_existence ? [{ value: config.chiffres.annees_existence, label: "ans d'existence" }] : []),
          ...(config.chiffres.custom ?? []).filter(c => c.value && c.label),
        ];
        if (items.length === 0) return null;
        return (
          <section className="bg-coral-500 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap justify-center gap-x-16 gap-y-8 text-center text-white">
                {items.map((item, i) => (
                  <div key={i} className="min-w-[140px]">
                    <div className="text-5xl font-bold mb-2">{item.value}</div>
                    <div className="text-lg opacity-90">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      {/* COMMENT ÇA MARCHE */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title">{(pc.how_title as string) || 'Comment ça marche ?'}</h2>
            <p className="section-subtitle">{(pc.how_subtitle as string) || 'Un processus simple et bienveillant en 3 étapes'}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {etapes.map(e => (
              <div key={e.num} className="text-center p-8 rounded-2xl bg-gray-50 hover:bg-coral-50 transition-colors">
                <div className="w-16 h-16 bg-coral-500 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {e.num}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{e.titre}</h3>
                <p className="text-gray-600 leading-relaxed">{e.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Cta label={howCtaLabel} url={howCtaUrl} className="btn-primary">
              <ChevronRight size={20} />
            </Cta>
          </div>
        </div>
      </section>

      {/* DERNIERS ARRIVANTS */}
      {(pc.show_derniers !== false) && derniers.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="section-title">{(pc.derniers_title as string) || 'Derniers arrivants'}</h2>
              <p className="section-subtitle">{(pc.derniers_subtitle as string) || 'Ces animaux attendent leur famille idéale'}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {derniers.map(animal => (
                <AnimalCard key={animal.id} animal={animal} />
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/animaux" className="btn-primary">
                Voir tous nos animaux
                <ChevronRight size={20} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* TÉMOIGNAGES */}
      {(pc.show_temoignages !== false) && temoignages.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="section-title">{(pc.temoignages_title as string) || 'Ils ont adopté'}</h2>
              <p className="section-subtitle">{(pc.temoignages_subtitle as string) || 'Les témoignages de nos familles adoptantes'}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {temoignages.map((t, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-8">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={16} className="fill-coral-400 text-coral-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-6 italic">"{t.texte}"</p>
                  <div>
                    <div className="font-semibold text-gray-900">{t.auteur}</div>
                    <div className="text-sm text-gray-500">{t.lieu}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA FINAL */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {(pc.cta_title as string) || 'Prêt à changer une vie ?'}
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            {(pc.cta_subtitle as string) || "Devenez adoptant ou famille d'accueil — chaque geste compte pour nos animaux."}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Cta label={ctaBtn1Label} url={ctaBtn1Url} className="btn-primary">
              <Heart size={20} />
            </Cta>
            <Cta label={ctaBtn2Label} url={ctaBtn2Url} className="btn-secondary border-gray-600 text-gray-300 hover:bg-gray-800">
              <Users size={20} />
            </Cta>
            <Cta label={ctaBtn3Label} url={ctaBtn3Url} className="btn-secondary border-gray-600 text-gray-300 hover:bg-gray-800">
              <Calendar size={20} />
            </Cta>
          </div>
        </div>
      </section>
    </>
  );
}
