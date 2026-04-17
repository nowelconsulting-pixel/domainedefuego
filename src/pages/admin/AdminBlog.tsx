import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Star, Trash2, Eye, EyeOff, Download } from 'lucide-react';
import { useArticles, saveArticle, deleteArticle } from '../../hooks/useArticles';
import type { Article } from '../../hooks/useArticles';

function resolveLocal(url: string): string {
  if (!url.startsWith('local:')) return url;
  return localStorage.getItem(url.slice('local:'.length)) ?? '';
}

function exportArticlesJson(articles: Article[]) {
  const resolved = articles.map(a => ({ ...a, cover_url: resolveLocal(a.cover_url) }));
  const blob = new Blob([JSON.stringify(resolved, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'articles.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return dateStr; }
}

export default function AdminBlog() {
  const { articles, save } = useArticles();
  const [confirm, setConfirm] = useState<string | null>(null);

  const sorted = [...articles].sort((a, b) => b.published_at.localeCompare(a.published_at));

  const togglePublished = (article: Article) => {
    const updated = { ...article, published: !article.published };
    if (!article.published && !article.published_at) {
      updated.published_at = new Date().toISOString().slice(0, 10);
    }
    saveArticle(updated);
    save(articles.map(a => a.id === article.id ? updated : a));
  };

  const toggleFeatured = (article: Article) => {
    const updated = { ...article, featured: !article.featured };
    saveArticle(updated);
    save(articles.map(a => a.id === article.id ? updated : a));
  };

  const handleDelete = (id: string) => {
    deleteArticle(id);
    save(articles.filter(a => a.id !== id));
    setConfirm(null);
  };

  const newId = `article-${Date.now()}`;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Blog / Actualités</h1>
        <div className="flex gap-2">
          <button
            onClick={() => exportArticlesJson(articles)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
            title="Télécharger articles.json pour déploiement"
          >
            <Download size={15} /> Exporter JSON
          </button>
          <Link
            to={`/admin/blog/edit/${newId}`}
            className="btn-primary text-sm"
          >
            <Plus size={16} /> Nouvel article
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Titre</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 hidden sm:table-cell">Date</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Statut</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 hidden md:table-cell">Mis en avant</th>
              <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-400">
                  Aucun article — cliquez sur "Nouvel article" pour commencer.
                </td>
              </tr>
            ) : sorted.map(article => (
              <tr key={article.id} className="hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-900 max-w-xs truncate">
                  {article.title || <span className="text-gray-400 italic">Sans titre</span>}
                </td>
                <td className="py-3 px-4 text-gray-400 text-xs hidden sm:table-cell">
                  {formatDate(article.published_at)}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    article.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {article.published ? 'Publié' : 'Brouillon'}
                  </span>
                </td>
                <td className="py-3 px-4 hidden md:table-cell">
                  <button
                    onClick={() => toggleFeatured(article)}
                    title={article.featured ? 'Retirer de la une' : 'Mettre en avant'}
                    className={`p-1.5 rounded-lg transition-colors ${
                      article.featured
                        ? 'text-coral-500 bg-coral-50 hover:bg-coral-100'
                        : 'text-gray-300 hover:text-coral-400 hover:bg-coral-50'
                    }`}
                  >
                    <Star size={16} className={article.featured ? 'fill-coral-500' : ''} />
                  </button>
                </td>
                <td className="py-3 px-4">
                  <div className="flex justify-end gap-1">
                    <Link
                      to={`/admin/blog/edit/${article.id}`}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                      title="Modifier"
                    >
                      <Edit2 size={15} />
                    </Link>
                    <button
                      onClick={() => togglePublished(article)}
                      title={article.published ? 'Dépublier' : 'Publier'}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                    >
                      {article.published ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    {confirm === article.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Confirmer
                        </button>
                        <button
                          onClick={() => setConfirm(null)}
                          className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                        >
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirm(article.id)}
                        title="Supprimer"
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-500"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                    {article.published && article.slug && (
                      <a
                        href={`/actualites/${article.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Voir l'article"
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-500"
                      >
                        <Eye size={15} />
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
