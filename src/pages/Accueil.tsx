import { Link } from 'react-router-dom';
import { Heart, Users, ChevronRight, Star, Calendar, ArrowRight } from 'lucide-react';
import AnimalCard from '../components/AnimalCard';
import { useAnimaux, useConfig } from '../hooks/useData';
import { usePageContent } from '../hooks/usePageContent';

// ─── Smart CTA link ───────────────────────────────────────────────────────────
function Cta({ label, url, className, children }: { label: string; url: string; className?: string; children?: React.ReactNode }) {
  const cls = `${className ?? ''} inline-flex items-center gap-2`.trim();
  if (!label) return null;
  if (!url) return <span className={`${cls} opacity-40 cursor-not-allowed`}>{label}{children}</span>;
  if (url.startsWith('http')) return <a href={url} className={cls} target="_blank" rel="noopener noreferrer">{label}{children}</a>;
  return <Link to={url} className={cls}>{label}{children}</Link>;
}

// ─── Latest blog article type (matches articles.json) ────────────────────────
interface Article {
  id: string; title: string; slug: string; excerpt: string;
  cover_url: string; author: string; published: boolean;
  published_at: string; featured: boolean;
}

function useLatestArticle(): Article | null {
  try {
    const stored = localStorage.getItem('articles');
    const list: Article[] = stored ? JSON.parse(stored) : [];
    const pub = list.filter(a => a.published);
    return pub.find(a => a.featured) ?? pub.sort((a, b) => b.published_at.localeCompare(a.published_at))[0] ?? null;
  } catch { return null; }
}

