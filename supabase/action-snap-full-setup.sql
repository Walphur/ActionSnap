-- =============================================================================
-- Action Snap — Setup completo Supabase (PostgreSQL + RLS + Storage)
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query → Run
--
-- Mapeo con la especificación del producto:
--   users_profiles  →  public.profiles
--   customer        →  role 'racer'
--   mercadopago_token → mp_receiver_id / mp_seller_id
--   events.name     →  events.title
--   events.date     →  events.event_date
--   status draft/published → is_published (false = draft, true = published)
--   watermarked_url →  photos.preview_url
--   hd_url          →  photos.original_url
--   detected_bib_numbers → tabla photo_numbers (normalizada, mejor para búsqueda)
-- =============================================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- 1. Tipos y tablas
-- ---------------------------------------------------------------------------

do $$ begin
  create type public.user_role as enum ('photographer', 'racer', 'admin');
exception
  when duplicate_object then null;
end $$;

-- Perfiles vinculados a auth.users (equivale a users_profiles)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.user_role not null default 'racer',
  mp_receiver_id text,
  mp_seller_id text,
  watermark_text text,
  watermark_use_logo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  description text,
  event_date date not null,
  location text,
  sport text not null default 'motocross',
  photographer_id uuid not null references public.profiles(id) on delete restrict,
  cover_url text,
  is_published boolean not null default false,
  price_per_photo_cents integer not null default 500,
  created_at timestamptz not null default now()
);

