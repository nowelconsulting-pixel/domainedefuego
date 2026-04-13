import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Trash2, Plus } from 'lucide-react';
import RichTextEditor from '../../components/admin/RichTextEditor';
import { BlockEditor, BLOCK_TYPES, newBlock } from '../../components/admin/AdminBlockEditors';
import { useAdminPages } from '../../hooks/useAdminData';
import type { AdminPage, BlockType } from '../../types/admin';
import { SYSTEM_PAGES } from '../../types/admin';

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function loadSystemPageData(): Record<string, Partial<AdminPage>> {
  try { return JSON.parse(localStorage.getItem('system_page_data') || '{}'); }
  catch { return {}; }
}
function saveSystemPageData(data: Record<string, Partial<AdminPage>>): void {
  localStorage.setItem('system_page_data', JSON.stringify(data));
}

export default function AdminPageEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { pages, savePage } = useAdminPages();

  const [page, setPage] = useState<AdminPage | null>(null);
  const [slugEdited, setSlugEdited] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showBlockPicker, setShowBlockPicker] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;

    const stateNew = (location.state as { newPage?: AdminPage })?.newPage;
    if (stateNew) {
      setPage(stateNew);
      initializedRef.current = true;
      return;
    }

    // System page?
    const sysMeta = SYSTEM_PAGES.find(sp => sp.id === id);
    if (sysMeta) {
      const stored = loadSystemPageData();
      const ov = stored[sysMeta.id] ?? {};
      setPage({
        id: sysMeta.id,
        title: ov.title ?? sysMeta.title,
        slug: sysMeta.slug,
        content: ov.content ?? '',
        blocks: ov.blocks ?? [],
        seo_description: ov.seo_description ?? '',
        menu_icon: '',
        menu_order: ov.menu_order ?? sysMeta.menu_order,
        parent_id: null,
        status: sysMeta.status,
        system: true,
        updatedAt: ov.updatedAt ?? '',
        createdAt: '',
      });
      initializedRef.current = true;
      return;
    }

    if (pages.length === 0) return; // wait for localStorage load

    const found = pages.find(p => p.id === id);
    if (found) {
      setPage(found);
      initializedRef.current = true;
      return;
    }

    // Brand new custom page
    setPage({
      id: id ?? `page-${Date.now()}`,
      title: '', slug: '', content: '', blocks: [],
      seo_description: '', menu_icon: '', menu_order: 100,
      parent_id: null, status: 'draft', system: false,
      show_in_nav: true, show_in_footer: false,
      updatedAt: new Date().toISOString(), createdAt: new Date().toISOString(),
    });
    initializedRef.current = true;
  }, [id, pages, location.state]);

  if (!page) return null;

  const set = <K extends keyof AdminPage>(k: K, v: AdminPage[K]) =>
    setPage(prev => prev ? { ...prev, [k]: v } : null);

  const handleTitleChange = (title: string) => {
    setPage(prev => {
      if (!prev) return null;
      return { ...prev, title, slug: (!slugEdited && !prev.system) ? slugify(title) : prev.slug };
    });
  };

  const addBlock = (type: BlockType) => {
    setPage(prev => prev ? { ...prev, blocks: [...prev.blocks, newBlock(type)] } : null);
    setShowBlockPicker(false);
  };

  const updateBlock = (i: number, b: import('../../types/admin').Block) =>
    setPage(prev => { if (!prev) return null; const blocks = [...prev.blocks]; blocks[i] = b; return { ...prev, blocks }; });

  const deleteBlock = (i: number) =>
    setPage(prev => prev ? { ...prev, blocks: prev.blocks.filter((_, idx) => idx !== i) } : null);

  const moveBlock = (i: number, dir: -1 | 1) => {
    setPage(prev => {
      if (!prev) return null;
      const blocks = [...prev.blocks];
      const j = i + dir;
      if (j < 0 || j >= blocks.length) return prev;
      [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
      return { ...prev, blocks };
    });
  };

  const handleSave = (status?: AdminPage['status']) => {
    if (!page.title.trim()) { alert('Le titre est obligatoire.'); return; }
    const updated: AdminPage = { ...page, status: status ?? page.status, updatedAt: new Date().toISOString() };
    if (page.system) {
      const stored = loadSystemPageData();
      saveSystemPageData({ ...stored, [page.id]: updated });
      setPage(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      savePage(updated);
      setSaved(true);
      setTimeout(() => { setSaved(false); navigate('/admin/pages'); }, 1000);
    }
  };

  // Live menu order preview
  const systemOrders: Record<string, number> = (() => {
    try { return JSON.parse(localStorage.getItem('system_page_orders') || '{}'); }
    catch { return {}; }
  })();
  const previewItems = [
    ...SYSTEM_PAGES.map(sp => ({
      id: sp.id, title: sp.title, order: systemOrders[sp.id] ?? sp.menu_order, isCurrent: false,
    })),
    ...pages.filter(p => !p.system && p.id !== page.id).map(p => ({
      id: p.id, title: p.title, order: p.menu_order, isCurrent: false,
    })),
    { id: page.id, title: page.title || 'Cette page', order: page.menu_order, isCurrent: true },
  ].sort((a, b) => a.order - b.order);

  // Parent page options (only non-system top-level + system pages, excluding self)
  const parentOptions = [
    ...SYSTEM_PAGES.map(sp => ({ id: sp.id, title: sp.title })),
    ...pages.filter(p => !p.system && p.id !== page.id && !p.parent_id).map(p => ({ id: p.id, title: p.title })),
  ];

  return (
    <div className="p-8 max-w-4xl">
      <button onClick={() => navigate('/admin/pages')} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
        <ArrowLeft size={18} /> Retour aux pages
      </button>

      <div className="space-y-6">
        {/* Title + Slug + Parent */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div>
            <label className="form-label text-base font-semibold">Titre de la page *</label>
            <input
              className="form-input text-lg font-medium"
              value={page.title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder="Ma nouvelle page"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="form-label">Slug (URL)</label>
              {page.system ? (
                <div className="flex items-center gap-1">
                  <span className="text-gray-400 text-sm">/</span>
                  <span className="form-input bg-gray-50 text-gray-400 flex-1 select-none">{page.slug || '(racine)'}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <span className="text-gray-400 text-sm">/</span>
                  <input
                    className="form-input flex-1"
                    value={page.slug}
                    onChange={e => { setSlugEdited(true); set('slug', slugify(e.target.value)); }}
                    placeholder="ma-nouvelle-page"
                  />
                </div>
              )}
            </div>
            <div className="w-40">
              <label className="form-label">Position dans le menu</label>
              <input type="number" className="form-input" value={page.menu_order}
                onChange={e => set('menu_order', parseInt(e.target.value) || 100)} />
              <p className="text-xs text-gray-400 mt-1">Petit = à gauche</p>
            </div>
          </div>

          {/* Parent page dropdown — custom pages only */}
          {!page.system && (
            <div>
              <label className="form-label">Page parente (sous-menu)</label>
              <select
                className="form-input"
                value={page.parent_id ?? ''}
                onChange={e => set('parent_id', (e.target.value || null) as AdminPage['parent_id'])}
              >
                <option value="">— Aucune (page de premier niveau) —</option>
                {parentOptions.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="form-label">Description SEO (meta description)</label>
            <textarea className="form-input" rows={2} value={page.seo_description}
              onChange={e => set('seo_description', e.target.value)}
              placeholder="Courte description pour les moteurs de recherche (150 caractères max)" />
          </div>

          {/* Visibility toggles */}
          <div className="flex flex-wrap gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input
                type="checkbox"
                className="w-4 h-4 accent-coral-500"
                checked={page.show_in_nav ?? true}
                onChange={e => set('show_in_nav', e.target.checked)}
              />
              Afficher dans la navigation
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input
                type="checkbox"
                className="w-4 h-4 accent-coral-500"
                checked={page.show_in_footer ?? false}
                onChange={e => set('show_in_footer', e.target.checked)}
              />
              Afficher dans le footer
            </label>
          </div>
        </div>

        {/* Main rich-text content */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Contenu principal</h2>
          <RichTextEditor content={page.content} onChange={v => set('content', v)} />
        </div>

        {/* Content blocks */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900">Blocs de contenu supplémentaires</h2>
            <div className="relative">
              <button
                onClick={() => setShowBlockPicker(p => !p)}
                className="flex items-center gap-2 px-3 py-2 bg-coral-50 text-coral-600 rounded-lg text-sm font-medium hover:bg-coral-100"
              >
                <Plus size={16} />Ajouter un bloc
              </button>
              {showBlockPicker && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 p-2 min-w-[220px] max-h-80 overflow-y-auto">
                  {BLOCK_TYPES.map(t => (
                    <button
                      key={t.type}
                      onClick={() => addBlock(t.type)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-left"
                    >
                      <span>{t.emoji}</span>{t.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {page.blocks.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">
                Aucun bloc — cliquez sur "Ajouter un bloc" pour enrichir votre page
              </p>
            ) : (
              page.blocks.map((block, i) => (
                <BlockEditor
                  key={block.id}
                  block={block}
                  onChange={b => updateBlock(i, b)}
                  onDelete={() => deleteBlock(i)}
                  onMove={dir => moveBlock(i, dir)}
                  isFirst={i === 0}
                  isLast={i === page.blocks.length - 1}
                />
              ))
            )}
          </div>
        </div>

        {/* Menu order preview */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-3">Aperçu de la position dans le menu de navigation</h2>
          <p className="text-xs text-gray-400 mb-3">Ordre actuel de toutes les pages (la page en cours est surlignée)</p>
          <div className="flex flex-wrap gap-2">
            {previewItems.map((item, i) => (
              <div
                key={item.id}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm ${
                  item.isCurrent
                    ? 'bg-coral-500 text-white font-semibold'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <span className={`text-xs ${item.isCurrent ? 'text-coral-200' : 'text-gray-400'}`}>{i + 1}.</span>
                {item.title}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => handleSave('draft')}
            className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            <Save size={16} />Enregistrer brouillon
          </button>
          <button
            onClick={() => handleSave('published')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors ${
              saved ? 'bg-green-500' : 'bg-coral-500 hover:bg-coral-600'
            }`}
          >
            <Eye size={16} />{saved ? 'Sauvegardé !' : (page.system ? 'Sauvegarder' : 'Publier')}
          </button>
          {!page.system && (
            <a
              href={`/${page.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 border border-gray-200"
            >
              <Eye size={16} />Prévisualiser
            </a>
          )}
          {!page.system && (
            <button
              onClick={() => navigate('/admin/pages')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 border border-red-200 ml-auto"
            >
              <Trash2 size={16} />Annuler
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
