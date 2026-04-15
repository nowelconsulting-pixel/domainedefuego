import { useState, useEffect } from 'react';

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_url: string;
  author: string;
  published: boolean;
  published_at: string;
  featured: boolean;
}

const LS_KEY = 'articles';

export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) {
      try {
        setArticles(JSON.parse(stored));
        setLoading(false);
        return;
      } catch {
        // fall through to fetch
      }
    }
    fetch('/data/articles.json')
      .then(res => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then((json: Article[]) => {
        setArticles(json);
        setLoading(false);
      })
      .catch(() => {
        setArticles([]);
        setLoading(false);
      });
  }, []);

  const save = (newList: Article[]) => {
    setArticles(newList);
    localStorage.setItem(LS_KEY, JSON.stringify(newList));
  };

  return { articles, loading, save };
}

export function saveArticle(article: Article): void {
  let list: Article[] = [];
  try {
    const stored = localStorage.getItem(LS_KEY);
    list = stored ? JSON.parse(stored) : [];
  } catch { /* ignore */ }
  const idx = list.findIndex(a => a.id === article.id);
  if (idx >= 0) {
    list[idx] = article;
  } else {
    list.push(article);
  }
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

export function deleteArticle(id: string): void {
  let list: Article[] = [];
  try {
    const stored = localStorage.getItem(LS_KEY);
    list = stored ? JSON.parse(stored) : [];
  } catch { /* ignore */ }
  localStorage.setItem(LS_KEY, JSON.stringify(list.filter(a => a.id !== id)));
}
