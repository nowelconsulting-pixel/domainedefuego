import { useState, useEffect } from 'react';
import type { Animal, Config, Pages } from '../types';

// Always fetch from server JSON files — localStorage is a write-through cache only.
// This ensures all browsers (mobile, desktop, admin) see the same published data.
function useJsonData<T>(localStorageKey: string, url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then((json: T) => {
        // If admin has a localStorage override, it takes precedence.
        const stored = localStorage.getItem(localStorageKey);
        if (stored) {
          try {
            setData(JSON.parse(stored));
            setLoading(false);
            return;
          } catch { /* fall through */ }
        }
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        // Network failed — try localStorage as last resort.
        const stored = localStorage.getItem(localStorageKey);
        if (stored) {
          try { setData(JSON.parse(stored)); setLoading(false); return; } catch { /* */ }
        }
        setError(err.message);
        setLoading(false);
      });
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
