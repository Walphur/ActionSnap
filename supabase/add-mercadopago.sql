-- Mercado Pago (ejecutar en Supabase SQL Editor)
alter table public.purchases
  add column if not exists payment_provider text default 'stripe';

alter table public.purchases
  add column if not exists mp_preference_id text;

alter table public.purchases
  add column if not exists mp_payment_id text;

create index if not exists purchases_mp_payment_id_idx on public.purchases(mp_payment_id);
