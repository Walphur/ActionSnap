-- EJECUTAR TODO ESTO EN SUPABASE SQL EDITOR (una sola vez)
-- Soluciona: mp_seller_id, sport, is_active, perfiles faltantes, etc.

-- 1) Columnas profiles
alter table public.profiles add column if not exists mp_receiver_id text;
alter table public.profiles add column if not exists mp_seller_id text;
alter table public.profiles add column if not exists watermark_text text;
alter table public.profiles add column if not exists watermark_use_logo boolean not null default true;
alter table public.profiles add column if not exists is_active boolean not null default true;

-- 2) Columnas events
alter table public.events add column if not exists sport text not null default 'motocross';
alter table public.events add column if not exists pack_discount_percent integer not null default 20;

-- 2b) Columnas photos (subida + marketplace)
alter table public.photos add column if not exists photographer_id uuid references public.profiles(id) on delete set null;
alter table public.photos add column if not exists price_cents integer;
alter table public.photos add column if not exists is_sold boolean not null default false;
alter table public.photos add column if not exists bike_color text;
alter table public.photos add column if not exists rider_color text;
alter table public.photos add column if not exists ai_labels text[];

update public.photos p
set photographer_id = e.photographer_id
from public.events e
where p.event_id = e.id and p.photographer_id is null;

create index if not exists photos_photographer_id_idx on public.photos(photographer_id);

-- 3) Perfiles faltantes para usuarios Auth
insert into public.profiles (id, full_name, role)
select
  u.id,
  nullif(trim(coalesce(u.raw_user_meta_data->>'full_name', '')), ''),
  coalesce(u.raw_user_meta_data->>'role', 'photographer')::public.user_role
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;

-- 4) Buckets de fotos (subir preview + HD)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('public-previews', 'public-previews', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('hd-originals', 'hd-originals', false, 52428800, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 5) Verificación
select 'profiles' as tabla, column_name
from information_schema.columns
where table_schema = 'public' and table_name = 'profiles'
  and column_name in ('mp_seller_id', 'is_active')
union all
select 'events', column_name
from information_schema.columns
where table_schema = 'public' and table_name = 'events'
  and column_name in ('sport', 'pack_discount_percent')
union all
select 'photos', column_name
from information_schema.columns
where table_schema = 'public' and table_name = 'photos'
  and column_name in ('photographer_id', 'is_sold');

select id, name, public from storage.buckets
where id in ('public-previews', 'hd-originals');
