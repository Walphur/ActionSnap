# QA Report — Sprint 9 RC1

**Fecha:** Julio 2026  
**Build:** `npm run build` ✓  
**Rutas generadas:** 53  
**TypeScript:** Sin errores  

---

## Metodología

Auditoría de código + verificación de build + revisión de flujos por rol (visitante, comprador, fotógrafo, admin). Correcciones aplicadas en este sprint documentadas abajo.

---

## Fase 1 — Auditoría

| Hallazgo | Severidad | Estado |
|----------|-----------|--------|
| Sin `not-found.tsx` — 404 genérico de Next.js | Alta | ✓ Corregido |
| `error.tsx` mostraba `npm run dev:clean` a usuarios | Alta | ✓ Corregido |
| Link roto `#eventos` en `/para-fotografos` | Alta | ✓ Corregido → `/explorar` |
| Placeholders "Logo" en landing | Media | ✓ Reemplazado por copy de beta |
| Paneles upload con clases legacy (`card`, `font-display`) | Media | ✓ Migrados al DS |
| Título de alerta "Error" en dashboard | Baja | ✓ → "Revisá esto" |
| Mensajes `?? "Error"` en componentes | Media | ✓ Copy específico |
| Empty states sin CTA en upload tab | Media | ✓ CTAs agregados |
| Miniaturas BulkTagger sin `aria-label` | Baja | ✓ Corregido |
| Botón "Crear evento" sin loading | Media | ✓ `creating` state |
| Guardar dorsal sin loading | Media | ✓ `saving` state |

---

## Fase 2 — QA funcional por rol

### Visitante
| Pantalla | Resultado |
|----------|-----------|
| Home `/` | ✓ Landing DS, eventos, CTAs |
| Explorar `/explorar` | ✓ Grid eventos, empty state |
| Para fotógrafos | ✓ Link explorar corregido |
| FAQ, Contacto, Precios, Nosotros | ✓ Marketing DS |
| Legales | ✓ |
| 404 | ✓ Página branded |

### Comprador
| Paso | Resultado |
|------|-----------|
| Evento `/eventos/[slug]` | ✓ Galería, filtro dorsal |
| Selección fotos | ✓ |
| Checkout drawer | ✓ Loading en pago |
| Compra exitosa | ✓ Estados loading/pending/paid/error |
| Descargas | ✓ ZIP + individual, feedback prompt |
| Mis compras | ✓ Magic link, descarga |

### Fotógrafo
| Paso | Resultado |
|------|-----------|
| Registro / Login | ✓ Loading en submit |
| Checklist onboarding | ✓ 8 pasos auto-detectados |
| Mercado Pago | ✓ Card destacada si desconectado |
| Crear evento | ✓ Loading agregado RC1 |
| Portada | ✓ DS + loading + mensajes claros |
| Subir fotos | ✓ Progress bar |
| Etiquetar manual | ✓ Loading en guardar |
| Publicar | ✓ EditEventPanel DS |
| Compartir | ✓ Link, WA, FB, IG, QR |
| Primera venta | ✓ Celebración + feedback |

### Administrador
| Paso | Resultado |
|------|-----------|
| Login `/admin/login` | ✓ |
| Dashboard métricas | ✓ |
| Tabla fotógrafos/eventos | ✓ |

---

## Fase 3 — Performance

| Item | Estado |
|------|--------|
| Imágenes con `loading="lazy"` en galería/descargas/portada | ✓ |
| Bundle fotógrafo ~37 kB (ruta) | Aceptable |
| Sin imports pesados nuevos | ✓ |
| CSS muerto eliminado en sprint 7.5B | ✓ |

No se realizaron cambios de lógica que alteren comportamiento.

---

## Fase 4 — Responsive

| Breakpoint | Verificación |
|------------|--------------|
| Desktop 1280+ | ✓ Grids dashboard, landing |
| Notebook 1024 | ✓ Tab bar oculta en md+ |
| Tablet 768 | ✓ Checkout drawer, cards |
| Mobile 375 | ✓ Tab bar, auth, checkout |

Sin scroll horizontal detectado en componentes DS principales.

---

## Fase 5 — Accesibilidad

| Item | Estado |
|------|--------|
| Focus visible en botones DS | ✓ |
| `aria-label` en icon-only críticos | ✓ Mejorado BulkTagger |
| `role="tablist"` en shell fotógrafo | ✓ |
| Labels en inputs DS | ✓ |
| Alertas con títulos descriptivos | ✓ Mejorado RC1 |
| Feedback con `aria-pressed` | ✓ |

---

## Fase 6 — Mensajes

| Antes | Después |
|-------|---------|
| "Error" (alert dashboard) | "Revisá esto" + mensaje específico |
| "Ocurrió un error. Intentá de nuevo." | "No pudimos completar la acción..." |
| "Error al subir" | Mensaje con formato y causa |
| `error.tsx` dev instructions | Copy de soporte hola@actionsnap.store |
| `?? "Error"` en paneles | Mensajes por acción (portada, evento, dorsal) |

---

## Fase 7 — Loading states

| Acción | Loading |
|--------|---------|
| Crear evento | ✓ RC1 |
| Subir fotos | ✓ Progress |
| Guardar dorsal | ✓ RC1 |
| Guardar portada | ✓ RC1 |
| Editar evento | ✓ RC1 |
| Ver estadísticas | ✓ RC1 |
| Checkout pagar | ✓ |
| Login/registro | ✓ |
| MP guardar manual | ✓ |

---

## Fase 8 — Empty states

Todas las pantallas principales tienen EmptyState con descripción y CTA. Verificadas en sprint 8 + mejoras RC1 en upload tab.

---

## Fase 9 — Microinteracciones

| Elemento | Estado |
|----------|--------|
| Hover en cards DS | ✓ |
| Pressable buttons | ✓ |
| Skeletons en hero dashboard | ✓ |
| Toasts (sonner) | ✓ |
| Tabs fotógrafo | ✓ |
| Checkout drawer animation | ✓ |
| Success scale-in | ✓ |

---

## Fase 11 — Feedback

| Trigger | Componente | Persistencia |
|---------|------------|--------------|
| Primera venta | `FeedbackPrompt` en overview | localStorage |
| Primera compra | `FeedbackPrompt` en compra exitosa | localStorage |
| Primera descarga | `DownloadsFeedback` en descargas | localStorage |

Envío automático: **no implementado** (por diseño RC1).

---

## Resultado final

| Criterio | Estado |
|----------|--------|
| `npm run build` | ✓ |
| TypeScript | ✓ |
| Links rotos conocidos | ✓ Corregidos |
| Pantallas vacías sin CTA | ✓ |
| Componentes legacy visibles en rutas activas | ✓ Reducidos |
| Listo para beta cerrada | ✓ |
