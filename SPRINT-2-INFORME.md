# Sprint 2 — Informe: Integridad del negocio y bugs críticos

**Fecha:** 2026-05-31  
**Commit:** `b2536df`  
**Estado:** Completado en código — requiere ejecutar SQL en Supabase

---

## Resumen ejecutivo

Sprint 2 cerró los vectores de pérdida de dinero e inconsistencia de datos más urgentes: doble venta, precios manipulables desde el cliente, checkout sin validaciones MP, Stripe roto en `/compra/exito`, fotos vendidas visibles, stats con revenue inflado, y ownership débil en APIs de fotógrafo.

No se modificó diseño ni Design System. El único cambio de frontend fue estrictamente necesario: soporte de `session_id` en `PurchaseSuccess` para el flujo Stripe.

---

## Bugs encontrados

| ID | Severidad | Descripción |
|----|-----------|-------------|
| B1 | P0 | Race condition: dos checkouts simultáneos podían vender la misma foto |
| B2 | P0 | `packDiscount` enviado por el cliente se aplicaba sin validar reglas de pack |
| B3 | P0 | Checkout MP no validaba fotógrafo activo antes de preferencia |
| B4 | P0 | Stripe redirigía con `session_id` pero `/compra/exito` no lo consultaba |
| B5 | P0 | Galería pública listaba fotos `is_sold=true` |
| B6 | P1 | `fulfill-purchase` marcaba `paid` antes de verificar conflicto de inventario |
| B7 | P1 | Stats fotógrafo sumaba `amount_cents` por cada ítem → revenue duplicado |
| B8 | P1 | `/api/photographer/photos` y `/stats` sin verificación de ownership |
| B9 | P2 | Errores de API inconsistentes (sin `code` / `success`) |
| B10 | P2 | Logs podían incluir contexto sensible sin sanitizar |

---

## Bugs corregidos

| ID | Solución |
|----|----------|
| B1 | Reserva atómica vía RPC `reserve_photos_for_checkout` + fallback TS; `finalize_purchase_photos` al pagar |
| B2 | Precio 100% server-side: `resolvePackDiscountPercent` + `calculateCheckoutPricing`; se ignora `packDiscount` del body |
| B3 | Validaciones previas: evento publicado, fotógrafo activo, MP conectado, fotos disponibles, monto > 0 |
| B4 | `resolvePurchaseFromStripeSession` + polling con `session_id` en `/api/purchases/status` y `PurchaseSuccess` |
| B5 | Filtro `.eq("is_sold", false)` en `/api/events/[slug]/photos` |
| B6 | `markPurchasePaid` solo marca `paid` si `finalizePurchasePhotos` tiene éxito |
| B7 | Revenue = suma de `purchases` únicos pagados del evento (no por ítem) |
| B8 | `assertEventOwnedByPhotographer` en photos/stats |
| B9 | Helper `api-response.ts` con `{ success, error, code, details?, hint? }` en checkout |
| B10 | `safe-logger.ts` con redacción de claves sensibles |

---

## Archivos modificados / creados

### Nuevos

- `supabase/sprint2-checkout-atomic.sql`
- `src/lib/api-response.ts`
- `src/lib/safe-logger.ts`
- `src/lib/checkout-pricing.ts`
- `src/lib/checkout-reserve.ts`
- `src/lib/stripe-purchase.ts`
- `SPRINT-2-QA-CHECKLIST.md`
- `SPRINT-2-INFORME.md`

### Modificados

- `src/app/api/checkout/route.ts`
- `src/lib/fulfill-purchase.ts`
- `src/app/api/purchases/status/route.ts`
- `src/app/descargas/page.tsx`
- `src/components/checkout/PurchaseSuccess.tsx`
- `src/app/api/events/[slug]/photos/route.ts`
- `src/app/api/photographer/photos/route.ts`
- `src/app/api/photographer/stats/route.ts`
- `ROADMAP-ACTION-SNAP-2.md`

---

## Riesgos residuales

1. **SQL no ejecutado:** Sin `sprint2-checkout-atomic.sql` en Supabase, la reserva usa fallback TS (menos robusto en alta concurrencia).
2. **Reservas abandonadas:** Compras `pending` reservan fotos ~20 min; no hay cron de limpieza automática.
3. **Pago recibido + conflicto inventario:** Si `finalize_purchase_photos` falla post-pago, requiere intervención manual (logueado).
4. **Carrito stale:** Usuario con fotos seleccionadas antes de venta ajena recibe 409 al pagar (esperado).

---

## Casos pendientes

- Nav `/#buscar` rota → Sprint 5 (Landing)
- Cron para liberar reservas stale
- Migrar todas las APIs a formato `{ success, code }`
- Tests E2E automatizados
- Reembolso automático si pago OK pero inventario falla

---

## Acción requerida

Ejecutar en Supabase SQL Editor:

`supabase/sprint2-checkout-atomic.sql`

---

## Recomendaciones Sprint 3

1. Middleware de auth unificado
2. Extraer `services/checkout.ts`
3. `ARCHITECTURE.md` con flujos reserva → pago → fulfill
4. Cron job para reservas huérfanas
5. Adoptar `api-response.ts` en todas las rutas
6. Documentar `storage.ts` vs `photo-storage.ts`

---

## Verificación

- `npm run build` — pasa
- Listo para Sprint 3 (Arquitectura)
