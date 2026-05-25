-- Pegar en Supabase SQL Editor y Run (se puede ejecutar varias veces)

-- 1) Crear bucket público "photos"
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do update set public = true, name = 'photos';

-- 2) Políticas (borrar si ya existen y volver a crear)
drop policy if exists "photos_public_read" on storage.objects;
drop policy if exists "photos_service_upload" on storage.objects;
drop policy if exists "photos_service_update" on storage.objects;
drop policy if exists "photos_service_delete" on storage.objects;

create policy "photos_public_read"
on storage.objects for select
using (bucket_id = 'photos');

create policy "photos_service_upload"
on storage.objects for insert
with check (bucket_id = 'photos');

create policy "photos_service_update"
on storage.objects for update
using (bucket_id = 'photos');

create policy "photos_service_delete"
on storage.objects for delete
using (bucket_id = 'photos');

-- 3) Verificar (debe mostrar una fila "photos")
select id, name, public from storage.buckets where id = 'photos';
