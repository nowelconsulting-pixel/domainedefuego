import { useState, useEffect, useRef } from 'react';
import type { Animal, Config, Pages } from '../types';
import { supabase } from '../lib/supabase';

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
  const [data, setData] = useState<Animal[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dataRef = useRef<Animal[] | null>(null);

  useEffect(() => {
    supabase
      .from('animaux')
      .select('*')
      .then(({ data: rows, error: err }) => {
        if (err) { setError(err.message); setLoading(false); return; }
        const list = (rows ?? []) as Animal[];
        setData(list);
        dataRef.current = list;
        setLoading(false);
      });
  }, []);

  const save = async (newData: Animal[]) => {
    const oldData = dataRef.current ?? [];
    setData(newData);
    dataRef.current = newData;

    const toUpsert = newData.filter(n => {
      const old = oldData.find(o => o.id === n.id);
      return !old || JSON.stringify(old) !== JSON.stringify(n);
    });
    const toDelete = oldData.filter(o => !newData.some(n => n.id === o.id));

    if (toUpsert.length > 0) {
      await supabase.from('animaux').upsert(toUpsert);
    }
    for (const item of toDelete) {
      await supabase.from('animaux').delete().eq('id', item.id);
    }
  };

  return { data, loading, error, save };
}

export function useConfig() {
  const [data, setData] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('config')
      .select('data')
      .eq('id', 1)
      .single()
      .then(({ data: row, error: err }) => {
        if (err) { setError(err.message); setLoading(false); return; }
        setData((row?.data ?? null) as Config | null);
        setLoading(false);
      });
  }, []);

  const save = async (newConfig: Config) => {
    setData(newConfig);
    await supabase.from('config').update({ data: newConfig }).eq('id', 1);
  };

  return { data, loading, error, save };
}

export function usePages() {
  return useJsonData<Pages>('pages', '/data/pages.json');
}

