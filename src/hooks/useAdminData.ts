import { useState, useEffect, useCallback } from 'react';
import type { AdminUser, AdminPage, Candidature, CandidatureStatus } from '../types/admin';
import { getUsers, saveUsers } from '../utils/auth';
import { supabase } from '../lib/supabase';

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

type SoumissionRow = {
  id: string;
  created_at: string;
  type_formulaire: string | null;
  form_title: string | null;
  statut: string | null;
  archived: boolean | null;
  animal: string | null;
  nom: string | null;
  email: string | null;
  telephone: string | null;
  message: string | null;
  donnees: Record<string, string> | null;
  notes: string | null;
};

function rowToCandidat(row: SoumissionRow): Candidature {
  return {
    id: row.id,
    type: row.type_formulaire ?? '',
    form_title: row.form_title ?? undefined,
    status: (row.statut as CandidatureStatus) ?? 'nouvelle',
    archived: row.archived ?? false,
    animal: row.animal ?? undefined,
    nom: row.nom ?? '',
    email: row.email ?? '',
    telephone: row.telephone ?? '',
    message: row.message ?? undefined,
    data: row.donnees ?? {},
    notes: row.notes ?? '',
    createdAt: row.created_at,
  };
}

function patchToRow(patch: Partial<Candidature>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if ('status'   in patch) row.statut   = patch.status;
  if ('archived' in patch) row.archived = patch.archived;
  if ('notes'    in patch) row.notes    = patch.notes;
  return row;
}

export function useCandidatures() {
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);

  useEffect(() => {
    supabase
      .from('soumissions')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setCandidatures((data as SoumissionRow[]).map(rowToCandidat));
      });
  }, []);

  const update = useCallback((id: string, patch: Partial<Candidature>) => {
    setCandidatures(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
    supabase.from('soumissions').update(patchToRow(patch)).eq('id', id);
  }, []);

  const remove = useCallback((id: string) => {
    setCandidatures(prev => prev.filter(c => c.id !== id));
    supabase.from('soumissions').delete().eq('id', id);
  }, []);

  const markAllRead = useCallback(() => { /* statut géré via Supabase */ }, []);

  const unread = candidatures.filter(c => !c.archived && c.status === 'nouvelle').length;

  return { candidatures, update, remove, markAllRead, unread };
}
