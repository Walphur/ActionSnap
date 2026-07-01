-- Reparar usuarios de Auth que no tienen fila en public.profiles
-- Ejecutar en Supabase SQL Editor si ves "Perfil de fotógrafo no encontrado"

insert into public.profiles (id, full_name, role)
select
  u.id,
  nullif(trim(coalesce(u.raw_user_meta_data->>'full_name', '')), ''),
  coalesce(u.raw_user_meta_data->>'role', 'photographer')::public.user_role
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;

-- Verificar tu usuario (reemplazá el email)
select u.id, u.email, p.role, p.full_name
from auth.users u
left join public.profiles p on p.id = u.id
where u.email ilike '%TU_EMAIL%';

-- Forzar rol fotógrafo si hace falta
-- update public.profiles set role = 'photographer' where id = 'UUID-DEL-USUARIO';

-- Trigger por si no existe (crea profile al registrarse)
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
    nullif(trim(coalesce(new.raw_user_meta_data->>'full_name', '')), ''),
    coalesce(new.raw_user_meta_data->>'role', 'photographer')::public.user_role
  )
  on conflict (id) do update
    set full_name = coalesce(excluded.full_name, public.profiles.full_name),
        role = coalesce(excluded.role, public.profiles.role);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
