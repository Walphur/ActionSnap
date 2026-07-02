# Sprint 10 — Beta Ready

**Fecha:** 2026-07-02  
**Objetivo:** Convertir ActionSnap en un producto listo para fotógrafos reales, reduciendo fricción sin agregar features nuevas ni tocar backend/APIs.

---

## Resumen

Sprint centrado en UX de publicación, claridad de estado, métricas útiles, compartir eventos, búsqueda comprador y pulido responsive. Sin IA, sin OCR, sin cambios de backend.

---

## Cambios por área

### 1. Publicación del evento
- Nuevo **`EventPublishPanel`**: resumen con portada, fotos, etiquetadas, precio, Mercado Pago y estado.
- Mensajes explícitos de lo que falta (precio, portada, etiquetas, MP, etc.).
- Botón principal **Publicar evento** (habilitado solo cuando el checklist está completo).
- Al publicar: toast + panel de compartir automático.

### 2. Estado visual del evento
- Nuevo **`EventStatusBadge`** + `lib/event-readiness.ts`.
- Estados: ⚪ Sin fotos · 🟡 Borrador · 🟠 Incompleto · 🟢 Publicado · 🔴 Oculto.
- Integrado en tarjetas de evento del dashboard.

### 3. Compartir evento
- **`EventSharePanel`** mejorado: URL completa visible, botón **Copiar URL**, WhatsApp, Facebook, Instagram, QR.
- Se muestra automáticamente tras publicar desde el panel de publicación.

### 4. Dashboard fotógrafo
- **`DashboardKpiGrid`** con 5 métricas: eventos publicados, fotos subidas, etiquetadas, ventas confirmadas, total vendido.
- Información visible al entrar al resumen.

### 5. Checklist inteligente
- Checklist de publicación dentro de `EventPublishPanel` (MP, evento, portada, precio, fotos, etiquetas).
- **`DashboardChecklist`** muestra qué falta en los primeros pasos.

### 6. Búsqueda comprador
- Banner **"Encontramos X fotos"** al buscar dorsal.
- **`EmptyState`** mejorado: "No encontramos fotos para ese dorsal" + sugerencias (otro número, color).

### 7. Feedback comprador
- **`FeedbackPrompt`** con 5 opciones: Excelente, Buena, Regular, Mala, Muy mala.
- Persistencia solo en `localStorage` (sin backend).

### 8. Primera venta fotógrafo
- **`FirstSaleCelebration`** con mensaje actualizado y CTA para compartir evento.
- Aparece una sola vez (`localStorage`).

### 9. Responsive
- Filtros comprador sin márgenes negativos (evita scroll horizontal en 320–390px).
- Grids KPI (5 columnas), feedback (5 ratings), publish panel y cards con `min-width: 0`.
- `overflow-x: clip` en galería comprador.

### 10. Pulido visual
- `EditEventPanel` precarga datos del evento activo; publicación separada al panel dedicado.
- `AdminStats` carga automáticamente al cambiar evento activo.
- Estilos DS unificados para publish, share y feedback.

---

## Archivos nuevos

```
src/lib/event-readiness.ts
src/components/photographer/EventPublishPanel.tsx
src/components/photographer/EventStatusBadge.tsx
SPRINT-10-BETA-READY.md
```

## Archivos modificados

```
src/app/eventos/[slug]/page.tsx
src/app/styles/buyer.css
src/app/styles/dashboard.css
src/app/styles/ui.css
src/components/EventPhotoGallery.tsx
src/components/admin/AdminStats.tsx
src/components/admin/EditEventPanel.tsx
src/components/feedback/FeedbackPrompt.tsx
src/components/photographer/PhotographerDashboard.tsx
src/components/photographer/dashboard/DashboardChecklist.tsx
src/components/photographer/dashboard/DashboardEventCard.tsx
src/components/photographer/dashboard/DashboardKpiGrid.tsx
src/components/photographer/dashboard/DashboardOverviewTab.tsx
src/components/photographer/dashboard/DashboardUploadTab.tsx
src/components/photographer/onboarding/EventSharePanel.tsx
src/components/photographer/onboarding/FirstSaleCelebration.tsx
src/lib/feedback.ts
```

---

## Build

```
npm run build — exit 0 (Next.js 15.5.18)
```

---

## Flujo oficial (sin cambios)

Crear cuenta → Conectar MP → Crear evento → Subir fotos → Etiquetar manualmente → Publicar → Vender

---

## QA manual recomendado

- [ ] Publicar evento con checklist incompleto → botón deshabilitado + mensajes claros
- [ ] Completar checklist → "Evento listo para publicar" + botón activo
- [ ] Tras publicar → panel compartir con URL y QR
- [ ] Buscar dorsal existente → "Encontramos X fotos"
- [ ] Buscar dorsal inexistente → EmptyState con sugerencias
- [ ] Compra exitosa → feedback 5 estrellas (localStorage)
- [ ] Primera venta → celebración una sola vez
- [ ] Viewports 320 / 375 / 768 / 1024 sin scroll horizontal
