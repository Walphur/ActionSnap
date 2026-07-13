-- Sprint 11.3: liberar checkout MP abandonado (< 20 min) y reservas huerfanas
-- Ejecutar en Supabase SQL Editor (produccion)

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
          pu.created_at < now() - interval '1 minute'
          and pu.mp_preference_id is null
          and pu.stripe_session_id is null
        )
        or (
          pu.created_at < now() - interval '5 minutes'
          and (pu.mp_preference_id is not null or pu.stripe_session_id is not null)
        )
      )
  ),
  unlocked as (
    update public.photos ph
    set reserved_purchase_id = null, reserved_at = null
    from stale_purchases sp
    where ph.reserved_purchase_id = sp.id
      and ph.is_sold = false
      and (p_photo_ids is null or ph.id = any(p_photo_ids))
    returning ph.id
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
        or not exists (
          select 1 from public.purchases pu
          where pu.id = ph.reserved_purchase_id
            and pu.status = 'pending'
        )
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
