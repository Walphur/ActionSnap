-- Ejecutar en Supabase SQL Editor (una vez)
alter table public.photos
  add column if not exists bike_color text,
  add column if not exists rider_color text;

create index if not exists photos_bike_color_idx on public.photos(bike_color);
create index if not exists photos_rider_color_idx on public.photos(rider_color);
