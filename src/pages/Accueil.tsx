import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, Newspaper, Check, Quote } from 'lucide-react';
import AnimalCard from '../components/AnimalCard';
import { useAnimaux, useConfig } from '../hooks/useData';
import { usePageContent } from '../hooks/usePageContent';
import pageDefaults from '../data/pageDefaults';
import { resolveImageUrl } from '../utils/image';
import SystemPageBlocks from '../components/SystemPageBlocks';

interface FeaturedArticleData { auto?: string; article_id?: string; section_title?: string; cta_text?: string; fallback_url?: string; }
interface SimpleBlock { type: string; data: Record<string, string>; }

function loadFeaturedArticleBlock(): SimpleBlock | null {
  let blocks: SimpleBlock[] = [];
  try {
    const sysData = localStorage.getItem('system_page_data');
    if (sysData) blocks = JSON.parse(sysData)?.['sys-accueil']?.blocks ?? [];
  } catch { /**/ }
  if (!blocks.length) blocks = ((pageDefaults.accueil as { blocks?: SimpleBlock[] }).blocks ?? []);
  return blocks.find(b => b.type === 'featured-article') ?? null;
}

export default function Accueil() {
  const { data: animaux } = useAnimaux();
  const { data: config }  = useConfig();
  const pc = usePageContent('accueil');

  const derniers = animaux?.filter(a => a.statut === 'Disponible').slice(0, 3) ?? [];
  const heroBg = resolveImageUrl((pc.hero_bg_url as string) || '') || '/adoption.png';

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-screen flex items-end overflow-hidden">
        {/* Photo de fond */}
        <div className="absolute inset-0" style={{ backgroundImage: `url(${heroBg})`, backgroundSize: 'cover', backgroundPosition: 'center 25%' }} />
        {/* Gradient principal — lisibilité du texte */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,12,10,0.98) 0%, rgba(8,12,10,0.80) 32%, rgba(8,12,10,0.30) 62%, transparent 100%)' }} />
        {/* Vignette périmétrique — effet cinématique */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 140% 90% at 50% 110%, transparent 35%, rgba(0,0,0,0.20) 100%)' }} />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-28 md:pb-36">
          <div className="max-w-3xl mx-auto text-center">

            <h1
              className="font-black text-white whitespace-pre-line mb-7"
              style={{
                fontSize: 'clamp(3rem, 7vw, 6rem)',
                lineHeight: 0.96,
                letterSpacing: '-0.025em',
                textShadow: '0 2px 32px rgba(0,0,0,0.50)',
              }}
            >
              {(pc.hero_title as string) || "ILS N'ATTENDENT\nQUE VOUS"}
            </h1>

            <p
              className="leading-relaxed mb-10 max-w-xl mx-auto"
              style={{
                fontSize: '1.2rem',
                color: 'rgba(255,255,255,0.82)',
                textShadow: '0 1px 12px rgba(0,0,0,0.70)',
                letterSpacing: '0.008em',
              }}
            >
              {(pc.hero_subtitle as string) || "Chaque animal abrite une histoire. Certains attendent depuis trop longtemps. Il est temps d'écrire la suite."}
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/animaux" className="btn-primary">Voir nos animaux <ArrowRight size={18} /></Link>
              <Link
                to="/famille-accueil"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm text-white border-2 hover:bg-white/10 hover:border-white/60 transition-all duration-200"
                style={{ borderColor: 'rgba(255,255,255,0.42)' }}
              >
                Devenir famille d'accueil
              </Link>
            </div>
          </div>
        </div>

        {/* Indicateur de scroll — centré */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/40">
          <ChevronDown size={22} className="animate-bounce" />
        </div>
      </section>

      {/* DERNIERS ARRIVANTS */}
      {derniers.length > 0 && (
        <section className="bg-[#FAFAF7] py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-14">
              <p className="text-nv-teal text-[11px] font-extrabold uppercase tracking-widest mb-3">Ils attendent</p>
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <h2 className="text-4xl md:text-5xl font-black text-forest leading-tight">
                  {(pc.section_title as string) || 'Nos derniers arrivants'}
                </h2>
                <Link to="/animaux" className="flex items-center gap-2 text-nv-green font-bold hover:text-forest transition-colors group whitespace-nowrap">
                  Voir tous les animaux <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {derniers.map(animal => <AnimalCard key={animal.id} animal={animal} />)}
            </div>
          </div>
        </section>
      )}

      {/* STATISTIQUES */}
      {(pc.show_stats !== false) && config && (() => {
        const items = [
          ...(config.chiffres.animaux_adoptes  ? [{ value: config.chiffres.animaux_adoptes,  label: 'animaux adoptés' }]   : []),
          ...(config.chiffres.familles_accueil ? [{ value: config.chiffres.familles_accueil, label: "familles d'accueil" }] : []),
          ...(config.chiffres.annees_existence ? [{ value: config.chiffres.annees_existence, label: "ans d'engagement" }]   : []),
          ...(config.chiffres.custom ?? []).filter(c => c.value && c.label),
        ];
        if (!items.length) return null;
        return (
          <section className="bg-[#2d3a35] py-14">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap justify-center gap-x-10 sm:gap-x-20 gap-y-8 text-center text-white">
                {items.map((item, i) => (
                  <div key={i} className="min-w-[120px]">
                    <div className="text-5xl font-black tracking-tighter mb-1">{item.value}</div>
                    <div className="text-sm font-semibold text-white/65 uppercase tracking-widest">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      {/* DERNIÈRES ACTUALITÉS */}
      {(() => {
        const block = loadFeaturedArticleBlock();
        if (!block) return null;
        const d = block.data as FeaturedArticleData;
        let allArticles: { id: string; title: string; slug: string; excerpt: string; cover_url: string; author: string; published_at: string; published: boolean }[] = [];
        try { const raw = localStorage.getItem('articles'); if (raw) allArticles = JSON.parse(raw); } catch { /**/ }
        const published = allArticles.filter(a => a.published);
        const article = d.auto !== 'false'
          ? published.sort((a, b) => b.published_at.localeCompare(a.published_at))[0]
          : published.find(a => a.id === d.article_id);
        if (!article) return null;
        return (
          <section className="bg-[#FAFAF7] py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
                <div>
                  <p className="text-nv-teal text-[11px] font-extrabold uppercase tracking-widest mb-3">Actualités</p>
                  <h2 className="text-4xl font-black text-forest">Dernières nouvelles</h2>
                </div>
                <Link to="/actualites" className="flex items-center gap-2 text-nv-green font-bold hover:text-forest transition-colors group whitespace-nowrap">
                  Toutes les actualités <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="grid lg:grid-cols-2 gap-10 items-center max-w-5xl">
                {article.cover_url && (
                  <div className="rounded-[20px] overflow-hidden aspect-[4/3] border-2 border-site-border">
                    <img src={resolveImageUrl(article.cover_url)} alt={article.title} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                )}
                <div>
                  {article.published_at && (
                    <div className="flex items-center gap-2 text-xs text-hint mb-3">
                      <Newspaper size={13} />
                      {new Date(article.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      {article.author && <><span>·</span><span>{article.author}</span></>}
                    </div>
                  )}
                  <h3 className="text-2xl font-black text-forest mb-3 leading-tight">{article.title}</h3>
                  {article.excerpt && <p className="text-muted leading-relaxed mb-6">{article.excerpt}</p>}
                  <Link to={`/actualites/${article.slug}`} className="btn-primary">
                    {d.cta_text || "Lire l'article"} <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* TÉMOIGNAGES */}
      {(pc.show_temoignages !== false) && (() => {
        const temoignages = pc.temoignages as Array<{ texte: string; auteur: string; lieu?: string; animal?: string; photo_url?: string }> | undefined;
        if (!temoignages || temoignages.length === 0) return null;
        return (
          <section className="bg-page py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-14">
                <p className="text-nv-teal text-[11px] font-extrabold uppercase tracking-widest mb-3">Témoignages</p>
                <h2 className="text-4xl font-black text-forest">
                  {(pc.temoignages_title as string) || 'Ils ont adopté'}
                </h2>
                {(pc.temoignages_subtitle as string) && (
                  <p className="text-muted mt-3 text-lg">{pc.temoignages_subtitle as string}</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {temoignages.map((t, i) => (
                  <div key={i} className="bg-surface rounded-[20px] p-8 border-2 border-site-border flex flex-col">
                    <Quote size={28} className="text-nv-teal/30 mb-4 flex-shrink-0" />
                    <p className="text-muted leading-relaxed flex-1 italic">"{t.texte}"</p>
                    <div className="mt-6 flex items-center gap-3">
                      {t.photo_url ? (
                        <img src={resolveImageUrl(t.photo_url)} alt={t.auteur} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-nv-green-light flex items-center justify-center text-nv-green font-bold text-sm flex-shrink-0">
                          {t.auteur.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-forest text-sm">{t.auteur}</div>
                        {t.lieu && <div className="text-hint text-xs">{t.lieu}{t.animal ? ` · ${t.animal}` : ''}</div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      {/* BLOCS ADDITIONNELS */}
      <SystemPageBlocks pageId="sys-accueil" skipTypes={['featured-article']} />

      {/* DEVENIR MEMBRE */}
      <section className="bg-[#1e2b25] py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-nv-amber text-[11px] font-extrabold uppercase tracking-widest mb-6">Rejoignez-nous</p>
              <h2 className="text-white font-black text-4xl md:text-5xl leading-tight mb-6">
                Devenez membre<br />de l'association
              </h2>
              <p className="text-white/60 text-lg leading-relaxed mb-8">
                En devenant membre, vous participez activement aux actions de Domaine de Fuego — sauvetages, soins, familles d'accueil et adoptions. Une adhésion simple, un impact réel.
              </p>
              <Link to="/devenir-membre" className="btn-don">Je rejoins l'association ♥</Link>
              <p className="text-white/30 text-xs mt-3">Association loi 1901 · Adhésion déductible à 66%</p>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-sm rounded-3xl p-8 border" style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.12)' }}>
                <div className="text-center mb-6">
                  <div className="inline-flex items-baseline gap-1">
                    <span className="text-6xl font-black text-white">100</span>
                    <span className="text-2xl font-bold text-white/50">€</span>
                  </div>
                  <div className="text-nv-amber text-sm font-extrabold uppercase tracking-widest mt-1">par an</div>
                </div>
                <div className="space-y-3 mb-8">
                  {[
                    'Participation aux actions de terrain',
                    'Vote lors des assemblées générales',
                    'Newsletter membres exclusifs',
                    'Réduction fiscale (66% du montant)',
                    'Suivi des animaux pris en charge',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-white/75 text-sm">
                      <div className="w-5 h-5 rounded-full bg-[#1B6B4A]/30 flex items-center justify-center flex-shrink-0">
                        <Check size={11} className="text-nv-teal" />
                      </div>
                      {item}
                    </div>
                  ))}
                </div>
                <Link to="/devenir-membre" className="btn-primary w-full justify-center">
                  Adhérer maintenant <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CTA
      <section className="bg-[#FAFAF7] py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl font-black mb-3">
            {(pc.footer_cta_title as string) || "Prêt à changer une vie ?"}
          </h2>
          <p className="text-white/75 text-lg mb-8 leading-relaxed">
            {(pc.footer_cta_text as string) || "Adoptez, devenez famille d'accueil, ou rejoignez-nous comme membre."}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/animaux" className="btn-secondary"><Heart size={18} />Adopter un animal</Link>
            <Link to="/devenir-membre" className="btn-ghost"><Users size={18} />Devenir membre</Link>
          </div>
        </div>
      </section> */}
    </>
  );
}
