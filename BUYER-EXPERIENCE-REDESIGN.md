# Sprint 7 — Experiencia de Compra (Conversión)

Informe de implementación. Solo UI/UX; sin cambios en backend, APIs, lógica de checkout, Mercado Pago ni Stripe.

---

## Cambios realizados

### Fase 1 — Página del evento
- **EventHero** rediseñado: portada grande, badges (fecha, lugar, precio, fotos, pilotos), fotógrafo, descripción
- Botón **Compartir** (Web Share API o copiar link)
- Link a `/explorar` (corrige `/#eventos` roto)
- Conteo de pilotos vía query server-side a `photo_numbers` (sin nueva API)

### Fase 2 — Filtros
- **EventFilters** con `Input`, `Select`, `Button` DS
- Dorsal, color moto (motocross), **orden** (`?orden=` en URL, sort client-side)
- Sticky blur premium en mobile/desktop
- Categoría/clase: no existen en schema — no inventados

### Fase 3 — Galería
- **PhotoCard** nueva: hover, selección, favoritos (placeholder local), badge dorsal
- **Toolbar**: contador, seleccionar visibles, limpiar, checkout rápido
- Masonry `.buyer-gallery` responsive 2→4 columnas
- Pack dorsal banner con DS

### Fase 4 — Lightbox
- Sidebar con info (dorsal, colores, acciones)
- Navegación **anterior/siguiente**, teclado (←/→/Esc), swipe mobile
- Agregar/quitar compra y favorito desde lightbox

### Fase 5 — Carrito
- Barra fija inferior con total y CTA
- **CheckoutDrawer** rediseñado: miniaturas, subtotal, descuento pack, total
- Empty state en drawer si carrito vacío

### Fase 6 — Checkout
- Estilo Stripe: resumen limpio, email, captcha, trust badges (Lock, Shield)
- `Alert` para errores y pagos no disponibles
- Misma llamada `POST /api/checkout` — lógica intacta

### Fase 7 — Success
- **PurchaseSuccess** con `Card`, animaciones DS, skeleton loading
- Descargas HD, ZIP, Mis descargas, Mis compras, Explorar eventos

### Fase 8 — Empty states
- `EmptyState` en galería vacía, sin dorsal, sin filtros, error de carga

### Fase 9 — Responsive
- Hero full-bleed mobile, filtros sticky, cart bar safe-area, lightbox stack en mobile

### Fase 10 — Micro UX
- `Skeleton` en carga, `ds-hover-lift`, `ds-animate-fade-in/scale-in`, progress infinito en gallery

---

## Componentes reutilizados

| Componente | Uso |
|------------|-----|
| `Button` / `ButtonLink` | Filtros, checkout, success, hero |
| `Input` / `Select` | Filtros, checkout email |
| `Badge` | Hero meta, dorsales, trust |
| `Alert` | Checkout errores |
| `Card` / `CardBody` | Success page |
| `EmptyState` | Todos los vacíos |
| `Skeleton` | Hero fallback, gallery, success |
| `toast` | Foto agregada al carrito |

---

## CSS eliminado del flujo comprador (en uso)

| Legacy | Reemplazo |
|--------|-----------|
| `.photo-card*`, `.photo-masonry` | `.buyer-photo`, `.buyer-gallery` |
| `.event-filters-sticky`, `.search-panel` | `.buyer-filters` |
| `.checkout-bar`, `.checkout-drawer*` | `.buyer-cart-bar`, `.buyer-checkout-*` |
| `.purchase-success*` | `.buyer-success*` |
| `.photo-skeleton` | `Skeleton` + `.buyer-skeleton-card` |
| `btn-hero`, `glass-panel`, `field-input` | DS components |

**Nota:** reglas legacy en `globals.css` permanecen hasta Sprint 14; el flujo comprador ya no las usa.

---

## Archivos nuevos

```
src/app/styles/buyer.css
src/components/event/EventHeroShare.tsx
src/lib/sort-photos.ts
BUYER-EXPERIENCE-REDESIGN.md
```

## Archivos modificados

```
src/components/EventHero.tsx
src/components/EventFilters.tsx
src/components/EventPhotoGallery.tsx
src/components/PhotoCard.tsx
src/components/PhotoGrid.tsx
src/components/PhotoGridSkeleton.tsx
src/components/PhotoLightbox.tsx
src/components/checkout/CheckoutDrawer.tsx
src/components/checkout/PurchaseSuccess.tsx
src/app/eventos/[slug]/page.tsx
src/app/globals.css
ROADMAP-ACTION-SNAP-2.md
```

---

## Mejoras UX

1. Menos pasos: toolbar + barra de carrito siempre visible
2. Filtro dorsal sticky — encuentra y compra sin scroll infinito de contexto
3. Lightbox con navegación — revisar lote antes de pagar
4. Checkout tipo Stripe — confianza y claridad de precio
5. Success animado — refuerzo post-compra inmediato

## Mejoras conversión

1. Pack dorsal destacado con un tap
2. Toast al seleccionar foto
3. Trust signals en checkout (seguro, HD instantánea, MP/Stripe label)
4. Hero con precio y fotógrafo visibles — reduce fricción de confianza
5. Mobile-first: carrito fijo, swipe en lightbox, filtros sticky

---

## Pendientes Sprint 8

- Reglamento PDF (requiere campo en BD + API)
- Favoritos sincronizados (requiere backend)
- Filtros categoría/clase si se agregan al schema
- Migrar `ContactHelp` al DS
- Volver al evento desde success (necesita `eventSlug` en status API)
- Eliminar bloques `.photo-*` / `.checkout-*` de `globals.css`
- Galería explore (`/explorar`) al mismo nivel visual

---

## Restricciones respetadas

- Sin cambios en `/api/checkout`, webhooks MP/Stripe, reserva de fotos
- `packDiscount` sigue calculado server-side
- Turnstile y flujo de pago intactos
