-- Suspensión de fotógrafos + visibilidad pública condicionada
alter table public.profiles
  add column if not exists is_active boolean not null default true;

create index if not exists profiles_is_active_idx on public.profiles(is_active);

create or replace function public.is_photographer_active(photographer_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select p.is_active
      from public.profiles p
      where p.id = photographer_uuid
    ),
    true
  );
$$;

-- Eventos públicos solo si el fotógrafo está activo
drop policy if exists "events_public_read" on public.events;
create policy "events_public_read" on public.events
  for select using (
    is_published = true
    and public.is_photographer_active(photographer_id)
  );

-- Fotos públicas solo de eventos publicados de fotógrafos activos
drop policy if exists "photos_public_read" on public.photos;
create policy "photos_public_read" on public.photos
  for select using (
    exists (
      select 1
      from public.events e
      where e.id = photos.event_id
        and e.is_published = true
        and public.is_photographer_active(e.photographer_id)
    )
  );

drop policy if exists "photo_numbers_public_read" on public.photo_numbers;
create policy "photo_numbers_public_read" on public.photo_numbers
  for select using (
    exists (
      select 1
      from public.photos ph
      join public.events e on e.id = ph.event_id
      where ph.id = photo_numbers.photo_id
        and e.is_published = true
        and public.is_photographer_active(e.photographer_id)
    )
  );
