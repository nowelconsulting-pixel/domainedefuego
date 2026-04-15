import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import RichTextEditor from '../../components/admin/RichTextEditor';
import { useArticles, saveArticle } from '../../hooks/useArticles';
import type { Article } from '../../hooks/useArticles';

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none ${value ? 'bg-green-500' : 'bg-gray-300'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${value ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
      <span className={`text-sm font-medium select-none ${value ? 'text-green-600' : 'text-gray-400'}`}>
        {label} — {value ? 'Oui' : 'Non'}
      </span>
    </div>
  );
}

const BLANK: Article = {
  id: '', title: '', slug: '', excerpt: '', content: '',
  cover_url: '', author: '', published: false,
  published_at: '', featured: false,
};

export default function AdminArticleEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { articles } = useArticles();
  const [article, setArticle] = useState<Article | null>(null);
  const [slugEdited, setSlugEdited] = useState(false);
  const [saved, setSaved] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    const isNew = !id || id === 'new' || id.startsWith('article-');
    if (isNew) {
      const newId = id && id !== 'new' ? id : `article-${Date.now()}`;
      setArticle({ ...BLANK, id: newId });
      initializedRef.current = true;
      return;
    }
    const found = articles.find(a => a.id === id);
    if (found) {
      setArticle(found);
      setSlugEdited(true);
      initializedRef.current = true;
    }
  }, [id, articles]);

  if (!article) return null;

  const set = <K extends keyof Article>(k: K, v: Article[K]) =>
    setArticle(prev => prev ? { ...prev, [k]: v } : null);

  const handleTitleChange = (title: string) => {
    setArticle(prev => {
      if (!prev) return null;
      return { ...prev, title, slug: slugEdited ? prev.slug : slugify(title) };
    });
  };

  const handleSave = (publish?: boolean) => {
    if (!article.title.trim()) { alert('Le titre est obligatoire.'); return; }
    const updated: Article = {
      ...article,
      published: publish !== undefined ? publish : article.published,
      published_at: (publish || article.published) && !article.published_at
        ? new Date().toISOString().slice(0, 10)
        : article.published_at,
    };
    saveArticle(updated);
    setSaved(true);
    setTimeout(() => { setSaved(false); navigate('/admin/blog'); }, 900);
  };

  return (
    <div className="p-8 max-w-4xl">
      <button onClick={() => navigate('/admin/blog')} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
        <ArrowLeft size={18} /> Retour au blog
      </button>

      <div className="space-y-6">
        {/* Title + slug */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div>
            <label className="form-label text-base font-semibold">Titre de l'article *</label>
            <input
              className="form-input text-lg font-medium"
              value={article.title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder="Mon article"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="form-label">Slug (URL)</label>
              <div className="flex items-center gap-1">
                <span className="text-gray-400 text-sm">/blog/</span>
                <input
                  className="form-input flex-1"
                  value={article.slug}
                  onChange={e => { setSlugEdited(true); set('slug', slugify(e.target.value)); }}
                  placeholder="mon-article"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="form-label">Auteur</label>
              <input
                className="form-input"
                value={article.author}
                onChange={e => set('author', e.target.value)}
                placeholder="Équipe Domaine de Fuego"
              />
            </div>
          </div>
          <div>
            <label className="form-label">Date de publication</label>
            <input
              type="date"
              className="form-input w-48"
              value={article.published_at}
              onChange={e => set('published_at', e.target.value)}
            />
          </div>
        </div>

        {/* Cover image */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
          <h2 className="font-semibold text-gray-900">Image de couverture</h2>
          <div>
            <label className="form-label">URL de l'image</label>
            <input
              className="form-input"
              value={article.cover_url}
              onChange={e => set('cover_url', e.target.value)}
              placeholder="https://..."
            />
          </div>
          {article.cover_url && (
            <img src={article.cover_url} alt="Aperçu" className="w-full max-h-60 object-cover rounded-xl" />
          )}
        </div>

        {/* Excerpt */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <label className="form-label font-semibold">Extrait (résumé)</label>
          <textarea
            className="form-input"
            rows={3}
            maxLength={300}
            value={article.excerpt}
            onChange={e => set('excerpt', e.target.value)}
            placeholder="Courte description affichée dans la liste des articles (150 caractères max pour un bel aperçu)"
          />
          <p className="text-xs text-gray-400 mt-1">{article.excerpt.length}/300 caractères</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Contenu de l'article</h2>
          <RichTextEditor
            content={article.content}
            onChange={v => set('content', v)}
          />
        </div>

        {/* Options */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Options de publication</h2>
          <Toggle
            value={article.published}
            onChange={v => set('published', v)}
            label="Publié"
          />
          <Toggle
            value={article.featured}
            onChange={v => set('featured', v)}
            label="Mis en avant sur la page d'accueil"
          />
          <p className="text-xs text-gray-400">
            Un seul article est affiché à la une. Si plusieurs sont mis en avant, le plus récent est prioritaire.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => handleSave(false)}
            className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            <Save size={16} /> Enregistrer brouillon
          </button>
          <button
            onClick={() => handleSave(true)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors ${saved ? 'bg-green-500' : 'bg-coral-500 hover:bg-coral-600'}`}
          >
            <Eye size={16} /> {saved ? 'Enregistré ✓' : 'Publier'}
          </button>
          {article.published && article.slug && (
            <a
              href={`/blog/${article.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 border border-gray-200"
            >
              <Eye size={16} /> Prévisualiser
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
