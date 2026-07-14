-- Comisión por transferencias bancarias: el fotógrafo cobra todo y debe liquidar a la plataforma.
alter table public.purchases
  add column if not exists platform_fee_settled boolean not null default true;

comment on column public.purchases.platform_fee_settled is
  'true = comisión ya cobrada (MP split o liquidada). false = fotógrafo debe la comisión (transferencia).';

-- Backfill: transferencias pagadas sin comisión → calcular 20% y marcar deuda.
update public.purchases
set
  platform_fee_cents = round(amount_cents * 0.20),
  seller_amount_cents = amount_cents - round(amount_cents * 0.20),
  platform_fee_settled = false
where payment_provider = 'bank_transfer'
  and status = 'paid'
  and coalesce(platform_fee_cents, 0) = 0
  and coalesce(amount_cents, 0) > 0;

-- Transferencias pagadas con fee ya cargado: quedan pendientes de liquidación.
update public.purchases
set platform_fee_settled = false
where payment_provider = 'bank_transfer'
  and status = 'paid'
  and platform_fee_settled = true
  and coalesce(platform_fee_cents, 0) > 0;

select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'purchases'
  and column_name = 'platform_fee_settled';
