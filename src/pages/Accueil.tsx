import { Link } from 'react-router-dom';
import { Heart, Users, ArrowRight, ChevronDown, Newspaper, Check } from 'lucide-react';
import AnimalCard from '../components/AnimalCard';
import { useAnimaux, useConfig } from '../hooks/useData';
import { usePageContent } from '../hooks/usePageContent';
import pageDefaults from '../data/pageDefaults';
import { resolveImageUrl } from '../utils/image';

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
  const heroBg = resolveImageUrl((pc.hero_bg_url as string) || '') || '/Adoption.png';

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-screen flex items-end overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: `url(${heroBg})`, backgroundSize: 'cover', backgroundPosition: 'center 30%' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(15,20,17,0.93) 0%, rgba(15,20,17,0.60) 50%, rgba(15,20,17,0.15) 100%)' }} />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 md:pb-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6 text-[11px] font-extrabold uppercase tracking-widest" style={{ background: 'rgba(226,169,79,0.18)', color: '#E2A94F' }}>
              🤍 Association de protection animale - Val d'Oise
            </div>
            <h1 className="font-black text-white leading-[1.02] mb-5 whitespace-pre-line" style={{ fontSize: 'clamp(3rem, 7vw, 5.5rem)' }}>
              {(pc.hero_title as string) || "ILS N'ATTENDENT\nQUE VOUS"}
            </h1>
            <p className="text-white/65 text-lg leading-relaxed mb-8 max-w-lg">
              {(pc.hero_subtitle as string) || "Chaque animal abrite une histoire. Certains attendent depuis trop longtemps. Il est temps d'écrire la suite."}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/animaux" className="btn-primary">Voir nos animaux <ArrowRight size={18} /></Link>
              <Link to="/famille-accueil" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-white border-2 hover:bg-white/10 transition-colors" style={{ borderColor: 'rgba(255,255,255,0.30)' }}>
                Devenir famille d'accueil
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 right-8 z-10 hidden md:block text-white/35">
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
