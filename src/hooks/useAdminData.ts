import { useState, useEffect, useCallback } from 'react';
import type { AdminUser, AdminPage, Candidature } from '../types/admin';
import { getUsers, saveUsers } from '../utils/auth';

// ─── Users ──────────────────────────────────────────────────────────────────

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);

  useEffect(() => { setUsers(getUsers()); }, []);

  const save = useCallback((updated: AdminUser[]) => {
    setUsers(updated);
    saveUsers(updated);
  }, []);

  return { users, save };
}

// ─── Admin Pages ─────────────────────────────────────────────────────────────

function loadPages(): AdminPage[] {
  try {
    const s = localStorage.getItem('admin_pages');
    return s ? JSON.parse(s) : [];
  } catch { return []; }
}

function savePages(pages: AdminPage[]): void {
  localStorage.setItem('admin_pages', JSON.stringify(pages));
}

export function useAdminPages() {
  const [pages, setPages] = useState<AdminPage[]>([]);

  useEffect(() => { setPages(loadPages()); }, []);

  const save = useCallback((updated: AdminPage[]) => {
    setPages(updated);
    savePages(updated);
  }, []);

  const savePage = useCallback((page: AdminPage) => {
    setPages(prev => {
      const exists = prev.find(p => p.id === page.id);
      const updated = exists
        ? prev.map(p => p.id === page.id ? page : p)
        : [...prev, page];
      savePages(updated);
      return updated;
    });
  }, []);

  const deletePage = useCallback((id: string) => {
    setPages(prev => {
      const updated = prev.filter(p => p.id !== id);
      savePages(updated);
      return updated;
    });
  }, []);

  return { pages, save, savePage, deletePage };
}

// ─── Candidatures ─────────────────────────────────────────────────────────────

function loadCandidatures(): Candidature[] {
  try {
    const s = localStorage.getItem('candidatures');
    return s ? JSON.parse(s) : [];
  } catch { return []; }
}

function saveCandidatures(c: Candidature[]): void {
  localStorage.setItem('candidatures', JSON.stringify(c));
}

export function useCandidatures() {
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);

  useEffect(() => { setCandidatures(loadCandidatures()); }, []);

  const save = useCallback((updated: Candidature[]) => {
    setCandidatures(updated);
    saveCandidatures(updated);
  }, []);

  const update = useCallback((id: string, patch: Partial<Candidature>) => {
    setCandidatures(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, ...patch } : c);
      saveCandidatures(updated);
      return updated;
    });
  }, []);

  const add = useCallback((c: Candidature) => {
    setCandidatures(prev => {
      const updated = [c, ...prev];
      saveCandidatures(updated);
      // Bump unread badge
      const unread = parseInt(localStorage.getItem('candidatures_unread') || '0');
      localStorage.setItem('candidatures_unread', String(unread + 1));
      return updated;
    });
  }, []);

  const markAllRead = useCallback(() => {
    localStorage.setItem('candidatures_unread', '0');
  }, []);

  const unread = parseInt(localStorage.getItem('candidatures_unread') || '0');

  return { candidatures, save, update, add, markAllRead, unread };
}
