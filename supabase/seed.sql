-- Ejecutar DESPUÉS de schema.sql (una sola vez)
insert into public.profiles (id, full_name, role)
values (
  '00000000-0000-0000-0000-000000000001',
  'Fotógrafo',
  'photographer'
)
on conflict (id) do nothing;
