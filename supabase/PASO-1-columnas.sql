-- PASO 1 de 3 — Columnas + limpieza inmediata
-- Supabase → SQL Editor → pegar TODO → Run

alter table public.purchases add column if not exists payment_provider text default 'mercadopago';
alter table public.purchases add column if not exists photographer_id uuid references public.profiles(id) on delete set null;
alter table public.purchases add column if not exists mp_preference_id text;
alter table public.purchases add column if not exists mp_payment_id text;
alter table public.purchases add column if not exists platform_fee_cents integer not null default 0;
alter table public.purchases add column if not exists seller_amount_cents integer not null default 0;
alter table public.purchases add column if not exists mp_marketplace_fee_cents integer not null default 0;
alter table public.purchases add column if not exists mp_marketplace_id text;
alter table public.purchases add column if not exists mp_marketplace_receiver_id text;

alter table public.photos add column if not exists reserved_purchase_id uuid references public.purchases(id) on delete set null;
alter table public.photos add column if not exists reserved_at timestamptz;

create index if not exists purchases_photographer_id_idx on public.purchases(photographer_id);
create index if not exists purchases_mp_payment_id_idx on public.purchases(mp_payment_id);
create index if not exists photos_reserved_purchase_id_idx on public.photos(reserved_purchase_id) where reserved_purchase_id is not null;

update public.photos set reserved_purchase_id = null, reserved_at = null where is_sold = false and reserved_purchase_id is not null;

delete from public.purchases where status = 'pending' and created_at < now() - interval '2 minutes' and mp_preference_id is null;

select column_name from information_schema.columns where table_schema = 'public' and table_name = 'purchases' and column_name like 'mp_%' order by column_name;
