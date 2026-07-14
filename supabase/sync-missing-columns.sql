-- Ejecutar en Supabase SQL Editor si el panel admin muestra errores de columnas faltantes
-- (ej. mp_seller_id does not exist)

-- profiles — Mercado Pago + watermark + suspensión
alter table public.profiles add column if not exists mp_receiver_id text;
alter table public.profiles add column if not exists mp_seller_id text;
alter table public.profiles add column if not exists mp_access_token text;
alter table public.profiles add column if not exists mp_refresh_token text;
alter table public.profiles add column if not exists mp_token_expires_at timestamptz;
alter table public.profiles add column if not exists watermark_text text;
alter table public.profiles add column if not exists watermark_use_logo boolean not null default true;
alter table public.profiles add column if not exists is_active boolean not null default true;

-- Transferencia bancaria + checkout QR
alter table public.profiles add column if not exists bank_cbu text;
alter table public.profiles add column if not exists bank_alias text;
alter table public.profiles add column if not exists bank_holder_name text;
alter table public.profiles add column if not exists accepts_bank_transfer boolean not null default false;

alter table public.purchases add column if not exists checkout_method text;
alter table public.purchases add column if not exists transfer_reference text;
alter table public.purchases add column if not exists platform_fee_settled boolean not null default true;
alter table public.purchases add column if not exists mp_checkout_url text;

-- events — multi-deporte
alter table public.events add column if not exists sport text not null default 'motocross';

-- photos — marketplace + IA
alter table public.photos add column if not exists photographer_id uuid references public.profiles(id) on delete set null;
alter table public.photos add column if not exists price_cents integer;
alter table public.photos add column if not exists is_sold boolean not null default false;
alter table public.photos add column if not exists bike_color text;
alter table public.photos add column if not exists rider_color text;
alter table public.photos add column if not exists ai_labels text[];

-- purchases — Mercado Pago split
alter table public.purchases add column if not exists payment_provider text default 'mercadopago';
alter table public.purchases add column if not exists photographer_id uuid references public.profiles(id) on delete set null;
alter table public.purchases add column if not exists mp_preference_id text;
alter table public.purchases add column if not exists mp_payment_id text;
alter table public.purchases add column if not exists platform_fee_cents integer not null default 0;
alter table public.purchases add column if not exists seller_amount_cents integer not null default 0;
alter table public.purchases add column if not exists mp_marketplace_fee_cents integer not null default 0;
alter table public.purchases add column if not exists mp_marketplace_id text;
alter table public.purchases add column if not exists mp_marketplace_receiver_id text;

create index if not exists profiles_is_active_idx on public.profiles(is_active);
create index if not exists purchases_photographer_id_idx on public.purchases(photographer_id);
create index if not exists purchases_mp_payment_id_idx on public.purchases(mp_payment_id);

-- Verificación rápida
select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'profiles'
  and column_name in ('mp_seller_id', 'mp_receiver_id', 'is_active', 'mp_access_token', 'mp_refresh_token')
order by column_name;
