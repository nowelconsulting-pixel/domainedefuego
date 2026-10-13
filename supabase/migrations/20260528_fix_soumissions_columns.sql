-- Corrige la désynchronisation entre le schéma réel de production et
-- 20260523_create_soumissions.sql : la colonne "archived" (et potentiellement
-- d'autres) n'avait jamais été appliquée, provoquant l'échec silencieux
-- (puis visible) de l'archivage des messages depuis le back-office.
--
-- Idempotent : sans effet si les colonnes existent déjà.

alter table public.soumissions
  add column if not exists form_title text,
  add column if not exists animal     text,
  add column if not exists donnees    jsonb   default '{}',
  add column if not exists notes      text    default '',
  add column if not exists archived   boolean default false;
