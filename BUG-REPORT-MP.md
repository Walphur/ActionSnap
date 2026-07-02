# BUG Report — Sprint 11.1 (Hero + Mercado Pago)

Fecha: 2026-07-01  
Objetivo: corregir bugs críticos pre-beta sin nuevas features ni rediseño.

---

## BUG 1 — Hero del evento (`/eventos/[slug]`)

### Síntoma
- Imagen desplazada a la izquierda
- Franja negra a la derecha
- Contenido visualmente demasiado arriba
- Pérdida de alineación con el resto de la página

### Causa exacta
Conflicto CSS entre `aspect-ratio` + `max-height: 520px` en `.buyer-hero__cover`. En viewports anchos, el navegador limitaba la altura pero mantenía el ancho al 100%, rompiendo la proporción del contenedor. La imagen con `inset: 0` + `object-fit: cover` no cubría correctamente el área sobrante (fondo negro visible).

Además, en desktop el hero no compartía el mismo `max-width: 72rem` y padding horizontal que el contenido inferior.

### Archivos afectados
- `src/app/styles/buyer.css`

### Cambios realizados
- Reemplazo de `aspect-ratio` + `max-height` por `height: clamp(...)` proporcional al viewport (16:10 mobile, 21:9 desktop).
- Imagen con patrón cinematic (`translate(-50%, -50%)`, `min-width/min-height: 100%`) y `object-position: center`.
- Hero en desktop alineado a `72rem` con padding lateral igual al resto del buyer layout.
- `background: #000` en el cover como fallback mientras carga.

### Pruebas
- `npm run build` — compila sin errores.
- Verificación estática del layout CSS (clamp + cinematic cover elimina el gap de aspect-ratio).

### Resultado
Hero ocupa el ancho disponible, imagen centrada, sin bandas negras laterales, contenido anclado al pie del cover.

---

## BUG 2 — Checkout Mercado Pago ("No se pudo crear la compra")

### Síntoma
Al pulsar "Pagar con Mercado Pago" el usuario solo veía un mensaje genérico.

### Causa exacta
1. **API** (`POST /api/checkout`): en fallo de `INSERT` en `purchases`, la respuesta siempre era `"No se pudo crear la compra"` sin propagar el error de Supabase (código/mensaje).
2. **Cliente** (`PhotoGrid`): solo mostraba `data.error`, ignorando `hint` y `details`.
3. Errores de **preferencia MP** no tenían manejo dedicado; caían en el catch genérico.

Causas probables en producción (según código auditado):
- Migraciones Supabase incompletas (columnas `payment_provider`, `photographer_id`, etc.) → código PostgreSQL `42703`.
- Fotógrafo sin `mp_receiver_id` → ya devolvía mensaje claro (422).
- `MERCADOPAGO_ACCESS_TOKEN` inválido → fallo al crear preference (ahora con mensaje explícito).

### Archivos afectados
- `src/app/api/checkout/route.ts`
- `src/components/PhotoGrid.tsx`
- `src/lib/mercadopago.ts`

### Cambios realizados
- `describePurchaseInsertError()` mapea códigos SQL comunes a mensajes legibles.
- Respuesta API incluye `details.dbMessage` y `details.dbCode` en errores de DB.
- Bloque try/catch dedicado para `createMercadoPagoPreference` con código `PAYMENT_PROVIDER_ERROR` y hint contextual.
- `PhotoGrid` concatena `error`, `hint` y `details.dbMessage` para el usuario.
- Preference MP envuelve errores del SDK con mensaje descriptivo.

### Pruebas
- `npm run build` — OK.
- Auditoría de flujo: CheckoutDrawer → PhotoGrid.pay → POST /api/checkout → validaciones → purchase → reserve → preference → redirect.

### Resultado
El comprador ve el motivo real (DB, MP, fotógrafo sin MP, evento no publicado, etc.) en lugar del mensaje genérico.

---

## BUG 3 — OAuth Mercado Pago

### Síntoma
"La aplicación no está preparada para conectarse a Mercado Pago"

### Causa exacta (auditoría)
1. **Redirect URI** debe ser exactamente `https://actionsnap.store/api/mercadopago/callback` en el panel MP (app `233244417` / `8494145336792025`).
2. **PKCE**: el servidor enviaba PKCE por defecto (`true`) mientras en el panel MP estaba en **No** → posible rechazo en autorización.
3. **Credenciales incompletas en Render**: solo Access Token + Public Key no alcanzan; faltaban `MERCADOPAGO_CLIENT_ID` y `MERCADOPAGO_CLIENT_SECRET` de la misma app.
4. Confusión con archivo Google Cloud (`service_account`) que no es Mercado Pago.

### Archivos afectados
- `src/lib/mercadopago-oauth.ts` — PKCE default `false`
- `src/lib/mercadopago.ts` — `getMercadoPagoOAuthPublicConfig()` ampliado
- `src/components/photographer/dashboard/DashboardMpCard.tsx` — alertas OAuth/redirect
- `src/app/api/mercadopago/setup/route.ts` (existente)
- `COMO-CONFIGURAR-MERCADOPAGO.md`

### Cambios realizados
- PKCE desactivado por defecto; activar con `MERCADOPAGO_OAUTH_PKCE=true` solo si está habilitado en panel MP.
- Endpoint setup expone: `redirectUri`, `expectedRedirectUri`, `redirectUriMismatch`, `oauthReady`, flags de credenciales.
- UI muestra diferencias de Redirect URI y credenciales faltantes.

### Configuración requerida en Render (manual)
```
NEXT_PUBLIC_APP_URL=https://actionsnap.store
MERCADOPAGO_CLIENT_ID=233244417
MERCADOPAGO_CLIENT_SECRET=<de la misma app>
MERCADOPAGO_ACCESS_TOKEN=<producción, misma app>
MERCADOPAGO_OAUTH_PKCE=false
```

### Resultado
Integración OAuth alineada con panel MP; diagnóstico visible en Ajustes del fotógrafo.

---

## BUG 4 — Flujo completo Mercado Pago (auditoría)

| Paso | Estado código | Notas |
|------|---------------|-------|
| Crear cuenta fotógrafo | OK | Auth + profiles |
| Conectar MP OAuth | OK tras config | Requiere CLIENT_ID + SECRET + redirect URI |
| Guardar credenciales | OK | `mp_receiver_id` / `mp_seller_id` en profiles |
| Crear evento | OK | — |
| Publicar | OK | `is_published=true` requerido en checkout |
| Comprar | Mejorado | Mensajes de error claros |
| Crear preference | Mejorado | try/catch + mensaje MP |
| Redirect a MP | OK | `init_point` |
| Volver desde MP | OK | `/compra/exito?purchase_id=...` |
| Webhook confirmar | OK | `/api/webhooks/mercadopago` |
| Descargar | OK | token en success URL |

### Bloqueadores externos (no código)
- Render sin las 3 credenciales MP de la misma app.
- Panel MP sin Redirect URI guardada.
- Migraciones Supabase no ejecutadas en producción.

---

## Build

```
npm run build — exit 0
```

## Commit

`Sprint 11.1: Fix hero + Mercado Pago critical bugs`
