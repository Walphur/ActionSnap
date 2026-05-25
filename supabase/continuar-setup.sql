-- Si te salió: type "user_role" already exists
-- Pegá SOLO esto en Supabase SQL Editor y Run (el resto ya está creado)

-- Fotógrafo para /admin
insert into public.profiles (id, full_name, role)
values (
  '00000000-0000-0000-0000-000000000001',
  'Fotógrafo',
  'photographer'
)
on conflict (id) do nothing;

-- Verificar tablas (opcional, solo muestra resultado)
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('profiles', 'events', 'photos', 'photo_numbers', 'purchases', 'purchase_items')
order by table_name;
