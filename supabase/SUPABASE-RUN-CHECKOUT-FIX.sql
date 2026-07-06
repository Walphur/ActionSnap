-- ============================================================
-- ActionSnap — pegar TODO esto en Supabase → SQL Editor → Run
-- (NO pegues nombres de archivo, pegá este SQL completo)
-- ============================================================

-- PASO 1: Columnas Mercado Pago en purchases
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

-- PASO 2: Columnas reserva en photos
alter table public.photos add column if not exists reserved_purchase_id uuid references public.purchases(id) on delete set null;
alter table public.photos add column if not exists reserved_at timestamptz;

create index if not exists photos_reserved_purchase_id_idx
  on public.photos(reserved_purchase_id)
  where reserved_purchase_id is not null;

-- PASO 3: Limpiar reservas bloqueadas ahora mismo
update public.photos
set reserved_purchase_id = null, reserved_at = null
where is_sold = false
  and reserved_purchase_id is not null;

delete from public.purchases
where status = 'pending'
  and created_at < now() - interval '2 minutes'
  and mp_preference_id is null
  and stripe_session_id is null;

-- PASO 4: Funciones de reserva (checkout 409 fix)
create or replace function public.release_purchase_reservation(p_purchase_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.photos
  set reserved_purchase_id = null, reserved_at = null
  where reserved_purchase_id = p_purchase_id
    and is_sold = false;
end;
$$;

create or replace function public.release_stale_checkout_reservations(
  p_photo_ids uuid[] default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  released_photos int;
  cancelled_purchases int;
begin
  with stale_purchases as (
    select pu.id
    from public.purchases pu
    where pu.status = 'pending'
      and (
        pu.created_at < now() - interval '20 minutes'
        or (
          pu.created_at < now() - interval '2 minutes'
          and pu.mp_preference_id is null
          and pu.stripe_session_id is null
        )
      )
  ),
  deleted as (
    delete from public.purchases pu
    using stale_purchases sp
    where pu.id = sp.id
    returning pu.id
  )
  select count(*) into cancelled_purchases from deleted;

  with released as (
    update public.photos ph
    set reserved_purchase_id = null, reserved_at = null
    where ph.is_sold = false
      and ph.reserved_purchase_id is not null
      and (
        ph.reserved_at is null
        or ph.reserved_at < now() - interval '20 minutes'
      )
      and (p_photo_ids is null or ph.id = any(p_photo_ids))
    returning ph.id
  )
  select count(*) into released_photos from released;

  return jsonb_build_object(
    'ok', true,
    'released_photos', released_photos,
    'cancelled_purchases', cancelled_purchases
  );
end;
$$;

create or replace function public.reserve_photos_for_checkout(
  p_purchase_id uuid,
  p_event_id uuid,
  p_photo_ids uuid[]
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  reserved_count int;
  expected_count int;
begin
  perform public.release_stale_checkout_reservations(p_photo_ids);

  expected_count := coalesce(array_length(p_photo_ids, 1), 0);
  if expected_count = 0 then
    return jsonb_build_object('ok', false, 'code', 'PHOTO_IDS_EMPTY');
  end if;

  with reserved as (
    update public.photos ph
    set
      reserved_purchase_id = p_purchase_id,
      reserved_at = now()
    where ph.id = any(p_photo_ids)
      and ph.event_id = p_event_id
      and ph.is_sold = false
      and (
        ph.reserved_purchase_id is null
        or ph.reserved_purchase_id = p_purchase_id
        or ph.reserved_at is null
        or ph.reserved_at < now() - interval '20 minutes'
      )
      and not exists (
        select 1
        from public.purchase_items pi
        join public.purchases pu on pu.id = pi.purchase_id
        where pi.photo_id = ph.id
          and pu.status = 'pending'
          and pu.id <> p_purchase_id
          and pu.created_at > now() - interval '20 minutes'
      )
    returning ph.id
  )
  select count(*) into reserved_count from reserved;

  if reserved_count <> expected_count then
    update public.photos
    set reserved_purchase_id = null, reserved_at = null
    where reserved_purchase_id = p_purchase_id
      and id = any(p_photo_ids);

    return jsonb_build_object(
      'ok', false,
      'code', 'PHOTOS_UNAVAILABLE',
      'reserved', reserved_count,
      'expected', expected_count
    );
  end if;

  return jsonb_build_object('ok', true, 'reserved', reserved_count);
end;
$$;

-- PASO 5: Verificar (debe listar columnas mp_*)
select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'purchases'
  and column_name like 'mp_%'
order by column_name;
