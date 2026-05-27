import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

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

export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dataRef = useRef<Article[]>([]);

  useEffect(() => {
    supabase
      .from('articles')
      .select('*')
      .then(({ data: rows, error: err }) => {
        if (err) { setError(err.message); setLoading(false); return; }
        const list = (rows ?? []).map(r => ({ ...r, published_at: r.published_at ?? '' })) as Article[];
        setArticles(list);
        dataRef.current = list;
        setLoading(false);
      });
  }, []);

  const save = async (newList: Article[]) => {
    const oldData = dataRef.current;
    setArticles(newList);
    dataRef.current = newList;

    const toUpsert = newList.filter(n => {
      const old = oldData.find(o => o.id === n.id);
      return !old || JSON.stringify(old) !== JSON.stringify(n);
    });
    const toDelete = oldData.filter(o => !newList.some(n => n.id === o.id));

    if (toUpsert.length > 0) {
      const toUpsertDb = toUpsert.map(a => ({ ...a, published_at: a.published_at || null }));
      await supabase.from('articles').upsert(toUpsertDb);
    }
    for (const item of toDelete) {
      await supabase.from('articles').delete().eq('id', item.id);
    }
  };

  return { articles, loading, error, save };
}
