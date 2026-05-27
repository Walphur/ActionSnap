-- Marca de agua personalizada por fotógrafo (ejecutar en Supabase SQL Editor)
alter table public.profiles
  add column if not exists watermark_text text,
  add column if not exists watermark_use_logo boolean not null default true;

comment on column public.profiles.watermark_text is 'Texto en preview; null = ACTION SNAP por defecto';
