-- Transferencia bancaria + checkout QR Mercado Pago
-- Ejecutar en Supabase SQL Editor (produccion)

alter table public.profiles
  add column if not exists bank_cbu text,
  add column if not exists bank_alias text,
  add column if not exists bank_holder_name text,
  add column if not exists accepts_bank_transfer boolean not null default false;

alter table public.purchases
  add column if not exists checkout_method text,
  add column if not exists transfer_reference text;

comment on column public.profiles.accepts_bank_transfer is
  'Si true y tiene CBU o alias, el comprador puede pagar por transferencia.';

comment on column public.purchases.checkout_method is
  'redirect | qr | bank_transfer';
