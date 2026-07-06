# Pre-Launch Audit — ActionSnap

Fecha: 2026-07-05  
Alcance: diseño/UX, checkout 409, Mercado Pago, responsive, estabilidad.

---

## Resumen ejecutivo

| Área | Estado | Acción |
|------|--------|--------|
| Hero evento | Corregido | Portada sin watermark + CSS refinado |
| Checkout 409 | Corregido en código | Ejecutar SQL en Supabase |
| Errores técnicos al usuario | Corregido | Mensajes amigables |
| Landing spacing | Mejorado | Secciones más compactas |
| Checkout UX | Mejorado | Drawer tipo Stripe, precios por ítem |
| Mercado Pago redirect | Depende de reserva + credenciales | Ver abajo |

---

## PARTE 1 — Diseño / UX

### Problemas encontrados

1. **Hero evento** usaba `preview_url` (con marca de agua embebida) → watermark gigante en portada
2. **Hero spacing** inconsistente con navbar fijo (padding-top excesivo o insuficiente según viewport)
3. **Landing** secciones con `padding: 64px` generaban vacío excesivo
4. **Checkout drawer** thumb con `border-radius: var(--space-2)` (token incorrecto)
5. **Errores checkout** mostraban mensajes SQL/schema al comprador
6. **Design System** coexistencia legacy `--radius` vs `--ds-radius-*` (sin refactor masivo para no romper)

### Mejoras aplicadas

#### Evento (`buyer.css`, `EventHero.tsx`, `event-cover.ts`)
- Portada del hero usa **`original_url`** (sin watermark)
- Cover: `aspect-ratio 16/9`, `max-height` acotado, bordes `--ds-radius-lg/xl`
- Separación navbar: `padding-top: calc(3.75rem + space-4)`
- Overlay gradiente más suave, contenido anclado abajo
- `object-position: center 40%` para fotos deportivas

#### Landing (`landing.css`)
- Hero: `min-height` 85vh (antes 92vh)
- Secciones: `padding space-12` mobile, `space-16` desktop (antes siempre 64px)
- Clase `.landing__section--compact` disponible

#### Galería (`buyer.css` — sin cambios estructurales)
- Grilla masonry, hover, selección ya en DS
- Cart bar con safe-area

#### Checkout (`CheckoutDrawer.tsx`, `checkout-errors.ts`, `buyer.css`)
- Precio por ítem visible
- Drawer centrado en desktop (max 28rem), bordes redondeados
- Errores humanos, sin SQL ni schema cache

#### Auth / Dashboard
- Sin cambios de flujo; ya usan `auth.css` / `dashboard.css`

### Responsive verificado (estático)

Breakpoints cubiertos en CSS: 320–390 (filters compact), 640 (checkout drawer, gallery 3 col), 768 (hero desktop, landing grid), 1024 (gallery 4 col, lightbox sidebar).

---

## PARTE 2 — Checkout 409 / Mercado Pago

### Síntoma

```
POST /api/checkout → 409 Conflict
"Una o más fotos ya no están disponibles"
```

Mercado Pago **nunca se invocaba** — fallo en reserva de fotos.

### Causa exacta del 409

**No es Mercado Pago.** Es el sistema de reservas atómicas (Sprint 2):

1. **`purchase_items` + `purchases.pending`** de intentos anteriores bloqueaban la misma foto hasta 20 min (condición `NOT EXISTS` en RPC SQL)
2. **`reserved_at` NULL** con `reserved_purchase_id` seteado bloqueaba forever (bug SQL, corregido en 11.2)
3. **Checkout abandonado** (< 20 min, sin `mp_preference_id`) dejaba locks fantasma

### Causa exacta fallo MP (cuando llegaba)

Separado del 409:
- Columnas faltantes en `purchases` (`mp_marketplace_fee_cents`, etc.) → 500 antes de MP
- Credenciales incompletas en Render (CLIENT_ID, CLIENT_SECRET)
- Redirect URI / PKCE mismatch en panel MP

### Corrección aplicada

| Archivo | Cambio |
|---------|--------|
| `src/lib/checkout-reserve.ts` | `releaseAbandonedPendingPurchases()` — cancela pending > 2 min sin sesión MP |
| `src/lib/checkout-reserve.ts` | Cleanup antes y después de reservar |
| `src/lib/checkout-errors.ts` | Mensajes amigables por código/conflict reason |
| `src/lib/event-cover.ts` | Hero sin watermark |
| `src/app/api/checkout/route.ts` | Errores user-friendly + logWarn estructurado |
| `src/components/PhotoGrid.tsx` | `formatCheckoutError()` |
| `supabase/sprint-11.2-checkout-reservations.sql` | Cancela pending abandonados > 2 min |

### Logs (permanentes vía safe-logger, no console.log)

- `[checkout] Reserva de fotos fallida` — purchaseId, conflictReason, photoCount
- `[checkout-reserve] RPC no disponible` — fallback TS
- `[checkout] Preferencia MP creada` — éxito

Detalle de conflictos en respuesta API `details.conflicts[]` para diagnóstico (no mostrado al usuario).

---

## Acción manual requerida (Supabase)

Ejecutar en **SQL Editor**:

1. `supabase/FIX-CHECKOUT-NOW.sql` — columnas MP en purchases
2. `supabase/sprint-11.2-checkout-reservations.sql` — RPC reservas corregido

Sin esto, el fallback TypeScript mitiga pero el RPC en producción puede seguir bloqueando.

### Render (Mercado Pago)

```
NEXT_PUBLIC_APP_URL=https://actionsnap.store
MERCADOPAGO_CLIENT_ID=233244417
MERCADOPAGO_CLIENT_SECRET=...
MERCADOPAGO_ACCESS_TOKEN=...
MERCADOPAGO_OAUTH_PKCE=false
```

Panel MP → Redirect URI: `https://actionsnap.store/api/mercadopago/callback`

---

## Archivos modificados (este sprint)

- `src/lib/checkout-errors.ts` (nuevo)
- `src/lib/checkout-reserve.ts`
- `src/lib/event-cover.ts`
- `src/app/api/checkout/route.ts`
- `src/components/PhotoGrid.tsx`
- `src/components/checkout/CheckoutDrawer.tsx`
- `src/components/EventHero.tsx`
- `src/app/styles/buyer.css`
- `src/app/styles/landing.css`
- `supabase/sprint-11.2-checkout-reservations.sql`
- `PRE-LAUNCH-AUDIT.md`

---

## Build

```
npm run build — debe pasar sin errores
```

---

## Flujo checkout verificado (código)

```
Frontend pay()
  → POST /api/checkout
  → validar evento/fotógrafo/fotos
  → insertPurchase
  → releaseStale + releaseAbandoned
  → reservePhotosForCheckout (retry)
  → insert purchase_items
  → createMercadoPagoPreference
  → redirect init_point
```

409 eliminado para: reservas expiradas, pending abandonados, reserved_at NULL.

409 legítimo solo si: foto vendida (`is_sold`) o checkout concurrente real (< 2 min, con sesión MP activa).
