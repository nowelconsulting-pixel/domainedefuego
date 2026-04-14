import pageDefaults from '../data/pageDefaults';

export type PageContentData = Record<string, unknown>;

/** Read editable content for a page. Checks localStorage first, falls back to built-in defaults. */
export function usePageContent(slug: string): PageContentData {
  try {
    const raw = localStorage.getItem(`page_content_${slug}`);
    if (raw) return JSON.parse(raw) as PageContentData;
  } catch { /* ignore */ }
  return pageDefaults[slug] ?? {};
}

/** Persist the full content object for a page slug. */
export function savePageContent(slug: string, data: PageContentData): void {
  localStorage.setItem(`page_content_${slug}`, JSON.stringify(data));
}