create table if not exists public.photos (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references public.events(id) on delete cascade,
  photographer_id uuid references public.profiles(id) on delete set null,
  cloudinary_public_id text,
  preview_url text not null,
  original_url text not null,
  price_cents integer,
  is_sold boolean not null default false,
  width integer,
  height integer,
  ai_status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- Dorsales detectados por IA (equivale a detected_bib_numbers[])
create table if not exists public.photo_numbers (
  id uuid primary key default uuid_generate_v4(),
  photo_id uuid not null references public.photos(id) on delete cascade,
  number text not null,
  confidence numeric(5,4),
  unique (photo_id, number)
);

create table if not exists public.purchases (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  photographer_id uuid references public.profiles(id) on delete set null,
  email text not null,
  payment_provider text not null default 'mercadopago',
  mp_preference_id text,
  mp_payment_id text,
  stripe_session_id text unique,
  stripe_payment_intent text,
  amount_cents integer not null,
  platform_fee_cents integer not null default 0,
  seller_amount_cents integer not null default 0,
  mp_marketplace_fee_cents integer not null default 0,
  mp_marketplace_id text,
  mp_marketplace_receiver_id text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.purchase_items (
  id uuid primary key default uuid_generate_v4(),
  purchase_id uuid not null references public.purchases(id) on delete cascade,
  photo_id uuid not null references public.photos(id) on delete restrict,
  unique (purchase_id, photo_id)
);

-- Columnas opcionales si la BD ya existía sin ellas
alter table public.photos add column if not exists photographer_id uuid references public.profiles(id) on delete set null;
alter table public.photos add column if not exists price_cents integer;
alter table public.photos add column if not exists is_sold boolean not null default false;
alter table public.profiles add column if not exists mp_receiver_id text;
alter table public.profiles add column if not exists mp_seller_id text;
alter table public.profiles add column if not exists watermark_text text;
alter table public.profiles add column if not exists watermark_use_logo boolean not null default true;

-- Índices
create index if not exists photos_event_id_idx on public.photos(event_id);
create index if not exists photos_photographer_id_idx on public.photos(photographer_id);
create index if not exists photo_numbers_number_idx on public.photo_numbers(number);
create index if not exists events_slug_idx on public.events(slug);
create index if not exists events_sport_idx on public.events(sport);
create index if not exists purchases_photographer_id_idx on public.purchases(photographer_id);

-- ---------------------------------------------------------------------------
-- 2. Helpers RLS (admin)
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create or replace function public.is_event_owner(event_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.events e
    where e.id = event_uuid and e.photographer_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- 3. Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.photos enable row level security;
alter table public.photo_numbers enable row level security;
alter table public.purchases enable row level security;
alter table public.purchase_items enable row level security;

-- Limpiar políticas anteriores (idempotente)
drop policy if exists "profiles_public_read" on public.profiles;
drop policy if exists "profiles_own" on public.profiles;
drop policy if exists "profiles_admin_all" on public.profiles;

drop policy if exists "events_public_read" on public.events;
drop policy if exists "events_photographer_select" on public.events;
drop policy if exists "events_photographer_insert" on public.events;
drop policy if exists "events_photographer_update" on public.events;
drop policy if exists "events_photographer_delete" on public.events;
drop policy if exists "events_admin_all" on public.events;

drop policy if exists "photos_public_read" on public.photos;
drop policy if exists "photos_photographer_select" on public.photos;
drop policy if exists "photos_photographer_insert" on public.photos;
drop policy if exists "photos_photographer_update" on public.photos;
drop policy if exists "photos_photographer_delete" on public.photos;
drop policy if exists "photos_admin_all" on public.photos;

drop policy if exists "photo_numbers_public_read" on public.photo_numbers;
drop policy if exists "photo_numbers_photographer_all" on public.photo_numbers;
drop policy if exists "photo_numbers_admin_all" on public.photo_numbers;

drop policy if exists "purchases_photographer_select" on public.purchases;
drop policy if exists "purchases_admin_all" on public.purchases;

drop policy if exists "purchase_items_photographer_select" on public.purchase_items;
drop policy if exists "purchase_items_admin_all" on public.purchase_items;

-- PROFILES: lectura pública, edición propia, admin total
create policy "profiles_public_read" on public.profiles
  for select using (true);

create policy "profiles_own" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- EVENTS: publicados visibles para todos; CRUD solo dueño; admin total
create policy "events_public_read" on public.events
  for select using (is_published = true);

create policy "events_photographer_select" on public.events
  for select using (auth.uid() = photographer_id);

create policy "events_photographer_insert" on public.events
  for insert with check (auth.uid() = photographer_id);

create policy "events_photographer_update" on public.events
  for update using (auth.uid() = photographer_id) with check (auth.uid() = photographer_id);

create policy "events_photographer_delete" on public.events
  for delete using (auth.uid() = photographer_id);

create policy "events_admin_all" on public.events
  for all using (public.is_admin()) with check (public.is_admin());

-- PHOTOS: previews de eventos publicados; CRUD dueño; admin total
create policy "photos_public_read" on public.photos
  for select using (
    exists (
      select 1 from public.events e
      where e.id = photos.event_id and e.is_published = true
    )
  );

create policy "photos_photographer_select" on public.photos
  for select using (public.is_event_owner(event_id));

create policy "photos_photographer_insert" on public.photos
  for insert with check (public.is_event_owner(event_id));

create policy "photos_photographer_update" on public.photos
  for update using (public.is_event_owner(event_id)) with check (public.is_event_owner(event_id));

create policy "photos_photographer_delete" on public.photos
  for delete using (public.is_event_owner(event_id));

create policy "photos_admin_all" on public.photos
  for all using (public.is_admin()) with check (public.is_admin());

-- PHOTO_NUMBERS (dorsales)
create policy "photo_numbers_public_read" on public.photo_numbers
  for select using (
    exists (
      select 1 from public.photos p
      join public.events e on e.id = p.event_id
      where p.id = photo_numbers.photo_id and e.is_published = true
    )
  );

create policy "photo_numbers_photographer_all" on public.photo_numbers
  for all using (
    exists (
      select 1 from public.photos p
      where p.id = photo_numbers.photo_id and public.is_event_owner(p.event_id)
    )
  ) with check (
    exists (
      select 1 from public.photos p
      where p.id = photo_numbers.photo_id and public.is_event_owner(p.event_id)
    )
  );

create policy "photo_numbers_admin_all" on public.photo_numbers
  for all using (public.is_admin()) with check (public.is_admin());

-- PURCHASES (solo fotógrafo ve las suyas; admin ve todo)
create policy "purchases_photographer_select" on public.purchases
  for select using (photographer_id = auth.uid());

create policy "purchases_admin_all" on public.purchases
  for all using (public.is_admin()) with check (public.is_admin());

create policy "purchase_items_photographer_select" on public.purchase_items
  for select using (
    exists (
      select 1 from public.photos ph
      join public.events e on e.id = ph.event_id
      where ph.id = purchase_items.photo_id and e.photographer_id = auth.uid()
    )
  );

create policy "purchase_items_admin_all" on public.purchase_items
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 4. Trigger: crear profile al registrarse (Supabase Auth)
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'photographer')::public.user_role
  )
  on conflict (id) do update
    set full_name = coalesce(excluded.full_name, public.profiles.full_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 5. Storage: buckets public-previews + hd-originals
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('public-previews', 'public-previews', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('hd-originals', 'hd-originals', false, 52428800, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Políticas storage (path: {photographer_id}/{event_id}/{filename})
drop policy if exists "public_previews_read" on storage.objects;
drop policy if exists "public_previews_photographer_write" on storage.objects;
drop policy if exists "hd_originals_photographer_read" on storage.objects;
drop policy if exists "hd_originals_photographer_write" on storage.objects;
drop policy if exists "hd_originals_admin_all" on storage.objects;

create policy "public_previews_read"
on storage.objects for select
using (bucket_id = 'public-previews');

create policy "public_previews_photographer_write"
on storage.objects for all
using (
  bucket_id = 'public-previews'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'public-previews'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "hd_originals_photographer_read"
on storage.objects for select
using (
  bucket_id = 'hd-originals'
  and (
    public.is_admin()
    or auth.uid()::text = (storage.foldername(name))[1]
  )
);

create policy "hd_originals_photographer_write"
on storage.objects for insert
with check (
  bucket_id = 'hd-originals'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "hd_originals_photographer_update"
on storage.objects for update
using (
  bucket_id = 'hd-originals'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "hd_originals_photographer_delete"
on storage.objects for delete
using (
  bucket_id = 'hd-originals'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "hd_originals_admin_all"
on storage.objects for all
using (bucket_id = 'hd-originals' and public.is_admin())
with check (bucket_id = 'hd-originals' and public.is_admin());

-- Nota: compradores acceden a HD vía signed URL generada en el backend
-- con SUPABASE_SERVICE_ROLE_KEY (createSignedUrl), no con RLS de cliente.

-- Verificación rápida
select 'profiles' as tabla, count(*) from public.profiles
union all select 'events', count(*) from public.events
union all select 'photos', count(*) from public.photos;

select id, name, public from storage.buckets
where id in ('public-previews', 'hd-originals');
