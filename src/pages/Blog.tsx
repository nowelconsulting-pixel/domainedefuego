import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import { useArticles } from '../hooks/useArticles';
import { usePageContent } from '../hooks/usePageContent';
import { resolveImageUrl } from '../utils/image';

function formatDate(dateStr: string): string {
  try { return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }); }
  catch { return dateStr; }
}

export default function Blog() {
  const { articles, loading } = useArticles();
  const pc = usePageContent('actualites');

  const published = articles
    .filter(a => a.published)
    .sort((a, b) => b.published_at.localeCompare(a.published_at));

  return (
    <div className="min-h-screen bg-page">
      <div className="bg-surface border-b-2 border-site-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-extrabold text-forest mb-2">
            {(pc.title as string) || 'Actualités'}
          </h1>
          {pc.subtitle ? <p className="text-muted text-lg">{pc.subtitle as string}</p> : null}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-surface rounded-[20px] border-2 border-site-border animate-pulse">
                <div className="aspect-video bg-page rounded-t-[20px]" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-page rounded w-3/4" />
                  <div className="h-3 bg-page rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : published.length === 0 ? (
          <p className="text-muted">Aucun article publié pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {published.map(article => (
              <div key={article.id} className="bg-surface rounded-[20px] border-2 border-site-border overflow-hidden flex flex-col group hover:-translate-y-1 hover:border-nv-green hover:shadow-lg transition-all duration-200">
                {article.cover_url && (
                  <div className="aspect-video overflow-hidden">
                    <img src={resolveImageUrl(article.cover_url)} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                )}
                <div className="p-5 flex flex-col flex-1">
                  <h2 className="font-extrabold text-forest mb-2 leading-snug">{article.title}</h2>
                  <p className="text-muted text-sm leading-relaxed mb-3 flex-1">{article.excerpt}</p>
                  <div className="flex items-center gap-1 text-xs text-hint mb-4">
                    <Calendar size={13} />
                    <span>{formatDate(article.published_at)}</span>
                    {article.author && <><span className="mx-1">·</span><span>{article.author}</span></>}
                  </div>
                  <Link to={`/actualites/${article.slug}`} className="btn-primary text-sm justify-center">
                    Lire l'article <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
