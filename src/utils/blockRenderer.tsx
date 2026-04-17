import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ChevronDown, ChevronRight } from 'lucide-react';
import type { Block } from '../types/admin';
import FormContact from '../components/FormContact';
import FormAdoption from '../components/FormAdoption';
import FormFamilleAccueil from '../components/FormFamilleAccueil';
import { CustomFormEmbed } from '../pages/FormulairePage';
import { detectVideoType, getYoutubeEmbedUrl, resolveImageUrl } from './image';

function FaqBlock({ block }: { block: Block }) {
  const [open, setOpen] = useState<number | null>(null);
  let items: { q: string; a: string }[] = [];
  try { items = JSON.parse((block.data.items as string) || '[]'); } catch { /**/ }
  return (
    <div className="divide-y divide-gray-200 border border-gray-200 rounded-2xl overflow-hidden">
      {items.map((item, i) => (
        <div key={i}>
          <button
            className="w-full flex items-center justify-between px-6 py-4 text-left font-medium text-gray-900 hover:bg-gray-50 transition-colors"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span>{item.q}</span>
            {open === i ? <ChevronDown size={18} className="text-coral-500 shrink-0" /> : <ChevronRight size={18} className="text-gray-400 shrink-0" />}
          </button>
          {open === i && (
            <div className="px-6 pb-4 text-gray-600 leading-relaxed">{item.a}</div>
          )}
        </div>
      ))}
    </div>
  );
}

function TeamBlock({ block }: { block: Block }) {
  let members: { name: string; role: string; photo: string; desc: string }[] = [];
  try { members = JSON.parse((block.data.members as string) || '[]'); } catch { /**/ }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {members.map((m, i) => (
        <div key={i} className="bg-gray-50 rounded-2xl p-6 text-center">
          {m.photo && (
            <img src={m.photo} alt={m.name} className="w-24 h-24 rounded-full object-cover mx-auto mb-4" loading="lazy" />
          )}
          <div className="font-semibold text-gray-900">{m.name}</div>
          {m.role && <div className="text-sm text-coral-500 mt-0.5">{m.role}</div>}
          {m.desc && <p className="text-sm text-gray-600 mt-3 leading-relaxed">{m.desc}</p>}
        </div>
      ))}
    </div>
  );
}

const STAT_COLORS: Record<string, string> = {
  coral:  'bg-coral-500 text-white',
  blue:   'bg-blue-600 text-white',
  green:  'bg-green-600 text-white',
  purple: 'bg-purple-600 text-white',
};

