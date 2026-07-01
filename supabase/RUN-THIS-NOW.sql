-- EJECUTAR TODO ESTO EN SUPABASE SQL EDITOR (una sola vez)
-- Soluciona: mp_seller_id, sport, is_active, perfiles faltantes, etc.

-- 1) Columnas profiles
alter table public.profiles add column if not exists mp_receiver_id text;
alter table public.profiles add column if not exists mp_seller_id text;
alter table public.profiles add column if not exists watermark_text text;
alter table public.profiles add column if not exists watermark_use_logo boolean not null default true;
alter table public.profiles add column if not exists is_active boolean not null default true;

-- 2) Columnas events
alter table public.events add column if not exists sport text not null default 'motocross';
alter table public.events add column if not exists pack_discount_percent integer not null default 20;

-- 3) Perfiles faltantes para usuarios Auth
insert into public.profiles (id, full_name, role)
select
  u.id,
  nullif(trim(coalesce(u.raw_user_meta_data->>'full_name', '')), ''),
  coalesce(u.raw_user_meta_data->>'role', 'photographer')::public.user_role
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;

-- 4) Verificación
select 'profiles' as tabla, column_name
from information_schema.columns
where table_schema = 'public' and table_name = 'profiles'
  and column_name in ('mp_seller_id', 'is_active')
union all
select 'events', column_name
from information_schema.columns
where table_schema = 'public' and table_name = 'events'
  and column_name in ('sport', 'pack_discount_percent');
