-- EJECUTAR EN SUPABASE SQL EDITOR (Storage → buckets para subir fotos)
-- Soluciona: "Falta el bucket 'hd-originals' en Supabase"

-- Helper admin (por si no existe)
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

-- Buckets: preview público + HD privado
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
drop policy if exists "hd_originals_photographer_update" on storage.objects;
drop policy if exists "hd_originals_photographer_delete" on storage.objects;
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

-- Verificación
select id, name, public from storage.buckets
where id in ('public-previews', 'hd-originals');
