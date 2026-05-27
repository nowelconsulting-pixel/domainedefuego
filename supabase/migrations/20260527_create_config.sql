-- Table config (singleton — id = 1 toujours)
create table if not exists public.config (
  id   integer primary key default 1,
  data jsonb   not null default '{}',
  constraint config_singleton check (id = 1)
);

alter table public.config enable row level security;

create policy "Lecture publique config"
  on public.config for select
  to anon using (true);

create policy "Insertion admin config"
  on public.config for insert
  to anon with check (true);

create policy "Mise à jour admin config"
  on public.config for update
  to anon using (true);

-- Seed avec les valeurs initiales
insert into public.config (id, data)
values (1, '{
  "email_destinataire": "contact@domainedefuego.fr",
  "helloasso_url": "https://www.helloasso.com/associations/domaine-de-fuego/formulaires/faire-un-don",
  "facebook_url": "",
  "instagram_url": "https://www.instagram.com/domainedefuego_refuge_pension",
  "linkedin_url": "https://www.linkedin.com/company/domaine-de-fuego-refuge/",
  "telephone": "",
  "adresse": "Domaine de Fuego — Osny",
  "email_contact": "contact@domainedefuego.fr",
  "chiffres": {
    "animaux_adoptes": 1,
    "familles_accueil": 5,
    "annees_existence": 0,
    "custom": [{"label": "Dons collectés", "value": 500}]
  }
}'::jsonb)
on conflict (id) do nothing;
