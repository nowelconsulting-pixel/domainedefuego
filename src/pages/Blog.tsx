import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { useArticles } from '../hooks/useArticles';
import { usePageContent } from '../hooks/usePageContent';

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function Blog() {
  const { articles, loading } = useArticles();
  const pc = usePageContent('blog');

  const published = articles
    .filter(a => a.published)
    .sort((a, b) => b.published_at.localeCompare(a.published_at));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="section-title">Blog</h1>
          {pc.subtitle && (
            <p className="section-subtitle">{pc.subtitle as string}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <p className="text-gray-500">Chargement…</p>
        ) : published.length === 0 ? (
          <p className="text-gray-500">Aucun article publié pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {published.map(article => (
              <div
                key={article.id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col"
              >
                {article.cover_url && (
                  <img
                    src={article.cover_url}
                    alt={article.title}
                    className="aspect-video object-cover w-full rounded-t-2xl"
                  />
                )}
                <div className="p-5 flex flex-col flex-1">
                  <h2 className="font-semibold text-gray-900 mb-2 leading-snug">
                    {article.title}
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3 flex-1">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
                    <Calendar size={13} />
                    <span>{formatDate(article.published_at)}</span>
                    {article.author && (
                      <>
                        <span className="mx-1">·</span>
                        <span>{article.author}</span>
                      </>
                    )}
                  </div>
                  <Link
                    to={`/blog/${article.slug}`}
                    className="btn-primary text-center text-sm"
                  >
                    Lire l'article
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
