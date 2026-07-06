-- PASO 2 de 3 — Función release (ejecutar DESPUÉS del Paso 1)

create or replace function public.release_purchase_reservation(p_purchase_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.photos set reserved_purchase_id = null, reserved_at = null
  where reserved_purchase_id = p_purchase_id and is_sold = false;
end;
$$;

create or replace function public.release_stale_checkout_reservations(p_photo_ids uuid[] default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare released_photos int; cancelled_purchases int;
begin
  with stale as (
    select id from public.purchases
    where status = 'pending' and created_at < now() - interval '20 minutes'
  ), deleted as (
    delete from public.purchases pu using stale s where pu.id = s.id returning pu.id
  ) select count(*) into cancelled_purchases from deleted;

  with released as (
    update public.photos ph set reserved_purchase_id = null, reserved_at = null
    where ph.is_sold = false and ph.reserved_purchase_id is not null
      and (ph.reserved_at is null or ph.reserved_at < now() - interval '20 minutes')
      and (p_photo_ids is null or ph.id = any(p_photo_ids))
    returning ph.id
  ) select count(*) into released_photos from released;

  return jsonb_build_object('ok', true, 'released_photos', released_photos, 'cancelled_purchases', cancelled_purchases);
end;
$$;

select 'Paso 2 OK' as resultado;
