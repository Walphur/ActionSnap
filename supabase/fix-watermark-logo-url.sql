-- Logo propio del fotógrafo para marca de agua (reemplaza el de Action Snap).
alter table public.profiles
  add column if not exists watermark_logo_url text;

comment on column public.profiles.watermark_logo_url is
  'URL pública del logo del fotógrafo para previews; null = usar logo Action Snap si watermark_use_logo';
