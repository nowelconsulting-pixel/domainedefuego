import { useState, useEffect } from 'react';
import type { Animal, Config, Pages } from '../types';

export interface Article {
  id: string; title: string; slug: string; excerpt: string;
  cover_url: string; author: string; published_at: string; published: boolean;
}

function useJsonData<T>(localStorageKey: string, url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = () => {
      const stored = localStorage.getItem(localStorageKey);
      if (stored) {
        try { setData(JSON.parse(stored)); setLoading(false); return; }
        catch { /* fall through */ }
      }
      fetch(url)
        .then(res => { if (!res.ok) throw new Error('Network error'); return res.json(); })
        .then((json: T) => { setData(json); setLoading(false); })
        .catch(err => { setError(err.message); setLoading(false); });
    };

    load();

    // Refresh when another tab (or admin) updates this key in localStorage
    const onStorage = (e: StorageEvent) => {
      if (e.key !== localStorageKey) return;
      if (e.newValue) {
        try { setData(JSON.parse(e.newValue)); } catch { /* ignore */ }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [localStorageKey, url]);

  const save = (newData: T) => {
    setData(newData);
    localStorage.setItem(localStorageKey, JSON.stringify(newData));
  };

  return { data, loading, error, save };
}

export function useAnimaux() {
  return useJsonData<Animal[]>('animaux', '/data/animaux.json');
}

export function useConfig() {
  return useJsonData<Config>('config', '/data/config.json');
}

export function usePages() {
  return useJsonData<Pages>('pages', '/data/pages.json');
}

export function useArticles() {
  return useJsonData<Article[]>('articles', '/data/articles.json');
}
