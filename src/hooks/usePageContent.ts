/**
 * Reads editable page content from localStorage('pages_content'),
 * falling back to an empty object (callers supply hardcoded defaults).
 */
export interface PageContentData {
  hero_title?: string;
  hero_subtitle?: string;
  blocks?: unknown[];
  [key: string]: unknown;
}

export function usePageContent(slug: string): PageContentData {
  try {
    const stored: Record<string, PageContentData> = JSON.parse(
      localStorage.getItem('pages_content') || '{}'
    );
    return stored[slug] ?? {};
  } catch {
    return {};
  }
}

export function savePageContent(slug: string, data: Partial<PageContentData>): void {
  try {
    const stored: Record<string, PageContentData> = JSON.parse(
      localStorage.getItem('pages_content') || '{}'
    );
    localStorage.setItem(
      'pages_content',
      JSON.stringify({ ...stored, [slug]: { ...(stored[slug] ?? {}), ...data } })
    );
  } catch { /* ignore */ }
}
