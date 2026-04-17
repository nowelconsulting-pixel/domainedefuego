import { usePages } from './useData';
import pageDefaults from '../data/pageDefaults';

export type PageContentData = Record<string, unknown>;

/**
 * Read editable content for a page.
 * Priority: localStorage page_content_<slug> > pages.json[slug] > pageDefaults[slug]
 */
export function usePageContent(slug: string): PageContentData {
  const { data: pagesJson } = usePages();
  const codeDefaults = pageDefaults[slug] ?? {};
  const jsonContent = (pagesJson as Record<string, PageContentData> | null)?.[slug] ?? {};
  const base = { ...codeDefaults, ...jsonContent };
  try {
    const raw = localStorage.getItem(`page_content_${slug}`);
    if (raw) return { ...base, ...JSON.parse(raw) as PageContentData };
  } catch { /* ignore */ }
  return base;
}

/** Persist the full content object for a page slug. */
export function savePageContent(slug: string, data: PageContentData): void {
  localStorage.setItem(`page_content_${slug}`, JSON.stringify(data));
}

/** Export all page_content_* localStorage keys merged into pages.json format. */
export function exportPagesJson(): void {
  const SLUGS = [
    'accueil', 'presentation', 'animaux', 'adopter', 'famille-accueil',
    'faire-un-don', 'contact', 'mentions-legales', 'blog', 'devenir-membre',
  ];
  let base: Record<string, unknown> = {};
  try {
    const stored = localStorage.getItem('pages');
    if (stored) base = JSON.parse(stored);
  } catch { /* ignore */ }
  const result: Record<string, unknown> = { ...base };
  for (const s of SLUGS) {
    try {
      const raw = localStorage.getItem(`page_content_${s}`);
      if (raw) result[s] = { ...(result[s] as object ?? {}), ...JSON.parse(raw) };
    } catch { /* ignore */ }
  }
  const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'pages.json';
  link.click();
  URL.revokeObjectURL(link.href);
}
