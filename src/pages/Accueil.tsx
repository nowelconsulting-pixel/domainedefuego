import { Link } from 'react-router-dom';
import { Heart, Home, Shield, Users, ChevronRight, Star, ArrowRight, ChevronDown } from 'lucide-react';
import AnimalCard from '../components/AnimalCard';
import { useAnimaux, useConfig } from '../hooks/useData';
import { usePageContent } from '../hooks/usePageContent';
import pageDefaults from '../data/pageDefaults';
import { resolveImageUrl } from '../utils/image';

function Cta({ label, url, className, children }: { label: string; url: string; className?: string; children?: React.ReactNode }) {
  const cls = `${className ?? ''} inline-flex items-center gap-2`.trim();
  if (!label) return null;
  if (!url) return <span className={`${cls} opacity-40 cursor-not-allowed`}>{label}{children}</span>;
  if (url.startsWith('http')) return <a href={url} className={cls} target="_blank" rel="noopener noreferrer">{label}{children}</a>;
  return <Link to={url} className={cls}>{label}{children}</Link>;
}

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

  const derniers    = animaux?.filter(a => a.statut === 'Disponible').slice(0, 3) ?? [];
  const etapes      = (pc.etapes as Array<{ num: string; titre: string; desc: string }>) || [];
  const temoignages = (pc.temoignages as Array<{ texte: string; auteur: string; lieu: string; photo_url?: string; animal?: string }>) || [];

  const howCtaLabel  = (pc.how_cta_label   as string) || 'Déposer une candidature';
  const howCtaUrl    = (pc.how_cta_url     as string) ?? '/adopter';
  const ctaBtn1Label = (pc.footer_cta_label as string) || 'Adopter un animal';
  const ctaBtn1Url   = (pc.footer_cta_url  as string) ?? '/animaux';
  const ctaBtn2Label = (pc.cta_btn2_label  as string) || "Devenir famille d'accueil";
  const ctaBtn2Url   = (pc.cta_btn2_url    as string) ?? '/famille-accueil';

  const heroBg = resolveImageUrl((pc.hero_bg_url as string) || '') || '/Adoption.png';

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-end overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: `url(${heroBg})`, backgroundSize: 'cover', backgroundPosition: 'center 30%' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(15,20,17,0.93) 0%, rgba(15,20,17,0.55) 55%, rgba(15,20,17,0.20) 100%)' }} />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 md:pb-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-8 text-[11px] font-extrabold uppercase tracking-widest backdrop-blur-sm" style={{ background: 'rgba(226,169,79,0.18)', color: '#E2A94F' }}>
              🐾 Association de protection animale
            </div>
            <h1 className="font-black text-white leading-[1.02] mb-6 whitespace-pre-line" style={{ fontSize: 'clamp(3rem, 7vw, 5.5rem)' }}>
              {(pc.hero_title as string) || 'ILS N\'ATTENDENT\nQUE VOUS'}
            </h1>
            <p className="text-white/65 text-lg md:text-xl leading-relaxed mb-10 max-w-lg">
              {(pc.hero_subtitle as string) || 'Chaque animal abrite une histoire. Certains attendent depuis trop longtemps. Il est temps d\'écrire la suite.'}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/animaux" className="btn-primary">Voir nos animaux <ArrowRight size={18} /></Link>
              <Link to="/famille-accueil" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-white border-2 hover:bg-white/10 transition-colors" style={{ borderColor: 'rgba(255,255,255,0.30)' }}>
                Devenir famille d'accueil
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 right-8 z-10 hidden md:flex flex-col items-center gap-2 text-white/35">
          <ChevronDown size={20} className="animate-bounce" />
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────────────── */}
      {(pc.show_stats !== false) && config && (() => {
        const items = [
          ...(config.chiffres.animaux_adoptes  ? [{ value: config.chiffres.animaux_adoptes,  label: 'animaux adoptés' }]   : []),
          ...(config.chiffres.familles_accueil ? [{ value: config.chiffres.familles_accueil, label: "familles d'accueil" }] : []),
          ...(config.chiffres.annees_existence ? [{ value: config.chiffres.annees_existence, label: "ans d'engagement" }]   : []),
          ...(config.chiffres.custom ?? []).filter(c => c.value && c.label),
        ];
        if (!items.length) return null;
        return (
          <section className="bg-nv-green py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap justify-center gap-x-20 gap-y-8 text-center text-white">
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

      {/* ── ANIMAUX ──────────────────────────────────────────────────────────── */}
      {(pc.show_latest_animals !== false) && derniers.length > 0 && (
        <section className="bg-page py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16">
              <p className="text-nv-teal text-[11px] font-extrabold uppercase tracking-widest mb-3">Ils attendent</p>
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
                <h2 className="text-4xl md:text-5xl font-black text-forest leading-tight max-w-md" style={{ whiteSpace: 'pre-line' }}>
                  {(pc.section_title as string) || "Ces animaux\nchercent leur famille"}
                </h2>
                <Link to="/animaux" className="flex items-center gap-2 text-nv-green font-bold hover:text-forest transition-colors group whitespace-nowrap">
                  Tous nos animaux <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {derniers.map(animal => <AnimalCard key={animal.id} animal={animal} />)}
            </div>
            <p className="text-center text-hint text-sm mt-12 italic">
              Chaque profil, une histoire. Chaque adoption, un nouveau chapitre.
            </p>
          </div>
        </section>
      )}

      {/* ── HISTOIRE — FUEGO ─────────────────────────────────────────────────── */}
      <section className="bg-forest py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <p className="text-nv-amber text-[11px] font-extrabold uppercase tracking-widest mb-6">Notre histoire</p>
              <div className="text-6xl text-nv-teal/25 font-serif leading-none mb-2">"</div>
              <p className="text-white/90 text-2xl md:text-3xl font-bold leading-snug mb-8 italic">
                {(pc.story_quote as string) || "Fuego nous a appris que l'amour ne meurt pas. Il se transforme."}
              </p>
              <div className="space-y-5 text-white/58 leading-relaxed text-[15px]">
                <p>{(pc.story_p1 as string) || "Fuego était un Grand Bouvier Suisse d'une douceur rare. Quand la maladie l'a emporté trop tôt, le vide était immense. C'est dans ce deuil qu'est née l'idée du Domaine de Fuego."}</p>
                <p>{(pc.story_p2 as string) || "Marley est arrivé après. Un autre chien, une autre histoire — mais la même vérité : les animaux nous choisissent autant que nous les choisissons."}</p>
                <p>{(pc.story_p3 as string) || "Aujourd'hui, Domaine de Fuego accompagne des animaux vers leur famille. Chaque adoption est un hommage à Fuego."}</p>
              </div>
              <div className="mt-10">
                <Link to="/presentation" className="inline-flex items-center gap-2 text-nv-teal font-bold hover:text-white transition-colors group">
                  Découvrir notre association <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-3xl p-8 border" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.10)' }}>
                <div className="grid grid-cols-2 gap-6 text-center">
                  <div><div className="text-4xl font-black text-white">12+</div><div className="text-white/40 text-sm mt-1">animaux suivis</div></div>
                  <div><div className="text-4xl font-black text-white">4</div><div className="text-white/40 text-sm mt-1">familles d'accueil</div></div>
                  <div><div className="text-4xl font-black text-white">100%</div><div className="text-white/40 text-sm mt-1">suivi post-adoption</div></div>
                  <div className="flex items-center justify-center"><div className="text-sm font-bold text-nv-teal text-center">Association<br/>loi 1901</div></div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {[{ icon: Heart, label: 'Adoption accompagnée' }, { icon: Home, label: "Familles d'accueil" }, { icon: Shield, label: 'Soins pris en charge' }].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full text-white/65 text-sm border" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.10)' }}>
                      <Icon size={14} className="text-nv-amber flex-shrink-0" />{item.label}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROCESS ──────────────────────────────────────────────────────────── */}
      {(pc.show_how_it_works !== false) && etapes.length > 0 && (
        <section className="bg-surface py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl mb-16">
              <p className="text-nv-teal text-[11px] font-extrabold uppercase tracking-widest mb-4">L'adoption</p>
              <h2 className="text-4xl font-black text-forest leading-tight whitespace-pre-line">
                {(pc.how_title as string) || 'Simple.\nHumain.\nAccompagné.'}
              </h2>
              <p className="text-muted mt-4 leading-relaxed">{(pc.how_subtitle as string) || 'Nous vous guidons à chaque étape.'}</p>
            </div>
            <div className="space-y-8 max-w-3xl">
              {etapes.map((e, i) => (
                <div key={e.num} className={`flex gap-8 items-start ${i % 2 === 1 ? 'sm:flex-row-reverse sm:ml-auto' : ''} flex-row`}>
                  <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-nv-green flex items-center justify-center text-white font-black text-2xl shadow-md" style={{ boxShadow: '0 6px 24px rgba(79,127,106,0.25)' }}>{e.num}</div>
                  <div className="flex-1 pt-1">
                    <h3 className="text-xl font-bold text-forest mb-2">{e.titre}</h3>
                    <p className="text-muted leading-relaxed">{e.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-14">
              <Cta label={howCtaLabel} url={howCtaUrl} className="btn-primary px-8 py-4"><ChevronRight size={20} /></Cta>
            </div>
          </div>
        </section>
      )}

      {/* ── TÉMOIGNAGES ──────────────────────────────────────────────────────── */}
      {(pc.show_temoignages !== false) && temoignages.length > 0 && (
        <section className="bg-page py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg mb-16">
              <p className="text-nv-teal text-[11px] font-extrabold uppercase tracking-widest mb-4">Témoignages</p>
              <h2 className="text-4xl font-black text-forest whitespace-pre-line">
                {(pc.temoignages_title as string) || 'Ils ont changé\nune vie'}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {temoignages.map((t, i) => (
                <div key={i} className="bg-surface border-2 border-site-border rounded-[20px] p-8 flex flex-col">
                  <div className="flex gap-1 mb-4">{[...Array(5)].map((_, j) => <Star key={j} size={14} className="fill-nv-amber text-nv-amber" />)}</div>
                  <div className="text-5xl text-nv-teal/20 font-serif leading-none -mt-2 mb-2">"</div>
                  <p className="text-forest leading-relaxed mb-6 flex-1 text-[15px]">{t.texte}</p>
                  <div className="border-t-2 border-site-border pt-4 flex items-center gap-3">
                    {t.photo_url
                      ? <img src={resolveImageUrl(t.photo_url)} alt={t.auteur} className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-site-border" />
                      : <div className="w-10 h-10 rounded-full bg-nv-green-light flex items-center justify-center flex-shrink-0 text-nv-green font-bold text-sm">{t.auteur?.[0] ?? '?'}</div>
                    }
                    <div>
                      <div className="font-bold text-forest text-sm">{t.auteur}</div>
                      <div className="text-xs text-hint">{t.animal && <span className="text-nv-green font-semibold">{t.animal}</span>}{t.animal && t.lieu && ' · '}{t.lieu}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURED ARTICLE ─────────────────────────────────────────────────── */}
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
          <section className="bg-surface py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-16 items-center max-w-5xl">
                {article.cover_url && (
                  <div className="rounded-[20px] overflow-hidden aspect-[4/3]">
                    <img src={resolveImageUrl(article.cover_url)} alt={article.title} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                )}
                <div>
                  <p className="text-nv-teal text-[11px] font-extrabold uppercase tracking-widest mb-4">{d.section_title || 'Dernière actualité'}</p>
                  {article.published_at && <div className="text-xs text-hint mb-3">{new Date(article.published_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}{article.author && <span className="ml-2">· {article.author}</span>}</div>}
                  <h3 className="text-3xl font-black text-forest mb-4 leading-tight">{article.title}</h3>
                  {article.excerpt && <p className="text-muted leading-relaxed mb-8">{article.excerpt}</p>}
                  <Link to={`/blog/${article.slug}`} className="btn-primary">{d.cta_text || "Lire l'article"} <ArrowRight size={16} /></Link>
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* ── CTA DON ──────────────────────────────────────────────────────────── */}
      <section className="bg-forest-dark py-28 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-[600px] h-[600px] rounded-full blur-3xl opacity-[0.07]" style={{ background: '#E2A94F' }} />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-5xl mb-8">🐾</div>
          <h2 className="text-white font-black leading-tight mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            Votre don peut<br />changer une vie
          </h2>
          <p className="text-white/50 text-lg leading-relaxed mb-10 max-w-lg mx-auto">
            Chaque euro va directement au bien-être des animaux — soins, nourriture, abri. Votre générosité fait la différence.
          </p>
          <Link to="/faire-un-don" className="btn-don text-base px-12 py-4">Je fais un don ♥</Link>
          <p className="text-white/25 text-xs mt-5">Association loi 1901 · Réduction fiscale 66% · HelloAsso sécurisé</p>
        </div>
      </section>

      {/* ── FOOTER CTA ───────────────────────────────────────────────────────── */}
      <section className="bg-nv-green py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-black mb-4">{(pc.footer_cta_title as string) || 'Prêt à changer une vie ?'}</h2>
          <p className="text-white/75 text-lg mb-10 leading-relaxed">{(pc.footer_cta_text as string) || "Devenez adoptant ou famille d'accueil — chaque geste compte."}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Cta label={ctaBtn1Label} url={ctaBtn1Url} className="btn-secondary"><Heart size={20} /></Cta>
            <Cta label={ctaBtn2Label} url={ctaBtn2Url} className="btn-ghost"><Users size={20} /></Cta>
          </div>
        </div>
      </section>
    </>
  );
}
