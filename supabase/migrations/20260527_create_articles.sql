-- Table articles (migration depuis localStorage/JSON)

create table if not exists public.articles (
  id            text        primary key,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  title         text        not null default '',
  slug          text        not null default '',
  excerpt       text        not null default '',
  content       text        not null default '',
  cover_url     text        not null default '',
  author        text        not null default '',
  published     boolean     not null default false,
  published_at  date,
  featured      boolean     not null default false
);

-- Trigger updated_at (réutilise set_updated_at() créée par la migration animaux)
create trigger articles_updated_at
  before update on public.articles
  for each row execute function public.set_updated_at();

-- RLS : même pattern que animaux (lecture publique, écriture via clé anon)
alter table public.articles enable row level security;

create policy "Lecture publique articles"
  on public.articles for select
  to anon
  using (true);

create policy "Insertion admin articles"
  on public.articles for insert
  to anon
  with check (true);

create policy "Mise à jour admin articles"
  on public.articles for update
  to anon
  using (true);

create policy "Suppression admin articles"
  on public.articles for delete
  to anon
  using (true);

-- Bucket Storage pour les images de couverture des articles
insert into storage.buckets (id, name, public)
values ('articles-covers', 'articles-covers', true)
on conflict (id) do nothing;

create policy "Couvertures articles publiques"
  on storage.objects for select
  to anon
  using (bucket_id = 'articles-covers');

create policy "Upload couvertures articles"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'articles-covers');

create policy "Suppression couvertures articles"
  on storage.objects for delete
  to anon
  using (bucket_id = 'articles-covers');
