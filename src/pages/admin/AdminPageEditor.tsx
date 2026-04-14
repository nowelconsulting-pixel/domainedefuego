import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Trash2, Plus, X } from 'lucide-react';
import RichTextEditor from '../../components/admin/RichTextEditor';
import { BlockEditor, BLOCK_TYPES, newBlock } from '../../components/admin/AdminBlockEditors';
import { useAdminPages } from '../../hooks/useAdminData';
import { savePageContent } from '../../hooks/usePageContent';
import pageDefaults from '../../data/pageDefaults';
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

// ─── Content schema ───────────────────────────────────────────────────────────

type ScalarField = { type: 'text' | 'textarea'; key: string; label: string };
type ArrayField  = { type: 'array'; key: string; label: string; itemFields: Array<{ key: string; label: string; multiline?: boolean }> };
type FieldDef    = ScalarField | ArrayField;

const PAGE_CONTENT_SCHEMA: Record<string, FieldDef[]> = {
  accueil: [
    { type: 'text',    key: 'hero_title',    label: 'Titre principal' },
    { type: 'text',    key: 'hero_subtitle', label: 'Sous-titre' },
    { type: 'array',   key: 'etapes',        label: 'Étapes "Comment ça marche"',
      itemFields: [{ key: 'num', label: 'N°' }, { key: 'titre', label: 'Titre' }, { key: 'desc', label: 'Description', multiline: true }] },
    { type: 'array',   key: 'temoignages',   label: 'Témoignages',
      itemFields: [{ key: 'auteur', label: 'Auteur' }, { key: 'lieu', label: 'Lieu' }, { key: 'texte', label: 'Témoignage', multiline: true }] },
    { type: 'text',    key: 'cta_title',     label: "Titre de l'appel à l'action" },
    { type: 'text',    key: 'cta_subtitle',  label: "Sous-titre de l'appel à l'action" },
  ],
  presentation: [
    { type: 'text',     key: 'hero_title',    label: 'Titre principal' },
    { type: 'text',     key: 'hero_subtitle', label: 'Sous-titre' },
    { type: 'text',     key: 'mission_title', label: 'Titre de la mission' },
    { type: 'textarea', key: 'mission_text',  label: 'Texte de la mission (séparez les §§ par une ligne vide)' },
    { type: 'array',    key: 'valeurs',       label: 'Nos valeurs',
      itemFields: [{ key: 'titre', label: 'Valeur' }, { key: 'description', label: 'Description', multiline: true }] },
    { type: 'array',    key: 'equipe',        label: "L'équipe",
      itemFields: [{ key: 'nom', label: 'Nom' }, { key: 'role', label: 'Rôle' }, { key: 'photo', label: 'Photo (URL)' }] },
  ],
  animaux: [
    { type: 'text', key: 'hero_title',    label: 'Titre principal' },
    { type: 'text', key: 'hero_subtitle', label: 'Sous-titre' },
  ],
  adopter: [
    { type: 'text',  key: 'hero_title',    label: 'Titre principal' },
    { type: 'text',  key: 'hero_subtitle', label: 'Sous-titre' },
    { type: 'array', key: 'process_steps', label: 'Étapes du processus',
      itemFields: [{ key: 'titre', label: 'Titre' }, { key: 'desc', label: 'Description', multiline: true }] },
    { type: 'array', key: 'conditions',    label: "Conditions d'adoption",
      itemFields: [{ key: 'text', label: 'Condition' }] },
  ],
  'famille-accueil': [
    { type: 'text',  key: 'hero_title',    label: 'Titre principal' },
    { type: 'text',  key: 'hero_subtitle', label: 'Sous-titre' },
    { type: 'array', key: 'avantages',     label: "Avantages de l'accueil familial",
      itemFields: [{ key: 'titre', label: 'Titre' }, { key: 'desc', label: 'Description', multiline: true }] },
    { type: 'array', key: 'faq',           label: 'Questions fréquentes',
      itemFields: [{ key: 'q', label: 'Question' }, { key: 'r', label: 'Réponse', multiline: true }] },
  ],
  'faire-un-don': [
    { type: 'text',     key: 'hero_title',    label: 'Titre principal' },
    { type: 'text',     key: 'hero_subtitle', label: 'Sous-titre' },
    { type: 'text',     key: 'intro_title',   label: "Titre de la section d'introduction" },
    { type: 'textarea', key: 'intro_text',    label: "Texte d'introduction (séparez les §§ par une ligne vide)" },
    { type: 'array',    key: 'utilisations',  label: 'À quoi sert votre don ?',
      itemFields: [{ key: 'titre', label: 'Titre' }, { key: 'description', label: 'Description', multiline: true }, { key: 'icone', label: 'Icône (Heart / Home / Truck)' }] },
  ],
  contact: [
    { type: 'text', key: 'hero_title',    label: 'Titre principal' },
    { type: 'text', key: 'hero_subtitle', label: 'Sous-titre' },
  ],
  'mentions-legales': [
    { type: 'text', key: 'hero_title',    label: 'Titre principal' },
    { type: 'text', key: 'hero_subtitle', label: 'Sous-titre' },
  ],
};

