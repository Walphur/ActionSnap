-- Políticas RLS para que pilotos/atletas lean sus propias compras (defensa en profundidad).
-- La API /api/racer/* también valida auth + usa service role para joins complejos.

drop policy if exists "purchases_racer_select" on public.purchases;
create policy "purchases_racer_select" on public.purchases
  for select using (
    status = 'paid'
    and (
      user_id = auth.uid()
      or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

drop policy if exists "purchase_items_racer_select" on public.purchase_items;
create policy "purchase_items_racer_select" on public.purchase_items
  for select using (
    exists (
      select 1
      from public.purchases pu
      where pu.id = purchase_items.purchase_id
        and pu.status = 'paid'
        and (
          pu.user_id = auth.uid()
          or lower(pu.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
        )
    )
  );