export function renderBlock(block: Block) {
  switch (block.type) {
    case 'text':
      return (
        <div key={block.id} className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: (block.data.content as string) || '' }}
        />
      );

    case 'image': {
      const imgSrc = resolveImageUrl((block.data.url as string) || '');
      return (
        <figure key={block.id} className="my-6">
          {imgSrc && <img src={imgSrc} alt={(block.data.caption as string) || ''} className="w-full rounded-2xl object-cover max-h-96" loading="lazy" />}
          {block.data.caption && <figcaption className="text-center text-sm text-gray-400 mt-2">{block.data.caption as string}</figcaption>}
        </figure>
      );
    }

    case 'card':
      return (
        <div key={block.id} className="bg-gray-50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{block.data.title as string}</h3>
          <p className="text-gray-600">{block.data.text as string}</p>
        </div>
      );

    case 'cta':
      return (
        <div key={block.id} className="text-center my-6">
          <Link to={(block.data.url as string) || '#'} className="btn-primary text-base px-8 py-4 inline-flex">
            {(block.data.label as string) || 'En savoir plus'}
          </Link>
        </div>
      );

    case 'gallery': {
      const photos = ((block.data.photos as string) || '').split('\n').map(s => s.trim()).filter(Boolean);
      return (
        <div key={block.id} className="grid grid-cols-2 md:grid-cols-3 gap-4 my-6">
          {photos.map((p, i) => <img key={i} src={p} alt="" className="w-full aspect-square object-cover rounded-xl" loading="lazy" />)}
        </div>
      );
    }

    case 'contact_form':
      return (
        <div key={block.id} className="my-8 bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Nous contacter</h3>
          <FormContact />
        </div>
      );

    case 'faq':
      return <FaqBlock key={block.id} block={block} />;

    case 'testimonial': {
      const stars = parseInt((block.data.stars as string) || '5');
      return (
        <div key={block.id} className="bg-gray-50 rounded-2xl p-8">
          <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, j) => (
              <Star key={j} size={16} className={j < stars ? 'fill-coral-400 text-coral-400' : 'fill-gray-200 text-gray-200'} />
            ))}
          </div>
          <p className="text-gray-700 leading-relaxed mb-6 italic">"{block.data.text as string}"</p>
          <div>
            <div className="font-semibold text-gray-900">{block.data.name as string}</div>
            {block.data.role && <div className="text-sm text-gray-500">{block.data.role as string}</div>}
          </div>
        </div>
      );
    }

    case 'video': {
      const url = (block.data.url as string) || '';
      const vtype = detectVideoType(url);
      if (!url) return null;
      if (vtype === 'youtube') {
        const embedUrl = getYoutubeEmbedUrl(url);
        return embedUrl ? (
          <div key={block.id} className="relative aspect-video rounded-2xl overflow-hidden my-6">
            <iframe src={embedUrl} title="Vidéo YouTube"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen className="absolute inset-0 w-full h-full" />
          </div>
        ) : null;
      }
      if (vtype === 'direct') {
        return <div key={block.id} className="my-6"><video src={url} controls className="w-full rounded-2xl max-h-[540px]" /></div>;
      }
      return null;
    }

    case 'separator': {
      const sizeMap: Record<string, string> = { small: 'py-4', medium: 'py-8', large: 'py-16' };
      const cls = sizeMap[(block.data.size as string) || 'medium'] ?? 'py-8';
      return <div key={block.id} className={cls}><hr className="border-gray-200" /></div>;
    }

    case 'columns2':
      return (
        <div key={block.id} className="grid grid-cols-1 md:grid-cols-2 gap-8 my-6">
          <div className="prose prose-gray max-w-none" dangerouslySetInnerHTML={{ __html: (block.data.left as string) || '' }} />
          <div className="prose prose-gray max-w-none" dangerouslySetInnerHTML={{ __html: (block.data.right as string) || '' }} />
        </div>
      );

    case 'hero_banner': {
      const bgUrl = resolveImageUrl((block.data.bg_url as string) || '');
      return (
        <div key={block.id} className="relative rounded-2xl overflow-hidden my-6 min-h-[320px] flex items-center bg-gray-900">
          {bgUrl && <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: `url(${bgUrl})` }} />}
          <div className="relative z-10 px-8 py-12 max-w-2xl">
            {block.data.title && <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{block.data.title as string}</h2>}
            {block.data.subtitle && <p className="text-lg text-gray-300 mb-8">{block.data.subtitle as string}</p>}
            {block.data.cta_label && block.data.cta_url && (
              <Link to={block.data.cta_url as string} className="btn-primary text-base px-8 py-3">{block.data.cta_label as string}</Link>
            )}
          </div>
        </div>
      );
    }

    case 'stat': {
      const colorCls = STAT_COLORS[(block.data.color as string) || 'coral'] ?? STAT_COLORS.coral;
      return (
        <div key={block.id} className={`rounded-2xl p-8 text-center ${colorCls}`}>
          <div className="text-5xl font-bold mb-2">{block.data.value as string}</div>
          <div className="text-lg opacity-90">{block.data.label as string}</div>
        </div>
      );
    }

    case 'team':
      return <TeamBlock key={block.id} block={block} />;

    case 'embed':
      return <div key={block.id} className="my-6" dangerouslySetInnerHTML={{ __html: (block.data.code as string) || '' }} />;

    case 'featured-article': {
      let articles: { id: string; title: string; slug: string; excerpt: string; cover_url: string; author: string; published_at: string; published: boolean }[] = [];
      try { const stored = localStorage.getItem('articles'); if (stored) articles = JSON.parse(stored); } catch { /**/ }
      const published = articles.filter(a => a.published);
      const isAuto = (block.data.auto as string) !== 'false';
      const article = isAuto
        ? published.sort((a, b) => b.published_at.localeCompare(a.published_at))[0]
        : published.find(a => a.id === (block.data.article_id as string));
      const sectionTitle = (block.data.section_title as string) || 'Dernière actualité';
      const ctaText = (block.data.cta_text as string) || "Lire l'article";
      const fallbackUrl = (block.data.fallback_url as string) || '/actualites';
      if (!article) {
        return (
          <div key={block.id} className="my-8 text-center">
            <p className="text-gray-400 italic">Aucun article publié à afficher.</p>
            <Link to={fallbackUrl} className="text-coral-500 text-sm hover:underline mt-2 inline-block">Voir le blog →</Link>
          </div>
        );
      }
      return (
        <div key={block.id} className="my-8">
          {sectionTitle && <h2 className="text-2xl font-bold text-gray-900 mb-6">{sectionTitle}</h2>}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col md:flex-row">
            <div className="md:w-2/5 flex-shrink-0">
              {article.cover_url
                ? <img src={article.cover_url} alt={article.title} className="w-full h-56 md:h-full object-cover" loading="lazy" />
                : <div className="w-full h-56 md:h-full bg-gray-100" />
              }
            </div>
            <div className="p-6 flex flex-col justify-between flex-1">
              <div>
                {article.published_at && (
                  <p className="text-xs text-gray-400 mb-2">
                    {new Date(article.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {article.author && <> · {article.author}</>}
                  </p>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-3">{article.title}</h3>
                {article.excerpt && <p className="text-gray-600 leading-relaxed line-clamp-3">{article.excerpt}</p>}
              </div>
              <div className="mt-4">
                <Link to={`/actualites/${article.slug}`} className="btn-primary inline-flex">{ctaText}</Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    case 'form': {
      const formType = (block.data.form_type as string) || '';
      if (formType === 'contact') return <div key={block.id} className="my-8"><FormContact /></div>;
      if (formType === 'adoption') return <div key={block.id} className="my-8"><FormAdoption /></div>;
      if (formType === 'fa') return <div key={block.id} className="my-8"><FormFamilleAccueil /></div>;
      if (formType.startsWith('custom_')) {
        const customSlug = formType.replace(/^custom_/, '');
        return <div key={block.id} className="my-8"><CustomFormEmbed slug={customSlug} /></div>;
      }
      return null;
    }

    default:
      return null;
  }
}
