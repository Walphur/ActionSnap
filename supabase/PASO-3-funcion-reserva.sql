-- PASO 3 de 3 — Función reserva checkout (ejecutar DESPUÉS del Paso 2)

create or replace function public.reserve_photos_for_checkout(
  p_purchase_id uuid, p_event_id uuid, p_photo_ids uuid[]
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare reserved_count int; expected_count int;
begin
  perform public.release_stale_checkout_reservations(p_photo_ids);
  expected_count := coalesce(array_length(p_photo_ids, 1), 0);
  if expected_count = 0 then return jsonb_build_object('ok', false, 'code', 'PHOTO_IDS_EMPTY'); end if;

  with reserved as (
    update public.photos ph set reserved_purchase_id = p_purchase_id, reserved_at = now()
    where ph.id = any(p_photo_ids) and ph.event_id = p_event_id and ph.is_sold = false
      and (ph.reserved_purchase_id is null or ph.reserved_purchase_id = p_purchase_id
           or ph.reserved_at is null or ph.reserved_at < now() - interval '20 minutes')
      and not exists (
        select 1 from public.purchase_items pi
        join public.purchases pu on pu.id = pi.purchase_id
        where pi.photo_id = ph.id and pu.status = 'pending' and pu.id <> p_purchase_id
          and pu.created_at > now() - interval '20 minutes'
      )
    returning ph.id
  ) select count(*) into reserved_count from reserved;

  if reserved_count <> expected_count then
    update public.photos set reserved_purchase_id = null, reserved_at = null
    where reserved_purchase_id = p_purchase_id and id = any(p_photo_ids);
    return jsonb_build_object('ok', false, 'code', 'PHOTOS_UNAVAILABLE', 'reserved', reserved_count, 'expected', expected_count);
  end if;
  return jsonb_build_object('ok', true, 'reserved', reserved_count);
end;
$$;

select 'Paso 3 OK — checkout listo' as resultado;
