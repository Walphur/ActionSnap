-- Moto Fotos: esquema inicial
-- Ejecutar en Supabase SQL Editor

create extension if not exists "uuid-ossp";

create type public.user_role as enum ('photographer', 'racer', 'admin');

-- Perfiles: en producción vincular con auth.users; MVP permite UUID fijo del fotógrafo
create table public.profiles (
  id uuid primary key default uuid_generate_v4(),
  full_name text,
  role public.user_role not null default 'racer',
  mp_receiver_id text,
  mp_seller_id text,
  watermark_text text,
  watermark_use_logo boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  description text,
  event_date date not null,
  location text,
  sport text not null default 'motocross',
  photographer_id uuid not null references public.profiles(id),
  cover_url text,
  is_published boolean not null default false,
  price_per_photo_cents integer not null default 500,
  created_at timestamptz not null default now()
);

create table public.photos (
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

create table public.photo_numbers (
  id uuid primary key default uuid_generate_v4(),
  photo_id uuid not null references public.photos(id) on delete cascade,
  number text not null,
  confidence numeric(5,4),
  unique (photo_id, number)
);

create table public.purchases (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id),
  photographer_id uuid references public.profiles(id),
  email text not null,
  payment_provider text not null default 'stripe',
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

create table public.purchase_items (
  id uuid primary key default uuid_generate_v4(),
  purchase_id uuid not null references public.purchases(id) on delete cascade,
  photo_id uuid not null references public.photos(id),
  unique (purchase_id, photo_id)
);

create index photos_event_id_idx on public.photos(event_id);
create index photo_numbers_number_idx on public.photo_numbers(number);
create index events_slug_idx on public.events(slug);
create index events_sport_idx on public.events(sport);
create index purchases_photographer_id_idx on public.purchases(photographer_id);

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.photos enable row level security;
alter table public.photo_numbers enable row level security;
alter table public.purchases enable row level security;
alter table public.purchase_items enable row level security;

-- Eventos publicados: lectura para todos
create policy "events_public_read" on public.events
  for select using (is_published = true);

-- Eventos del fotógrafo
create policy "events_photographer_select" on public.events
  for select using (auth.uid() = photographer_id);

create policy "events_photographer_insert" on public.events
  for insert with check (auth.uid() = photographer_id);

create policy "events_photographer_update" on public.events
  for update using (auth.uid() = photographer_id) with check (auth.uid() = photographer_id);

create policy "events_photographer_delete" on public.events
  for delete using (auth.uid() = photographer_id);

-- Fotos de eventos publicados
create policy "photos_public_read" on public.photos
  for select using (
    exists (
      select 1 from public.events e
      where e.id = photos.event_id and e.is_published = true
    )
  );

-- Fotos del fotógrafo
create policy "photos_photographer_select" on public.photos
  for select using (
    exists (
      select 1 from public.events e
      where e.id = photos.event_id and e.photographer_id = auth.uid()
    )
  );

create policy "photos_photographer_insert" on public.photos
  for insert with check (
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

-- Dorsales del fotógrafo
create policy "photo_numbers_photographer_select" on public.photo_numbers
  for select using (
    exists (
      select 1 from public.photos ph
      join public.events e on e.id = ph.event_id
      where ph.id = photo_numbers.photo_id and e.photographer_id = auth.uid()
    )
  );

create policy "photo_numbers_photographer_insert" on public.photo_numbers
  for insert with check (
    exists (
      select 1 from public.photos ph
      join public.events e on e.id = ph.event_id
      where ph.id = photo_numbers.photo_id and e.photographer_id = auth.uid()
    )
  );

create policy "photo_numbers_photographer_update" on public.photo_numbers
  for update using (
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

create policy "photo_numbers_photographer_delete" on public.photo_numbers
  for delete using (
    exists (
      select 1 from public.photos ph
      join public.events e on e.id = ph.event_id
      where ph.id = photo_numbers.photo_id and e.photographer_id = auth.uid()
    )
  );

-- Estadísticas de ventas del fotógrafo
create policy "purchases_photographer_select" on public.purchases
  for select using (
    photographer_id = auth.uid()
  );

create policy "purchase_items_photographer_select" on public.purchase_items
  for select using (
    exists (
      select 1
      from public.photos ph
      join public.events e on e.id = ph.event_id
      where ph.id = purchase_items.photo_id and e.photographer_id = auth.uid()
    )
  );

create policy "profiles_own" on public.profiles
  for all using (auth.uid() = id);

-- Auto-crear profile al registrarse con Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
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
