import { Link } from 'react-router-dom';
import { Heart, Home, Shield, Users, ChevronRight, Star, ArrowRight } from 'lucide-react';
import AnimalCard from '../components/AnimalCard';
import { useAnimaux, useConfig } from '../hooks/useData';
import { usePageContent } from '../hooks/usePageContent';
import pageDefaults from '../data/pageDefaults';
import { resolveImageUrl } from '../utils/image';

// ─── Smart CTA link ───────────────────────────────────────────────────────────
function Cta({ label, url, className, children }: { label: string; url: string; className?: string; children?: React.ReactNode }) {
  const cls = `${className ?? ''} inline-flex items-center gap-2`.trim();
  if (!label) return null;
  if (!url) return <span className={`${cls} opacity-40 cursor-not-allowed`}>{label}{children}</span>;
  if (url.startsWith('http')) return <a href={url} className={cls} target="_blank" rel="noopener noreferrer">{label}{children}</a>;
  return <Link to={url} className={cls}>{label}{children}</Link>;
}

// ─── Load the featured-article block from sys-accueil page blocks ─────────────
interface FeaturedArticleData { auto?: string; article_id?: string; section_title?: string; cta_text?: string; fallback_url?: string; }
interface SimpleBlock { type: string; data: Record<string, string>; }

function loadFeaturedArticleBlock(): SimpleBlock | null {
  let blocks: SimpleBlock[] = [];
  try {
    const sysData = localStorage.getItem('system_page_data');
    if (sysData) {
      const parsed = JSON.parse(sysData);
      blocks = parsed['sys-accueil']?.blocks ?? [];
    }
  } catch { /**/ }
  if (!blocks.length) {
    const defaults = (pageDefaults.accueil as { blocks?: SimpleBlock[] }).blocks ?? [];
    blocks = defaults;
  }
  return blocks.find(b => b.type === 'featured-article') ?? null;
}