// ─── Dynamic content editor ───────────────────────────────────────────────────

interface ContentEditorProps {
  schema: FieldDef[];
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

function ContentEditor({ schema, data, onChange }: ContentEditorProps) {
  const set = (key: string, value: unknown) => onChange({ ...data, [key]: value });

  const setArrayItem = (arrayKey: string, idx: number, itemKey: string, value: string) => {
    const arr = [...((data[arrayKey] as Record<string, unknown>[]) || [])];
    arr[idx] = { ...arr[idx], [itemKey]: value };
    set(arrayKey, arr);
  };

  const addArrayItem = (field: ArrayField) => {
    const arr = [...((data[field.key] as Record<string, unknown>[]) || [])];
    arr.push(Object.fromEntries(field.itemFields.map(f => [f.key, ''])));
    set(field.key, arr);
  };

  const removeArrayItem = (arrayKey: string, idx: number) => {
    const arr = ((data[arrayKey] as Record<string, unknown>[]) || []).filter((_, i) => i !== idx);
    set(arrayKey, arr);
  };

  return (
    <div className="space-y-6">
      {schema.map(field => {
        if (field.type === 'text') {
          return (
            <div key={field.key}>
              <label className="form-label">{field.label}</label>
              <input
                className="form-input"
                value={(data[field.key] as string) || ''}
                onChange={e => set(field.key, e.target.value)}
              />
            </div>
          );
        }

        if (field.type === 'textarea') {
          return (
            <div key={field.key}>
              <label className="form-label">{field.label}</label>
              <textarea
                className="form-input"
                rows={5}
                value={(data[field.key] as string) || ''}
                onChange={e => set(field.key, e.target.value)}
              />
            </div>
          );
        }

        // array — TypeScript narrowed to ArrayField here
        if (field.type !== 'array') return null;
        const af = field;
        const items = (data[af.key] as Record<string, unknown>[]) || [];
        return (
          <div key={af.key}>
            <div className="flex items-center justify-between mb-2">
              <label className="form-label mb-0">{af.label}</label>
              <button
                type="button"
                onClick={() => addArrayItem(af)}
                className="flex items-center gap-1 text-xs px-2 py-1 bg-coral-50 text-coral-600 rounded-lg hover:bg-coral-100"
              >
                <Plus size={12} /> Ajouter
              </button>
            </div>
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="border border-gray-200 rounded-xl p-4 bg-gray-50 relative">
                  <button
                    type="button"
                    onClick={() => removeArrayItem(af.key, idx)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                  <div className="space-y-2 pr-6">
                    {af.itemFields.map(subField => (
                      <div key={subField.key}>
                        <label className="text-xs text-gray-500 mb-0.5 block">{subField.label}</label>
                        {subField.multiline ? (
                          <textarea
                            className="form-input text-sm"
                            rows={2}
                            value={(item[subField.key] as string) || ''}
                            onChange={e => setArrayItem(af.key, idx, subField.key, e.target.value)}
                          />
                        ) : (
                          <input
                            className="form-input text-sm"
                            value={(item[subField.key] as string) || ''}
                            onChange={e => setArrayItem(af.key, idx, subField.key, e.target.value)}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-3 border-2 border-dashed border-gray-200 rounded-xl">
                  Aucun élément — cliquez sur Ajouter
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main editor ──────────────────────────────────────────────────────────────

export default function AdminPageEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { pages, savePage } = useAdminPages();

  const [page, setPage] = useState<AdminPage | null>(null);
  const [slugEdited, setSlugEdited] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showBlockPicker, setShowBlockPicker] = useState(false);
  const [contentData, setContentData] = useState<Record<string, unknown>>({});
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
        show_in_nav: ov.show_in_nav ?? sysMeta.show_in_nav,
        show_in_footer: ov.show_in_footer ?? sysMeta.show_in_footer,
        updatedAt: ov.updatedAt ?? '',
        createdAt: '',
      });
      // Load full page content from localStorage, fall back to defaults
      try {
        const pcRaw = localStorage.getItem(`page_content_${sysMeta.slug}`);
        setContentData(pcRaw ? JSON.parse(pcRaw) : (pageDefaults[sysMeta.slug] ?? {}));
      } catch {
        setContentData(pageDefaults[sysMeta.slug] ?? {});
      }
      initializedRef.current = true;
      return;
    }

    if (pages.length === 0) return;

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
      saveSystemPageData({ ...loadSystemPageData(), [page.id]: updated });
      savePageContent(page.slug, contentData);
      setPage(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      savePage(updated);
      setSaved(true);
      setTimeout(() => { setSaved(false); navigate('/admin/pages'); }, 1000);
    }
  };

  const systemOrders: Record<string, number> = (() => {
    try { return JSON.parse(localStorage.getItem('system_page_orders') || '{}'); }
    catch { return {}; }
  })();
  const previewItems = [
    ...SYSTEM_PAGES.map(sp => ({ id: sp.id, title: sp.title, order: systemOrders[sp.id] ?? sp.menu_order, isCurrent: false })),
    ...pages.filter(p => !p.system && p.id !== page.id).map(p => ({ id: p.id, title: p.title, order: p.menu_order, isCurrent: false })),
    { id: page.id, title: page.title || 'Cette page', order: page.menu_order, isCurrent: true },
  ].sort((a, b) => a.order - b.order);

  const parentOptions = [
    ...SYSTEM_PAGES.map(sp => ({ id: sp.id, title: sp.title })),
    ...pages.filter(p => !p.system && p.id !== page.id && !p.parent_id).map(p => ({ id: p.id, title: p.title })),
  ];

  const contentSchema = page.system ? (PAGE_CONTENT_SCHEMA[page.slug] ?? []) : [];

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
            <p className="text-xs text-gray-400 mt-1">Nom affiché dans la navigation</p>
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

          <div className="flex flex-wrap gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input type="checkbox" className="w-4 h-4 accent-coral-500"
                checked={page.show_in_nav ?? true}
                onChange={e => set('show_in_nav', e.target.checked)} />
              Afficher dans la navigation
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input type="checkbox" className="w-4 h-4 accent-coral-500"
                checked={page.show_in_footer ?? false}
                onChange={e => set('show_in_footer', e.target.checked)} />
              Afficher dans le footer
            </label>
          </div>
        </div>

        {/* System page content fields */}
        {page.system && contentSchema.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-1">Contenu de la page</h2>
            <p className="text-xs text-gray-400 mb-5">Ces champs modifient directement ce que les visiteurs voient.</p>
            <ContentEditor
              schema={contentSchema}
              data={contentData}
              onChange={setContentData}
            />
          </div>
        )}

        {/* Main rich-text content */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Contenu principal (HTML libre)</h2>
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
                    <button key={t.type} onClick={() => addBlock(t.type)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-left">
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
                <BlockEditor key={block.id} block={block}
                  onChange={b => updateBlock(i, b)}
                  onDelete={() => deleteBlock(i)}
                  onMove={dir => moveBlock(i, dir)}
                  isFirst={i === 0} isLast={i === page.blocks.length - 1} />
              ))
            )}
          </div>
        </div>

        {/* Menu order preview */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-3">Aperçu de la position dans le menu</h2>
          <div className="flex flex-wrap gap-2">
            {previewItems.map((item, i) => (
              <div key={item.id}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm ${item.isCurrent ? 'bg-coral-500 text-white font-semibold' : 'bg-gray-100 text-gray-600'}`}>
                <span className={`text-xs ${item.isCurrent ? 'text-coral-200' : 'text-gray-400'}`}>{i + 1}.</span>
                {item.title}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => handleSave('draft')}
            className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
            <Save size={16} />Enregistrer brouillon
          </button>
          <button onClick={() => handleSave('published')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors ${saved ? 'bg-green-500' : 'bg-coral-500 hover:bg-coral-600'}`}>
            <Eye size={16} />{saved ? 'Modifications enregistrées ✓' : (page.system ? 'Sauvegarder' : 'Publier')}
          </button>
          {!page.system && (
            <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 border border-gray-200">
              <Eye size={16} />Prévisualiser
            </a>
          )}
          {!page.system && (
            <button onClick={() => navigate('/admin/pages')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 border border-red-200 ml-auto">
              <Trash2 size={16} />Annuler
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
