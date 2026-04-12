import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';
import { useAdminPages } from '../../hooks/useAdminData';
import type { AdminPage } from '../../types/admin';
import { SYSTEM_PAGES } from '../../types/admin';

export default function AdminPageManager() {
  const { pages, save, deletePage } = useAdminPages();
  const [confirm, setConfirm] = useState<string | null>(null);

  // Merge system pages (display-only) with custom pages from localStorage
  const allPages = [
    ...SYSTEM_PAGES.map(sp => ({
      ...sp,
      content: '', blocks: [], seo_description: '', menu_icon: '',
      parent_id: null, updatedAt: '', createdAt: '',
    } as AdminPage)),
    ...pages.filter(p => !p.system),
  ].sort((a, b) => a.menu_order - b.menu_order);

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
    if (page.system) return;
    const updated = pages.map(p =>
      p.id === page.id ? { ...p, menu_order: p.menu_order + dir * 5, updatedAt: new Date().toISOString() } : p
    );
    save(updated);
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

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Titre</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Slug</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Statut</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 hidden md:table-cell">Type</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 hidden lg:table-cell">Ordre</th>
              <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {allPages.map(page => (
              <tr key={page.id} className="hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-900">{page.title}</td>
                <td className="py-3 px-4 text-gray-400 font-mono text-xs">/{page.slug}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    page.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {page.status === 'published' ? 'Publié' : 'Brouillon'}
                  </span>
                </td>
                <td className="py-3 px-4 hidden md:table-cell">
                  {page.system ? (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                      Système
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      Personnalisée
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 hidden lg:table-cell">
                  {!page.system && (
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500 w-8">{page.menu_order}</span>
                      <button onClick={() => moveOrder(page, -1)} className="p-1 hover:bg-gray-100 rounded text-gray-400">
                        <ChevronUp size={14} />
                      </button>
                      <button onClick={() => moveOrder(page, 1)} className="p-1 hover:bg-gray-100 rounded text-gray-400">
                        <ChevronDown size={14} />
                      </button>
                    </div>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex justify-end gap-1">
                    {!page.system && (
                      <>
                        <Link
                          to={`/admin/pages/edit/${page.id}`}
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                          title="Modifier"
                        >
                          <Edit2 size={15} />
                        </Link>
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
                    <a
                      href={`/${page.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Voir"
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-500"
                    >
                      <Eye size={15} />
                    </a>
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
