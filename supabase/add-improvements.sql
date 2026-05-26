-- Ejecutar en Supabase SQL Editor (mejoras)
alter table public.events
  add column if not exists pack_discount_percent integer not null default 20;

comment on column public.events.pack_discount_percent is
  'Descuento % al comprar todas las fotos de un mismo dorsal';
