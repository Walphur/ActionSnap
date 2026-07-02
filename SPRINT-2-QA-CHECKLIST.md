# Sprint 2 — Checklist QA manual (casos críticos)

Marcar cuando se verifique en staging/producción.

## Auth

- [ ] Registro fotógrafo (`/fotografos/registro`)
- [ ] Login fotógrafo (`/fotografos/login`)
- [ ] Logout fotógrafo
- [ ] Registro/login piloto (`/mis-compras`)
- [ ] Logout piloto
- [ ] Login admin (`/admin/login`)

## Eventos (fotógrafo)

- [ ] Crear evento publicado
- [ ] Crear evento borrador
- [ ] Editar título, precio, pack discount
- [ ] Publicar / despublicar evento
- [ ] Eliminar evento sin ventas
- [ ] Intentar acceder a evento de otro fotógrafo (debe fallar 403/404)

## Upload y watermark

- [ ] Subir JPG al evento propio
- [ ] Rechazo de archivo > 25 MB
- [ ] Rechazo de upload a evento ajeno
- [ ] Watermark visible en preview público
- [ ] Etiquetado manual dorsal + color

## Mercado Pago

- [ ] OAuth Connect desde panel fotógrafo
- [ ] Checkout bloqueado si fotógrafo sin MP conectado
- [ ] Checkout bloqueado si fotógrafo suspendido (`is_active=false`)
- [ ] Pago MP exitoso → compra `paid`
- [ ] Webhook MP marca compra pagada
- [ ] Split 20/80 registrado en `purchases`

## Stripe

- [ ] Checkout Stripe crea sesión
- [ ] Redirect `/compra/exito?session_id=...&token=...`
- [ ] Polling `/api/purchases/status?session_id=...` devuelve descargas
- [ ] Webhook Stripe marca compra pagada

## Checkout e integridad

- [ ] Descuento pack calculado solo server-side (ignorar `packDiscount` del cliente)
- [ ] Pack inválido (fotos sueltas) cobra precio full
- [ ] Foto vendida no aparece en galería pública
- [ ] Checkout con foto ya vendida → 409 claro
- [ ] Dos compras simultáneas misma foto → solo una completa
- [ ] Compra abandonada libera reserva (~20 min)

## Descargas

- [ ] Email post-compra incluye `token` en URL
- [ ] `/descargas?purchase_id=&token=` funciona
- [ ] `/descargas?session_id=` funciona (Stripe)
- [ ] `/descargas?purchase_id=` sin token → bloqueado
- [ ] Compra `pending` no permite descarga HD
- [ ] ZIP requiere token firmado válido
- [ ] Token expirado → 403

## Roles

- [ ] Admin: métricas, suspender fotógrafo
- [ ] Fotógrafo: stats sin revenue duplicado
- [ ] Piloto: descarga solo fotos compradas (`/api/racer/download`)
- [ ] Fotógrafo A no puede taggear fotos de fotógrafo B

## Regresión rápida

- [ ] Landing carga eventos publicados
- [ ] Galería filtra por dorsal
- [ ] Explorar lista eventos multi-deporte
- [ ] `npm run build` sin errores

## SQL requerido (una vez)

- [ ] Ejecutado `supabase/sprint2-checkout-atomic.sql` en Supabase producción