export default function Accueil() {
  const { data: animaux } = useAnimaux();
  const { data: config }  = useConfig();
  const pc = usePageContent('accueil');
  const latestArticle = useLatestArticle();

  const derniers = animaux?.filter(a => a.statut === 'Disponible').slice(0, 3) ?? [];
  const etapes   = (pc.etapes as Array<{ num: string; titre: string; desc: string }>) || [];
  const temoignages = (pc.temoignages as Array<{ texte: string; auteur: string; lieu: string }>) || [];

  const heroCta1Label = (pc.hero_cta1_label as string) || 'Voir les animaux';
  const heroCta1Url   = (pc.hero_cta1_url   as string) ?? '/animaux';
  const heroCta2Label = (pc.hero_cta2_label as string) || 'Faire un don';
  const heroCta2Url   = (pc.hero_cta2_url   as string) ?? '/faire-un-don';
  const howCtaLabel   = (pc.how_cta_label as string) || 'Déposer une candidature';
  const howCtaUrl     = (pc.how_cta_url   as string) ?? '/adopter';
  const ctaBtn1Label  = (pc.cta_btn1_label as string) || 'Adopter un animal';
  const ctaBtn1Url    = (pc.cta_btn1_url   as string) ?? '/animaux';
  const ctaBtn2Label  = (pc.cta_btn2_label as string) || "Devenir famille d'accueil";
  const ctaBtn2Url    = (pc.cta_btn2_url   as string) ?? '/famille-accueil';

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${(pc.hero_bg_url as string) || 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1920&q=80'})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/50 to-gray-900/80" />

        {/* Content — centred */}
        <div className="relative z-10 text-center px-4 sm:px-8 max-w-3xl mx-auto py-32">
          <span className="inline-block bg-coral-500/20 text-coral-300 border border-coral-500/40 px-4 py-1.5 rounded-full text-sm font-medium mb-8 backdrop-blur-sm">
            {(pc.hero_badge as string) || 'Association loi 1901 · Ardèche & Vaucluse'}
          </span>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-tight mb-6 drop-shadow-lg">
            {(pc.hero_title as string) || 'Chaque animal mérite un foyer'}
          </h1>
          <p className="text-xl text-gray-200 mb-12 leading-relaxed max-w-2xl mx-auto">
            {(pc.hero_subtitle as string) || "Domaine de Fuego accompagne chiens, chats et autres animaux vers l'adoption responsable depuis 2016."}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Cta label={heroCta1Label} url={heroCta1Url} className="btn-primary text-base px-8 py-4 shadow-lg shadow-coral-500/30">
              <ChevronRight size={20} />
            </Cta>
            <Cta label={heroCta2Label} url={heroCta2Url} className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white text-base px-8 py-4 rounded-xl font-semibold transition-colors">
              <Heart size={20} />
            </Cta>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50">
          <div className="w-px h-12 bg-gradient-to-b from-white/0 to-white/40" />
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────────────── */}
      {config && (() => {
        const items: { value: number; label: string }[] = [
          ...(config.chiffres.animaux_adoptes  ? [{ value: config.chiffres.animaux_adoptes,  label: 'animaux adoptés' }]          : []),
          ...(config.chiffres.familles_accueil ? [{ value: config.chiffres.familles_accueil, label: "familles d'accueil" }]        : []),
          ...(config.chiffres.annees_existence  ? [{ value: config.chiffres.annees_existence,  label: "ans d'existence" }]           : []),
          ...(config.chiffres.custom ?? []).filter(c => c.value && c.label),
        ];
        if (items.length === 0) return null;
        return (
          <section className="bg-coral-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="flex flex-wrap justify-center gap-x-16 gap-y-6 text-center text-white">
                {items.map((item, i) => (
                  <div key={i} className="min-w-[120px]">
                    <div className="text-4xl font-bold">{item.value}</div>
                    <div className="text-sm mt-1 opacity-80 uppercase tracking-wider">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      {/* ── NOS ANIMAUX À L'ADOPTION ──────────────────────────────────────── */}
      {(pc.show_derniers !== false) && derniers.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-14">
              <div>
                <h2 className="section-title">{(pc.derniers_title as string) || 'Nos animaux à l\'adoption'}</h2>
                <p className="section-subtitle mt-2">{(pc.derniers_subtitle as string) || 'Ces animaux attendent leur famille idéale'}</p>
              </div>
              <Link to="/animaux" className="flex items-center gap-2 text-coral-500 font-semibold hover:text-coral-600 whitespace-nowrap text-sm">
                Voir tous les animaux <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {derniers.map(animal => (
                <AnimalCard key={animal.id} animal={animal} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── COMMENT ADOPTER ───────────────────────────────────────────────── */}
      <section className="py-24" style={{ backgroundColor: '#FFF8F6' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">{(pc.how_title as string) || 'Comment adopter ?'}</h2>
            <p className="section-subtitle mt-2">{(pc.how_subtitle as string) || 'Un processus simple et bienveillant en 3 étapes'}</p>
          </div>
          <div className="space-y-12 max-w-4xl mx-auto">
            {etapes.map((e, i) => (
              <div key={e.num} className={`flex flex-col sm:flex-row gap-8 items-center ${i % 2 === 1 ? 'sm:flex-row-reverse' : ''}`}>
                <div className="w-20 h-20 bg-coral-500 text-white rounded-2xl flex items-center justify-center text-3xl font-bold flex-shrink-0 shadow-lg shadow-coral-500/30">
                  {e.num}
                </div>
                <div className={`flex-1 ${i % 2 === 1 ? 'sm:text-right' : ''}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{e.titre}</h3>
                  <p className="text-gray-600 leading-relaxed">{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-14">
            <Cta label={howCtaLabel} url={howCtaUrl} className="btn-primary px-8 py-4">
              <ChevronRight size={20} />
            </Cta>
          </div>
        </div>
      </section>

      {/* ── DERNIÈRE ACTUALITÉ ────────────────────────────────────────────── */}
      {(pc.show_latest_blog !== false) && latestArticle && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="section-title mb-12">{(pc.latest_blog_title as string) || 'Dernière actualité'}</h2>
            <div className="bg-gray-50 rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-sm max-w-4xl">
              {latestArticle.cover_url && (
                <div className="md:w-80 flex-shrink-0">
                  <img
                    src={latestArticle.cover_url}
                    alt={latestArticle.title}
                    className="w-full h-56 md:h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="p-8 flex flex-col justify-center gap-4">
                <div className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wider">
                  <Calendar size={14} />
                  {latestArticle.published_at ? new Date(latestArticle.published_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                  {latestArticle.author && <span className="ml-2">· {latestArticle.author}</span>}
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{latestArticle.title}</h3>
                {latestArticle.excerpt && <p className="text-gray-600 leading-relaxed">{latestArticle.excerpt}</p>}
                <Link to={`/blog/${latestArticle.slug}`} className="btn-primary self-start mt-2">
                  Lire l'article <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── TÉMOIGNAGES ───────────────────────────────────────────────────── */}
      {(pc.show_temoignages !== false) && temoignages.length > 0 && (
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="section-title">{(pc.temoignages_title as string) || 'Ils ont adopté'}</h2>
              <p className="section-subtitle mt-2">{(pc.temoignages_subtitle as string) || 'Les témoignages de nos familles adoptantes'}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {temoignages.map((t, i) => (
                <div key={i} className="bg-white rounded-2xl p-8 shadow-sm">
                  <div className="flex gap-1 mb-5">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={16} className="fill-coral-400 text-coral-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-6 italic">"{t.texte}"</p>
                  <div className="border-t border-gray-100 pt-4">
                    <div className="font-semibold text-gray-900">{t.auteur}</div>
                    <div className="text-sm text-gray-400">{t.lieu}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER CTA BAND ───────────────────────────────────────────────── */}
      <section className="bg-coral-500 py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {(pc.cta_title as string) || 'Vous ne pouvez pas adopter ?'}
          </h2>
          <p className="text-coral-100 text-lg mb-10 leading-relaxed">
            {(pc.cta_subtitle as string) || "Devenez famille d'accueil — offrez un foyer temporaire à un animal en attente. Tous les frais sont pris en charge par l'association."}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Cta label={ctaBtn1Label} url={ctaBtn1Url} className="bg-white text-coral-600 hover:bg-coral-50 font-semibold px-8 py-4 rounded-xl transition-colors">
              <Heart size={20} />
            </Cta>
            <Cta label={ctaBtn2Label} url={ctaBtn2Url} className="bg-coral-600 hover:bg-coral-700 text-white font-semibold px-8 py-4 rounded-xl border border-coral-400 transition-colors">
              <Users size={20} />
            </Cta>
          </div>
        </div>
      </section>
    </>
  );
}
