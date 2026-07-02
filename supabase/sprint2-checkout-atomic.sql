-- Sprint 2: reserva atómica de fotos en checkout y cierre transaccional al pagar.
-- Ejecutar en Supabase SQL Editor (producción + staging).

alter table public.photos
  add column if not exists reserved_purchase_id uuid references public.purchases(id) on delete set null;

alter table public.photos
  add column if not exists reserved_at timestamptz;

create index if not exists photos_reserved_purchase_id_idx
  on public.photos(reserved_purchase_id)
  where reserved_purchase_id is not null;

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

create or replace function public.finalize_purchase_photos(p_purchase_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  sold_count int;
  expected_count int;
begin
  select count(*) into expected_count
  from public.purchase_items
  where purchase_id = p_purchase_id;

  if expected_count = 0 then
    return jsonb_build_object('ok', false, 'code', 'NO_ITEMS');
  end if;

  with sold as (
    update public.photos ph
    set
      is_sold = true,
      reserved_purchase_id = null,
      reserved_at = null
    from public.purchase_items pi
    where pi.purchase_id = p_purchase_id
      and pi.photo_id = ph.id
      and ph.is_sold = false
      and (
        ph.reserved_purchase_id = p_purchase_id
        or ph.reserved_purchase_id is null
      )
    returning ph.id
  )
  select count(*) into sold_count from sold;

  if sold_count <> expected_count then
    return jsonb_build_object(
      'ok', false,
      'code', 'PHOTO_SALE_CONFLICT',
      'sold', sold_count,
      'expected', expected_count
    );
  end if;

  return jsonb_build_object('ok', true, 'sold', sold_count);
end;
$$;

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
