-- URL de checkout MP (init_point) para QR / reabrir pago sin reconsultar preferencia.
alter table public.purchases
  add column if not exists mp_checkout_url text;

comment on column public.purchases.mp_checkout_url is
  'init_point de la preferencia MP; usado en /compra/qr';
