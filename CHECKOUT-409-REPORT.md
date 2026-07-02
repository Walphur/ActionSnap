# CHECKOUT-409-REPORT — Sprint 11.2

## Síntoma

`POST /api/checkout` → **409 Conflict**

```json
{
  "error": "Una o más fotos ya no están disponibles. Actualizá la galería e intentá de nuevo.",
  "code": "PHOTOS_UNAVAILABLE"
}
```

Mercado Pago nunca se llegaba a invocar: el fallo ocurre en **`reservePhotosForCheckout`**, después de crear la compra `pending` y antes de insertar `purchase_items` / preference.

---

## Causa exacta

Reservas de checkout **fantasma** bloqueaban fotos que seguían visibles en la galería (`is_sold = false`).

### 1. Bug SQL en `reserve_photos_for_checkout`

Condición original:

```sql
ph.reserved_at < now() - interval '20 minutes'
```

En PostgreSQL, si `reserved_at` es **NULL** la comparación devuelve **NULL** (no `true`). Fotos con `reserved_purchase_id` seteado pero `reserved_at` NULL quedaban **bloqueadas para siempre**.

### 2. Compras `pending` abandonadas

Intentos de checkout previos dejaban:

- `purchases.status = 'pending'` (sin cancelar)
- `purchase_items` asociados (< 20 min)
- `photos.reserved_purchase_id` apuntando a esa compra

El `NOT EXISTS` del RPC bloqueaba nuevos intentos sobre la misma foto mientras existiera otra compra pending reciente, aunque el usuario ya hubiera abandonado el flujo.

### 3. Sin cleanup proactivo

No había liberación automática de reservas expiradas **antes** de reservar. El fallback TypeScript limpiaba TTL de 20 min, pero el RPC en producción no trataba `reserved_at` NULL ni cancelaba pending viejos.

---

## Archivo responsable

| Archivo | Rol |
|---------|-----|
| `supabase/sprint2-checkout-atomic.sql` | RPC `reserve_photos_for_checkout` con bug NULL |
| `src/lib/checkout-reserve.ts` | Orquestación reserva / fallback |
| `src/app/api/checkout/route.ts` | Crea purchase → reserva → items → MP |

---

## Corrección aplicada

### TypeScript (`src/lib/checkout-reserve.ts`)

- `releaseStaleCheckoutReservations()` antes de cada reserva
- Limpia fotos con reserva expirada o `reserved_at` NULL
- Elimina compras `pending` > 20 min y libera sus locks
- Reintento automático tras cleanup si el primer intento falla con 409
- `diagnoseReservationConflicts()` devuelve motivo por foto en la respuesta API (sin logs temporales en consola)

### SQL (`supabase/sprint-11.2-checkout-reservations.sql`)

- Nueva función `release_stale_checkout_reservations(p_photo_ids)`
- `reserve_photos_for_checkout` corregida: `or ph.reserved_at is null`
- Cleanup automático al inicio del RPC

### Checkout route

- Libera reserva antes de borrar purchase en fallo 409
- Borra `purchase_items` explícitamente en rollback MP / catch

### Hero (`src/app/styles/buyer.css`)

- Más aire bajo header (`padding-top` con `--space-16`)
- Más margen inferior del hero
- Contenido anclado abajo con padding inferior mayor
- Cover un poco más alto (`min-height` 300/360)

---

## Acción manual en Supabase (recomendada)

Ejecutar en **SQL Editor**:

```
supabase/sprint-11.2-checkout-reservations.sql
```

El fallback TypeScript ya mitiga el problema aunque no corras el SQL, pero el RPC corregido es la solución definitiva en producción.

---

## Pruebas

- `npm run build` — compila sin errores
- Flujo auditado: checkout → reserve → cleanup → retry → items → MP preference

---

## Resultado esperado

- Fotos disponibles ya no quedan bloqueadas por reservas expiradas
- Reintentos de checkout del mismo usuario funcionan
- 409 solo cuando la foto está realmente vendida o hay checkout concurrente legítimo (< 20 min)
