-- Ajoute la sous-clé "maintenance" au singleton config (id = 1), absente du
-- seed initial. Le mode maintenance était géré uniquement en localStorage
-- (clé site_maintenance / maintenance_config) : un réglage propre au
-- navigateur de la personne qui l'activait, jamais partagé avec les vrais
-- visiteurs ni entre admins. On le fait désormais vivre dans la base,
-- comme le reste de la config.
--
-- Idempotent : ne touche pas aux lignes qui ont déjà une clé "maintenance".

update public.config
set data = data || jsonb_build_object(
  'maintenance', jsonb_build_object(
    'enabled', false,
    'title', 'Le site arrive bientôt 🐾',
    'subtitle', E'Nous préparons actuellement la plateforme d''adoption.\nMerci pour votre patience.',
    'show_don_btn', true,
    'preview_code', 'Bigdodo33$'
  )
)
where id = 1
  and not (data ? 'maintenance');