export default function Accueil() {
  const { data: animaux } = useAnimaux();
  const { data: config }  = useConfig();
  const pc = usePageContent('accueil');

  const derniers = animaux?.filter(a => a.statut === 'Disponible').slice(0, 3) ?? [];
  const etapes   = (pc.etapes as Array<{ num: string; titre: string; desc: string }>) || [];
  const temoignages = (pc.temoignages as Array<{ texte: string; auteur: string; lieu: string; photo_url?: string; animal?: string }>) || [];

  const howCtaLabel   = (pc.how_cta_label as string) || 'Déposer une candidature';
  const howCtaUrl     = (pc.how_cta_url   as string) ?? '/adopter';
  const ctaBtn1Label  = (pc.footer_cta_label as string) || 'Adopter un animal';
  const ctaBtn1Url    = (pc.footer_cta_url   as string) ?? '/animaux';
  const ctaBtn2Label  = (pc.cta_btn2_label as string) || "Devenir famille d'accueil";
  const ctaBtn2Url    = (pc.cta_btn2_url   as string) ?? '/famille-accueil';

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="bg-surface py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left column */}
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-nv-green-light text-nv-green text-xs font-extrabold uppercase tracking-widest rounded-full mb-6">
                🐾 Association de protection animale
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-forest leading-[1.08] mb-6">
                Trouver un foyer,<br />
                c'est changer<br />
                <span className="text-nv-green">une vie</span>
              </h1>
              <p className="text-muted text-lg leading-relaxed max-w-lg mb-10">
                {(pc.hero_subtitle as string) || "Domaine de Fuego accompagne chiens, chats et autres animaux vers l'adoption responsable. Chaque animal mérite un foyer aimant."}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/animaux" className="btn-primary">
                  Voir nos animaux <ChevronRight size={18} />
                </Link>
                <Link to="/faire-un-don" className="btn-don">
                  Soutenir le projet ♥
                </Link>
              </div>
            </div>

            {/* Right column — decorative */}
            <div className="relative hidden lg:block">
              <div className="w-full aspect-square rounded-[40px] bg-gradient-to-br from-nv-green-light via-nv-teal/20 to-page flex items-center justify-center text-8xl">
                🐾
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────────────── */}
      {(pc.show_stats !== false) && config && (() => {
        const items: { value: number; label: string }[] = [
          ...(config.chiffres.animaux_adoptes  ? [{ value: config.chiffres.animaux_adoptes,  label: 'animaux adoptés' }]          : []),
          ...(config.chiffres.familles_accueil ? [{ value: config.chiffres.familles_accueil, label: "familles d'accueil" }]        : []),
          ...(config.chiffres.annees_existence  ? [{ value: config.chiffres.annees_existence,  label: "ans d'existence" }]           : []),
          ...(config.chiffres.custom ?? []).filter(c => c.value && c.label),
        ];
        if (items.length === 0) return null;
        return (
          <section className="bg-nv-green">
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

      {/* ── BANDE PROMESSE ────────────────────────────────────────────────── */}
      <section className="bg-forest-dark py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div className="flex flex-col items-center">
              <Heart className="text-nv-amber mb-4" size={32} />
              <h3 className="text-white font-bold text-lg mb-2">Adoption suivie</h3>
              <p className="text-white/60 text-sm leading-relaxed">Un accompagnement bienveillant de A à Z pour chaque animal.</p>
            </div>
            <div className="flex flex-col items-center">
              <Home className="text-nv-amber mb-4" size={32} />
              <h3 className="text-white font-bold text-lg mb-2">Familles d'accueil</h3>
              <p className="text-white/60 text-sm leading-relaxed">Des foyers temporaires chaleureux en attendant l'adoption définitive.</p>
            </div>
            <div className="flex flex-col items-center">
              <Shield className="text-nv-amber mb-4" size={32} />
              <h3 className="text-white font-bold text-lg mb-2">Bien-être animal</h3>
              <p className="text-white/60 text-sm leading-relaxed">Soins vétérinaires, comportement, socialisation : tout est pris en charge.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── NOS ANIMAUX À L'ADOPTION ──────────────────────────────────────── */}
      {(pc.show_latest_animals !== false) && derniers.length > 0 && (
        <section className="bg-page py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-14">
              <div>
                <h2 className="section-title">{(pc.section_title as string) || "Nos animaux à l'adoption"}</h2>
                <p className="section-subtitle mt-2">{(pc.section_subtitle as string) || 'Ces animaux attendent leur famille idéale'}</p>
              </div>
              <Link to="/animaux" className="flex items-center gap-2 text-nv-green font-semibold hover:text-nv-green-mid whitespace-nowrap text-sm">
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
      {(pc.show_how_it_works !== false) && (
        <section className="bg-surface py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="section-title">{(pc.how_title as string) || 'Comment adopter ?'}</h2>
              <p className="section-subtitle mt-2">{(pc.how_subtitle as string) || 'Un processus simple et bienveillant en 3 étapes'}</p>
            </div>
            <div className="space-y-12 max-w-4xl mx-auto">
              {etapes.map((e, i) => (
                <div key={e.num} className={`flex flex-col sm:flex-row gap-8 items-center ${i % 2 === 1 ? 'sm:flex-row-reverse' : ''}`}>
                  <div className="w-20 h-20 bg-nv-green text-white rounded-2xl flex items-center justify-center text-3xl font-bold flex-shrink-0 shadow-lg shadow-nv-green/30">
                    {e.num}
                  </div>
                  <div className={`flex-1 ${i % 2 === 1 ? 'sm:text-right' : ''}`}>
                    <h3 className="text-xl font-semibold text-forest mb-3">{e.titre}</h3>
                    <p className="text-muted leading-relaxed">{e.desc}</p>
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
      )}

      {/* ── MISSION SECTION — ÉMOTIONNELLE ────────────────────────────────── */}
      <section className="bg-forest py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — text */}
            <div>
              <p className="text-nv-teal text-xs font-extrabold uppercase tracking-widest mb-4">Notre histoire</p>
              <h2 className="text-white font-black text-3xl md:text-4xl leading-tight mb-6">
                Un refuge construit avec amour, pour ceux qui ont attendu trop longtemps.
              </h2>
              <p className="text-white/65 leading-relaxed mb-8">
                Domaine de Fuego porte le nom de Fuego, un Grand Bouvier Suisse parti trop tôt. Ce projet est son hommage. Et une promesse faite à tous ceux qui attendent encore.
              </p>
              <Link to="/faire-un-don" className="btn-don">
                Faire un don ♥
              </Link>
              <p className="text-white/40 text-xs mt-3">Association loi 1901 · Don déductible fiscalement</p>
            </div>

            {/* Right — 2x2 stat grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl p-6 text-center bg-white/[0.06]">
                <div className="text-3xl font-black text-white">12+</div>
                <div className="text-white/50 text-sm mt-1">animaux suivis</div>
              </div>
              <div className="rounded-2xl p-6 text-center bg-white/[0.06]">
                <div className="text-3xl font-black text-white">4</div>
                <div className="text-white/50 text-sm mt-1">familles d'accueil</div>
              </div>
              <div className="rounded-2xl p-6 text-center bg-white/[0.06]">
                <div className="text-3xl font-black text-white">100%</div>
                <div className="text-white/50 text-sm mt-1">suivi post-adoption</div>
              </div>
              <div className="rounded-2xl p-6 text-center bg-white/[0.06]">
                <div className="text-3xl font-black text-white">Loi 1901</div>
                <div className="text-white/50 text-sm mt-1">association reconnue</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DERNIÈRE ACTUALITÉ (bloc featured-article) ───────────────────── */}
      {(() => {
        const block = loadFeaturedArticleBlock();
        if (!block) return null;
        const d = block.data as FeaturedArticleData;

        let allArticles: { id: string; title: string; slug: string; excerpt: string; cover_url: string; author: string; published_at: string; published: boolean }[] = [];
        try {
          const raw = localStorage.getItem('articles');
          if (raw) allArticles = JSON.parse(raw);
        } catch { /**/ }
        const published = allArticles.filter(a => a.published);
        const isAuto = d.auto !== 'false';
        const article = isAuto
          ? published.sort((a, b) => b.published_at.localeCompare(a.published_at))[0]
          : published.find(a => a.id === d.article_id);
        if (!article) return null;

        const sectionTitle = d.section_title || 'Dernière actualité';
        const ctaText = d.cta_text || "Lire l'article";

        return (
          <section className="bg-surface py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="section-title mb-12">{sectionTitle}</h2>
              <div className="bg-page rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-sm max-w-4xl border border-site-border">
                {article.cover_url && (
                  <div className="md:w-80 flex-shrink-0">
                    <img
                      src={article.cover_url}
                      alt={article.title}
                      className="w-full h-56 md:h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-8 flex flex-col justify-center gap-4">
                  {article.published_at && (
                    <div className="text-xs text-hint uppercase tracking-wider">
                      {new Date(article.published_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                      {article.author && <span className="ml-2">· {article.author}</span>}
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-forest">{article.title}</h3>
                  {article.excerpt && <p className="text-muted leading-relaxed">{article.excerpt}</p>}
                  <Link to={`/blog/${article.slug}`} className="btn-primary self-start mt-2">
                    {ctaText} <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* ── TÉMOIGNAGES ───────────────────────────────────────────────────── */}
      {(pc.show_temoignages !== false) && temoignages.length > 0 && (
        <section className="bg-page py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="section-title">{(pc.temoignages_title as string) || 'Ils ont adopté'}</h2>
              <p className="section-subtitle mt-2">{(pc.temoignages_subtitle as string) || 'Les témoignages de nos familles adoptantes'}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {temoignages.map((t, i) => (
                <div key={i} className="bg-surface border border-site-border rounded-2xl shadow-sm p-8 flex flex-col">
                  <div className="flex gap-1 mb-5">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={16} className="fill-nv-amber text-nv-amber" />
                    ))}
                  </div>
                  <p className="text-muted leading-relaxed mb-6 italic flex-1">"{t.texte}"</p>
                  <div className="border-t border-site-border pt-4 flex items-center gap-3">
                    {t.photo_url && (
                      <img src={resolveImageUrl(t.photo_url)} alt={t.auteur} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                    )}
                    <div>
                      <div className="font-semibold text-forest">{t.auteur}</div>
                      <div className="text-sm text-hint">
                        {t.animal && <span className="text-nv-green font-medium">{t.animal}</span>}
                        {t.animal && t.lieu && ' · '}
                        {t.lieu}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── DONATION BAND ─────────────────────────────────────────────────── */}
      <section className="bg-forest-dark py-20 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-white font-black text-3xl mb-3">Votre don construit le refuge</h2>
          <p className="text-white/60 mb-8">Chaque euro contribue directement au bien-être des animaux</p>
          <Link to="/faire-un-don" className="btn-don text-base px-10 py-4">
            Faire un don maintenant
          </Link>
          <p className="text-white/35 text-xs mt-4">Association loi 1901 · Don déductible fiscalement</p>
        </div>
      </section>

      {/* ── FOOTER CTA BAND ───────────────────────────────────────────────── */}
      <section className="bg-nv-green py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {(pc.footer_cta_title as string) || 'Prêt à changer une vie ?'}
          </h2>
          <p className="text-white/80 text-lg mb-10 leading-relaxed">
            {(pc.footer_cta_text as string) || "Devenez adoptant ou famille d'accueil — chaque geste compte pour nos animaux."}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Cta label={ctaBtn1Label} url={ctaBtn1Url} className="btn-secondary">
              <Heart size={20} />
            </Cta>
            <Cta label={ctaBtn2Label} url={ctaBtn2Url} className="btn-ghost">
              <Users size={20} />
            </Cta>
          </div>
        </div>
      </section>
    </>
  );
}
