import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { useArticles } from '../hooks/useArticles';

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch { return dateStr; }
}

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { articles, loading } = useArticles();

  if (loading) return null;

  const article = articles.find(a => a.slug === slug && a.published);

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="text-6xl">📰</div>
        <h1 className="text-2xl font-bold text-gray-900">Article introuvable</h1>
        <p className="text-gray-500">Cet article n'existe pas ou n'est pas publié.</p>
        <Link to="/blog" className="btn-primary">Retour au blog</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Cover image */}
      {article.cover_url && (
        <div className="w-full max-h-96 overflow-hidden">
          <img
            src={article.cover_url}
            alt={article.title}
            className="w-full h-96 object-cover"
            loading="lazy"
          />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/blog" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8 text-sm">
          <ArrowLeft size={16} /> Retour au blog
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">{article.title}</h1>

        <div className="flex items-center gap-4 text-sm text-gray-400 mb-10">
          {article.published_at && (
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {formatDate(article.published_at)}
            </span>
          )}
          {article.author && (
            <span className="flex items-center gap-1.5">
              <User size={14} />
              {article.author}
            </span>
          )}
        </div>

        <div
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        <div className="mt-12 pt-8 border-t border-gray-100">
          <Link to="/blog" className="btn-primary">
            <ArrowLeft size={16} /> Retour au blog
          </Link>
        </div>
      </div>
    </div>
  );
}
