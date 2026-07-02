-- URGENTE: Supabase → SQL Editor → pegar y Run
-- Si el checkout dice: mp_marketplace_fee_cents column ... schema cache

alter table public.purchases add column if not exists payment_provider text default 'mercadopago';
alter table public.purchases add column if not exists photographer_id uuid references public.profiles(id) on delete set null;
alter table public.purchases add column if not exists mp_preference_id text;
alter table public.purchases add column if not exists mp_payment_id text;
alter table public.purchases add column if not exists platform_fee_cents integer not null default 0;
alter table public.purchases add column if not exists seller_amount_cents integer not null default 0;
alter table public.purchases add column if not exists mp_marketplace_fee_cents integer not null default 0;
alter table public.purchases add column if not exists mp_marketplace_id text;
alter table public.purchases add column if not exists mp_marketplace_receiver_id text;

create index if not exists purchases_photographer_id_idx on public.purchases(photographer_id);
create index if not exists purchases_mp_payment_id_idx on public.purchases(mp_payment_id);

select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'purchases'
  and column_name like 'mp_%'
order by column_name;
