-- Borrar eventos de prueba / huérfanos (ejecutar en Supabase SQL Editor)
-- Ajustá los slugs según lo que veas en la tabla events.

-- Ver eventos candidatos
select id, slug, title, photographer_id, is_published, created_at
from public.events
where slug ilike '%prueba%'
   or title ilike '%prueba%'
order by created_at desc;

-- Borrar fotos relacionadas y luego el evento (reemplazá el slug)
do $$
declare
  target_slug text := 'prueba20262';
  event_uuid uuid;
  photo_ids uuid[];
begin
  select id into event_uuid from public.events where slug = target_slug limit 1;
  if event_uuid is null then
    raise notice 'No existe evento con slug %', target_slug;
    return;
  end if;

  select array_agg(id) into photo_ids from public.photos where event_id = event_uuid;

  if photo_ids is not null then
    delete from public.purchase_items where photo_id = any(photo_ids);
    delete from public.photo_numbers where photo_id = any(photo_ids);
    delete from public.photos where id = any(photo_ids);
  end if;

  delete from public.events where id = event_uuid;
  raise notice 'Evento % eliminado', target_slug;
end $$;
