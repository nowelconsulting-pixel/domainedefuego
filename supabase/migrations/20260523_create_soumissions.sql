-- Table des soumissions de formulaires

create table if not exists public.soumissions (
  id              uuid        primary key default gen_random_uuid(),
  created_at      timestamptz default now(),
  type_formulaire text,
  nom             text,
  email           text,
  telephone       text,
  message         text,
  statut          text        default 'non_lu',

  -- Champs complémentaires utilisés par le back-office
  form_title      text,
  animal          text,
  donnees         jsonb       default '{}',
  notes           text        default '',
  archived        boolean     default false
);

-- RLS : les visiteurs peuvent soumettre des formulaires (INSERT),
-- l'admin lit et gère via la clé anon (SELECT/UPDATE/DELETE).
-- À restreindre ultérieurement avec Supabase Auth côté admin.

alter table public.soumissions enable row level security;

create policy "Soumission publique"
  on public.soumissions for insert
  to anon
  with check (true);

create policy "Lecture admin"
  on public.soumissions for select
  to anon
  using (true);

create policy "Mise à jour admin"
  on public.soumissions for update
  to anon
  using (true);

create policy "Suppression admin"
  on public.soumissions for delete
  to anon
  using (true);
