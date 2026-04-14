export type PageContentData = Record<string, unknown>;

/** Reads editable content from localStorage('page_content_{slug}'). */
export function usePageContent(slug: string): PageContentData {
  try {
    const raw = localStorage.getItem(`page_content_${slug}`);
    return raw ? (JSON.parse(raw) as PageContentData) : {};
  } catch {
    return {};
  }
}

/** Saves (merges) content into localStorage('page_content_{slug}'). */
export function savePageContent(slug: string, data: PageContentData): void {
  try {
    const existing = (() => {
      try { return JSON.parse(localStorage.getItem(`page_content_${slug}`) || '{}') as PageContentData; }
      catch { return {}; }
    })();
    localStorage.setItem(`page_content_${slug}`, JSON.stringify({ ...existing, ...data }));
  } catch { /* ignore */ }
}
