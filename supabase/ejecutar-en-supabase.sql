-- ============================================================
-- COPIÁ TODO ESTE ARCHIVO (Ctrl+A, Ctrl+C)
-- Pegalo en Supabase → SQL Editor → Run
-- NO escribas "supabase/schema.sql" — eso es solo el nombre del archivo en tu PC
-- ============================================================

create extension if not exists "uuid-ossp";

-- Si ya corriste el script antes, el tipo puede existir (no es error)
do $$ begin
  create type public.user_role as enum ('photographer', 'racer', 'admin');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  full_name text,
  role public.user_role not null default 'racer',
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  description text,
  event_date date not null,
  location text,
  photographer_id uuid not null references public.profiles(id),
  cover_url text,
  is_published boolean not null default false,
  price_per_photo_cents integer not null default 500,
  created_at timestamptz not null default now()
);

create table if not exists public.photos (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references public.events(id) on delete cascade,
  cloudinary_public_id text not null,
  preview_url text not null,
  original_url text not null,
  width integer,
  height integer,
  ai_status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.photo_numbers (
  id uuid primary key default uuid_generate_v4(),
  photo_id uuid not null references public.photos(id) on delete cascade,
  number text not null,
  confidence numeric(5,4),
  unique (photo_id, number)
);

create table if not exists public.purchases (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id),
  email text not null,
  stripe_session_id text unique,
  stripe_payment_intent text,
  amount_cents integer not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.purchase_items (
  id uuid primary key default uuid_generate_v4(),
  purchase_id uuid not null references public.purchases(id) on delete cascade,
  photo_id uuid not null references public.photos(id),
  unique (purchase_id, photo_id)
);

create index if not exists photos_event_id_idx on public.photos(event_id);
create index if not exists photo_numbers_number_idx on public.photo_numbers(number);
create index if not exists events_slug_idx on public.events(slug);

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.photos enable row level security;
alter table public.photo_numbers enable row level security;
alter table public.purchases enable row level security;
alter table public.purchase_items enable row level security;

-- Políticas (si ya existen, ignorá el error o borrá políticas viejas en Table Editor)
drop policy if exists "events_public_read" on public.events;
drop policy if exists "events_photographer_all" on public.events;
drop policy if exists "photos_public_read" on public.photos;
drop policy if exists "photos_photographer_insert" on public.photos;
drop policy if exists "photo_numbers_public_read" on public.photo_numbers;
drop policy if exists "profiles_own" on public.profiles;

create policy "events_public_read" on public.events
  for select using (is_published = true);

create policy "events_photographer_all" on public.events
  for all using (auth.uid() = photographer_id);

create policy "photos_public_read" on public.photos
  for select using (
    exists (
      select 1 from public.events e
      where e.id = photos.event_id and e.is_published = true
    )
  );

create policy "photos_photographer_insert" on public.photos
  for insert with check (
    exists (
      select 1 from public.events e
      where e.id = photos.event_id and e.photographer_id = auth.uid()
    )
  );

create policy "photos_photographer_select" on public.photos
  for select using (
    exists (
      select 1 from public.events e
      where e.id = photos.event_id and e.photographer_id = auth.uid()
    )
  );

create policy "photos_photographer_update" on public.photos
  for update using (
    exists (
      select 1 from public.events e
      where e.id = photos.event_id and e.photographer_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.events e
      where e.id = photos.event_id and e.photographer_id = auth.uid()
    )
  );

create policy "photos_photographer_delete" on public.photos
  for delete using (
    exists (
      select 1 from public.events e
      where e.id = photos.event_id and e.photographer_id = auth.uid()
    )
  );

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
      select 1 from public.photos ph
      join public.events e on e.id = ph.event_id
      where ph.id = photo_numbers.photo_id and e.photographer_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.photos ph
      join public.events e on e.id = ph.event_id
      where ph.id = photo_numbers.photo_id and e.photographer_id = auth.uid()
    )
  );

create policy "profiles_own" on public.profiles
  for all using (auth.uid() = id);

-- Fotógrafo demo (para crear carreras desde /admin)
insert into public.profiles (id, full_name, role)
values (
  '00000000-0000-0000-0000-000000000001',
  'Fotógrafo',
  'photographer'
)
on conflict (id) do nothing;
