-- Tokens OAuth del fotógrafo (requeridos para que el cobro vaya a SU cuenta, no a la de la plataforma).
-- Sin esto, create preference usa MERCADOPAGO_ACCESS_TOKEN del dueño de Action Snap.

alter table public.profiles add column if not exists mp_access_token text;
alter table public.profiles add column if not exists mp_refresh_token text;
alter table public.profiles add column if not exists mp_token_expires_at timestamptz;

comment on column public.profiles.mp_access_token is
  'Access token OAuth del vendedor. Nunca exponer al cliente.';
comment on column public.profiles.mp_refresh_token is
  'Refresh token OAuth del vendedor. Nunca exponer al cliente.';
comment on column public.profiles.mp_token_expires_at is
  'Expiración aproximada del access token (UTC).';

-- Verificación
select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'profiles'
  and column_name in ('mp_access_token', 'mp_refresh_token', 'mp_token_expires_at')
order by column_name;
