import { useState, useEffect } from 'react';
import type { Animal, Config, Pages } from '../types';

function useJsonData<T>(localStorageKey: string, url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // localStorage first (admin edits, offline)
    const stored = localStorage.getItem(localStorageKey);
    if (stored) {
      try {
        setData(JSON.parse(stored));
        setLoading(false);
        return;
      } catch { /* fall through */ }
    }
    // Fallback: server JSON
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then((json: T) => { setData(json); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
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
