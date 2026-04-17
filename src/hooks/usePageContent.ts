import pageDefaults from '../data/pageDefaults';

export type PageContentData = Record<string, unknown>;

/** Read editable content for a page. Merges defaults with stored data so defaults always fill missing keys. */
export function usePageContent(slug: string): PageContentData {
  const defaults = pageDefaults[slug] ?? {};
  try {
    const raw = localStorage.getItem(`page_content_${slug}`);
    if (raw) return { ...defaults, ...JSON.parse(raw) as PageContentData };
  } catch { /* ignore */ }
  return defaults;
}

/** Persist the full content object for a page slug. */
export function savePageContent(slug: string, data: PageContentData): void {
  localStorage.setItem(`page_content_${slug}`, JSON.stringify(data));
}
