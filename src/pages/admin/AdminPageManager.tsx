import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, EyeOff, ChevronUp, ChevronDown, X, Save } from 'lucide-react';
import { useAdminPages } from '../../hooks/useAdminData';
import type { AdminPage } from '../../types/admin';
import { SYSTEM_PAGES } from '../../types/admin';

function loadSystemOrders(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem('system_page_orders') || '{}'); }
  catch { return {}; }
}

function saveSystemOrders(orders: Record<string, number>): void {
  localStorage.setItem('system_page_orders', JSON.stringify(orders));
}

function loadSystemPageData(): Record<string, Partial<AdminPage>> {
  try { return JSON.parse(localStorage.getItem('system_page_data') || '{}'); }
  catch { return {}; }
}

function buildHierarchy(allPages: AdminPage[]): AdminPage[] {
  const topLevel = allPages.filter(p => !p.parent_id).sort((a, b) => a.menu_order - b.menu_order);
  const result: AdminPage[] = [];
  for (const parent of topLevel) {
    result.push(parent);
    allPages
      .filter(p => p.parent_id === parent.id)
      .sort((a, b) => a.menu_order - b.menu_order)
      .forEach(child => result.push(child));
  }
  return result;
}

export default function AdminPageManager() {
  const { pages, save, deletePage } = useAdminPages();
  const [confirm, setConfirm] = useState<string | null>(null);
  const [systemOrders, setSystemOrders] = useState<Record<string, number>>(loadSystemOrders);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editingOrderValue, setEditingOrderValue] = useState(0);

  const systemData = loadSystemPageData();

  const getSystemOrder = (id: string, defaultOrder: number) => systemOrders[id] ?? defaultOrder;

  const allPages: AdminPage[] = buildHierarchy([
    ...SYSTEM_PAGES.map(sp => ({
      ...sp,
      // merge any data overrides (title, content) from localStorage
      ...(systemData[sp.id] ?? {}),
      menu_order: getSystemOrder(sp.id, systemData[sp.id]?.menu_order ?? sp.menu_order),
      content: systemData[sp.id]?.content ?? '',
      blocks: systemData[sp.id]?.blocks ?? [],
      seo_description: systemData[sp.id]?.seo_description ?? '',
      menu_icon: '',
      parent_id: null,
      updatedAt: systemData[sp.id]?.updatedAt ?? '',
      createdAt: '',
    } as AdminPage)),
    ...pages.filter(p => !p.system),
  ]);

  const toggleStatus = (page: AdminPage) => {
    if (page.system) return;
    const updated = pages.map(p =>
      p.id === page.id
        ? { ...p, status: p.status === 'published' ? 'draft' : 'published' as AdminPage['status'], updatedAt: new Date().toISOString() }
        : p
    );
    save(updated);
  };

  const moveOrder = (page: AdminPage, dir: -1 | 1) => {
    if (page.system) {
      const current = getSystemOrder(page.id, page.menu_order);
      const updated = { ...systemOrders, [page.id]: current + dir * 5 };
      setSystemOrders(updated);
      saveSystemOrders(updated);
      return;
    }
    const updated = pages.map(p =>
      p.id === page.id ? { ...p, menu_order: p.menu_order + dir * 5, updatedAt: new Date().toISOString() } : p
    );
    save(updated);
  };

  const openOrderEdit = (page: AdminPage) => {
    setEditingOrderId(page.id);
    setEditingOrderValue(getSystemOrder(page.id, page.menu_order));
  };

  const saveOrderEdit = (page: AdminPage) => {
    if (page.system) {
      const updated = { ...systemOrders, [page.id]: editingOrderValue };
      setSystemOrders(updated);
      saveSystemOrders(updated);
    } else {
      const updated = pages.map(p =>
        p.id === page.id ? { ...p, menu_order: editingOrderValue, updatedAt: new Date().toISOString() } : p
      );
      save(updated);
    }
    setEditingOrderId(null);
  };

  const handleDelete = (id: string) => {
    deletePage(id);
    setConfirm(null);
  };

  const newPage = (): AdminPage => ({
    id: `page-${Date.now()}`,
    title: 'Nouvelle page',
    slug: `page-${Date.now()}`,
    content: '',
    blocks: [],
    seo_description: '',
    menu_icon: '',
    menu_order: 100,
    parent_id: null,
    status: 'draft',
    system: false,
    show_in_nav: true,
    show_in_footer: false,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
        <Link
          to={`/admin/pages/edit/${newPage().id}`}
          state={{ newPage: newPage() }}
          className="btn-primary text-sm"
        >
          <Plus size={16} />Nouvelle page
        </Link>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Utilisez les flèches ou le numéro d'ordre pour réorganiser les pages dans le menu. Les pages "Système" sont éditables (titre, contenu, SEO) mais non supprimables.
      </p>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Titre</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 hidden sm:table-cell">Slug</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Statut</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 hidden md:table-cell">Type</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Position</th>
              <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {allPages.map(page => {
              const isChild = !!page.parent_id;
              return (
                <tr key={page.id} className={`hover:bg-gray-50 ${isChild ? 'bg-gray-50/50' : ''}`}>
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {isChild && <span className="text-gray-400 mr-2 select-none">↳</span>}
                    {page.title}
                  </td>
                  <td className="py-3 px-4 text-gray-400 font-mono text-xs hidden sm:table-cell">
                    /{page.slug}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      page.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {page.status === 'published' ? 'Publié' : 'Brouillon'}
                    </span>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    {page.system ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">Système</span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Personnalisée</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editingOrderId === page.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          className="form-input py-1 w-16 text-sm"
                          value={editingOrderValue}
                          onChange={e => setEditingOrderValue(parseInt(e.target.value) || 0)}
                          onKeyDown={e => { if (e.key === 'Enter') saveOrderEdit(page); if (e.key === 'Escape') setEditingOrderId(null); }}
                          autoFocus
                        />
                        <button onClick={() => saveOrderEdit(page)} className="p-1 hover:bg-green-100 text-green-600 rounded">
                          <Save size={13} />
                        </button>
                        <button onClick={() => setEditingOrderId(null)} className="p-1 hover:bg-gray-100 text-gray-400 rounded">
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openOrderEdit(page)}
                          className="text-gray-500 w-8 text-sm hover:text-gray-800 hover:underline"
                          title="Cliquer pour modifier"
                        >
                          {getSystemOrder(page.id, page.menu_order)}
                        </button>
                        <button onClick={() => moveOrder(page, -1)} className="p-1 hover:bg-gray-100 rounded text-gray-400" title="Remonter">
                          <ChevronUp size={14} />
                        </button>
                        <button onClick={() => moveOrder(page, 1)} className="p-1 hover:bg-gray-100 rounded text-gray-400" title="Descendre">
                          <ChevronDown size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-1">
                      {/* Edit — all pages */}
                      <Link
                        to={`/admin/pages/edit/${page.id}`}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                        title="Modifier"
                      >
                        <Edit2 size={15} />
                      </Link>
                      {/* Toggle status — custom only */}
                      {!page.system && (
                        <>
                          <button
                            onClick={() => toggleStatus(page)}
                            title={page.status === 'published' ? 'Dépublier' : 'Publier'}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                          >
                            {page.status === 'published' ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                          {confirm === page.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleDelete(page.id)} className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">Confirmer</button>
                              <button onClick={() => setConfirm(null)} className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Annuler</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirm(page.id)}
                              title="Supprimer"
                              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-500"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </>
                      )}
                      {/* View link */}
                      <a
                        href={page.slug ? `/${page.slug}` : '/'}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Voir la page"
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-500"
                      >
                        <Eye size={15} />
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
