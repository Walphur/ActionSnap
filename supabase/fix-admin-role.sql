-- Restaurar acceso admin para una cuenta
-- Reemplaza el email y ejecuta en Supabase SQL Editor

-- Ver rol actual
select u.id, u.email, p.role, p.full_name
from auth.users u
left join public.profiles p on p.id = u.id
where u.email ilike 'juank.gagliano@gmail.com';

-- Restaurar rol admin
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users where email ilike 'juank.gagliano@gmail.com' limit 1
);

-- Verificar
select u.email, p.role
from auth.users u
join public.profiles p on p.id = u.id
where u.email ilike 'juank.gagliano@gmail.com';
