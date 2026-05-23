-- Table des animaux (migration depuis localStorage)

create table if not exists public.animaux (
  id                  text        primary key,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now(),
  nom                 text        not null,
  espece              text        not null,
  race                text        not null default '',
  naissance           integer     not null,
  sexe                text        not null,
  departement         text        not null default '',
  localisation        text        not null default 'Refuge',
  statut              text        not null default 'Disponible',
  description         text        not null default '',
  entente_chiens      boolean     not null default false,
  entente_chats       boolean     not null default false,
  entente_enfants     boolean     not null default false,
  vaccine             boolean     not null default false,
  sterilise           boolean     not null default false,
  identifie           boolean     not null default false,
  participation_frais integer     not null default 0,
  association_nom     text        not null default '',
  association_ville   text        not null default '',
  photos              jsonb       not null default '[]',
  video_youtube       text        not null default ''
);

-- Mise à jour automatique de updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger animaux_updated_at
  before update on public.animaux
  for each row execute function public.set_updated_at();

-- RLS : lecture publique, écriture via clé anon (admin)
alter table public.animaux enable row level security;

create policy "Lecture publique animaux"
  on public.animaux for select
  to anon
  using (true);

create policy "Insertion admin animaux"
  on public.animaux for insert
  to anon
  with check (true);

create policy "Mise à jour admin animaux"
  on public.animaux for update
  to anon
  using (true);

create policy "Suppression admin animaux"
  on public.animaux for delete
  to anon
  using (true);

-- Bucket Storage pour les photos des animaux
insert into storage.buckets (id, name, public)
values ('animaux-photos', 'animaux-photos', true)
on conflict (id) do nothing;

create policy "Photos animaux publiques"
  on storage.objects for select
  to anon
  using (bucket_id = 'animaux-photos');

create policy "Upload photos animaux"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'animaux-photos');

create policy "Suppression photos animaux"
  on storage.objects for delete
  to anon
  using (bucket_id = 'animaux-photos');
