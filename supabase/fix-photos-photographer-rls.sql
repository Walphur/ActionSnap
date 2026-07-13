-- Fotógrafos deben poder leer/editar fotos de sus eventos aunque no estén publicados.
-- Sin estas políticas, el panel muestra fotos en el resumen (service role) pero no en etiquetar (RLS).

drop policy if exists "photos_photographer_select" on public.photos;
drop policy if exists "photos_photographer_update" on public.photos;
drop policy if exists "photos_photographer_delete" on public.photos;

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

drop policy if exists "photo_numbers_photographer_select" on public.photo_numbers;
drop policy if exists "photo_numbers_photographer_insert" on public.photo_numbers;
drop policy if exists "photo_numbers_photographer_update" on public.photo_numbers;
drop policy if exists "photo_numbers_photographer_delete" on public.photo_numbers;

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
