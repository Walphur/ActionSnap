-- Etiquetas devueltas por Google Cloud Vision (LABEL_DETECTION)
alter table public.photos
  add column if not exists ai_labels text[];

create index if not exists photos_ai_labels_idx on public.photos using gin (ai_labels);
