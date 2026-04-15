import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ChevronDown, ChevronRight } from 'lucide-react';
import { useAdminPages } from '../hooks/useAdminData';
import type { AdminPage, Block } from '../types/admin';
import FormContact from '../components/FormContact';
import { detectVideoType, getYoutubeEmbedUrl, resolveImageUrl } from '../utils/image';

// ─── FAQ accordion ────────────────────────────────────────────────────────────
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

// ─── Team grid ────────────────────────────────────────────────────────────────
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

// ─── Stat color map ───────────────────────────────────────────────────────────
const STAT_COLORS: Record<string, string> = {
  coral:  'bg-coral-500 text-white',
  blue:   'bg-blue-600 text-white',
  green:  'bg-green-600 text-white',
  purple: 'bg-purple-600 text-white',
};

// ─── Block renderer ───────────────────────────────────────────────────────────
function renderBlock(block: Block) {
  switch (block.type) {
    case 'text':
      return (
        <div
          key={block.id}
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: (block.data.content as string) || '' }}
        />
      );

    case 'image': {
      const imgSrc = resolveImageUrl((block.data.url as string) || '');
      return (
        <figure key={block.id} className="my-6">
          {imgSrc && (
            <img
              src={imgSrc}
              alt={(block.data.caption as string) || ''}
              className="w-full rounded-2xl object-cover max-h-96"
              loading="lazy"
            />
          )}
          {block.data.caption && (
            <figcaption className="text-center text-sm text-gray-400 mt-2">
              {block.data.caption as string}
            </figcaption>
          )}
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
          {photos.map((p, i) => (
            <img key={i} src={p} alt="" className="w-full aspect-square object-cover rounded-xl" loading="lazy" />
          ))}
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
            <iframe
              src={embedUrl}
              title="Vidéo YouTube"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        ) : null;
      }
      if (vtype === 'direct') {
        return (
          <div key={block.id} className="my-6">
            <video src={url} controls className="w-full rounded-2xl max-h-[540px]" />
          </div>
        );
      }
      return null;
    }

    case 'separator': {
      const sizeMap: Record<string, string> = { small: 'py-4', medium: 'py-8', large: 'py-16' };
      const cls = sizeMap[(block.data.size as string) || 'medium'] ?? 'py-8';
      return (
        <div key={block.id} className={cls}>
          <hr className="border-gray-200" />
        </div>
      );
    }

    case 'columns2':
      return (
        <div key={block.id} className="grid grid-cols-1 md:grid-cols-2 gap-8 my-6">
          <div
            className="prose prose-gray max-w-none"
            dangerouslySetInnerHTML={{ __html: (block.data.left as string) || '' }}
          />
          <div
            className="prose prose-gray max-w-none"
            dangerouslySetInnerHTML={{ __html: (block.data.right as string) || '' }}
          />
        </div>
      );

    case 'hero_banner': {
      const bgUrl = resolveImageUrl((block.data.bg_url as string) || '');
      return (
        <div
          key={block.id}
          className="relative rounded-2xl overflow-hidden my-6 min-h-[320px] flex items-center bg-gray-900"
        >
          {bgUrl && (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-40"
              style={{ backgroundImage: `url(${bgUrl})` }}
            />
          )}
          <div className="relative z-10 px-8 py-12 max-w-2xl">
            {block.data.title && (
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{block.data.title as string}</h2>
            )}
            {block.data.subtitle && (
              <p className="text-lg text-gray-300 mb-8">{block.data.subtitle as string}</p>
            )}
            {block.data.cta_label && block.data.cta_url && (
              <Link to={block.data.cta_url as string} className="btn-primary text-base px-8 py-3">
                {block.data.cta_label as string}
              </Link>
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
      return (
        <div
          key={block.id}
          className="my-6"
          dangerouslySetInnerHTML={{ __html: (block.data.code as string) || '' }}
        />
      );

    case 'featured-article': {
      let articles: { id: string; title: string; slug: string; excerpt: string; cover_url: string; author: string; published_at: string; published: boolean }[] = [];
      try {
        const stored = localStorage.getItem('articles');
        if (stored) articles = JSON.parse(stored);
      } catch { /**/ }
      const published = articles.filter(a => a.published);
      const isAuto = (block.data.auto as string) !== 'false';
      const articleId = block.data.article_id as string;
      const article = isAuto
        ? published.sort((a, b) => b.published_at.localeCompare(a.published_at))[0]
        : published.find(a => a.id === articleId);
      const sectionTitle = (block.data.section_title as string) || 'Dernière actualité';
      const ctaText = (block.data.cta_text as string) || "Lire l'article";
      const fallbackUrl = (block.data.fallback_url as string) || '/blog';

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
            {article.cover_url && (
              <div className="md:w-2/5 flex-shrink-0">
                <img src={article.cover_url} alt={article.title} className="w-full h-56 md:h-full object-cover" loading="lazy" />
              </div>
            )}
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
                <Link to={`/blog/${article.slug}`} className="btn-primary inline-flex">{ctaText}</Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}

// ─── Page component ───────────────────────────────────────────────────────────
export default function CustomPage() {
  const { slug } = useParams<{ slug: string }>();
  const { pages } = useAdminPages();
  const [page, setPage] = useState<AdminPage | null | undefined>(undefined);

  useEffect(() => {
    const found = pages.find(p => p.slug === slug && p.status === 'published' && !p.system);
    setPage(found ?? null);
  }, [slug, pages]);

  if (page === undefined) return null;

  if (page === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="text-6xl">📄</div>
        <h1 className="text-2xl font-bold text-gray-900">Page introuvable</h1>
        <p className="text-gray-500">Cette page n'existe pas ou n'est pas publiée.</p>
        <Link to="/" className="btn-primary">Retour à l'accueil</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero header */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold">{page.title}</h1>
          {page.seo_description && <p className="text-gray-400 mt-3 text-lg">{page.seo_description}</p>}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {page.content && (
          <div
            className="prose prose-gray max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        )}
        <div className="space-y-8">
          {page.blocks.map(block => renderBlock(block))}
        </div>
      </div>
    </div>
  );
}
