import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAdminPages } from '../hooks/useAdminData';
import type { AdminPage, Block } from '../types/admin';
import FormContact from '../components/FormContact';

function renderBlock(block: Block) {
  switch (block.type) {
    case 'text':
      return (
        <div
          key={block.id}
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: (block.data.content as string) || '' }}
        />
      );
    case 'image':
      return (
        <figure key={block.id} className="my-6">
          {block.data.url && (
            <img
              src={block.data.url as string}
              alt={(block.data.caption as string) || ''}
              className="w-full rounded-2xl object-cover max-h-96"
              loading="lazy"
            />
          )}
          {block.data.caption && (
            <figcaption className="text-center text-sm text-gray-400 mt-2">
              {block.data.caption as string}
            </figcaption>
          )}
        </figure>
      );
    case 'card':
      return (
        <div key={block.id} className="bg-gray-50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{block.data.title as string}</h3>
          <p className="text-gray-600">{block.data.text as string}</p>
        </div>
      );
    case 'cta':
      return (
        <div key={block.id} className="text-center my-6">
          <Link to={(block.data.url as string) || '#'} className="btn-primary text-base px-8 py-4 inline-flex">
            {block.data.label as string || 'En savoir plus'}
          </Link>
        </div>
      );
    case 'gallery': {
      const photos = ((block.data.photos as string) || '').split('\n').map(s => s.trim()).filter(Boolean);
      return (
        <div key={block.id} className="grid grid-cols-2 md:grid-cols-3 gap-4 my-6">
          {photos.map((p, i) => (
            <img key={i} src={p} alt="" className="w-full aspect-square object-cover rounded-xl" loading="lazy" />
          ))}
        </div>
      );
    }
    case 'contact_form':
      return (
        <div key={block.id} className="my-8 bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Nous contacter</h3>
          <FormContact />
        </div>
      );
    default:
      return null;
  }
}

export default function CustomPage() {
  const { slug } = useParams<{ slug: string }>();
  const { pages } = useAdminPages();
  const [page, setPage] = useState<AdminPage | null | undefined>(undefined);

  useEffect(() => {
    const found = pages.find(p => p.slug === slug && p.status === 'published' && !p.system);
    setPage(found ?? null);
  }, [slug, pages]);

  if (page === undefined) return null; // loading

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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold">{page.title}</h1>
          {page.seo_description && <p className="text-gray-400 mt-3 text-lg">{page.seo_description}</p>}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {page.content && (
          <div
            className="prose prose-gray max-w-none mb-10"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        )}
        <div className="space-y-6">
          {page.blocks.map(block => renderBlock(block))}
        </div>
      </div>
    </div>
  );
}
