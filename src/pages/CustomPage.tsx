import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAdminPages } from '../hooks/useAdminData';
import type { AdminPage } from '../types/admin';
import { renderBlock } from '../utils/blockRenderer';

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
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold">{page.title}</h1>
          {page.seo_description && <p className="text-gray-400 mt-3 text-lg">{page.seo_description}</p>}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {page.content && (
          <div className="prose prose-gray max-w-none mb-12" dangerouslySetInnerHTML={{ __html: page.content }} />
        )}
        <div className="space-y-8">
          {page.blocks.map(block => renderBlock(block))}
        </div>
      </div>
    </div>
  );
}
