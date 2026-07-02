# Action Snap 2.0 — Roadmap

Orden de ejecución acordado. Cada sprint debe cerrarse antes de avanzar al siguiente.

```
Sprint 0  → Documentación                    ✔
Sprint 1  → Seguridad                    ✔
Sprint 2  → Bugs críticos                ✔
Sprint 3  → Arquitectura
Sprint 4  → Design System
Sprint 5  → Landing
Sprint 6  → Dashboard fotógrafo
Sprint 7  → Upload
Sprint 8  → Galería
Sprint 9  → Checkout
Sprint 10 → Administrador
Sprint 11 → Responsive
Sprint 12 → Accesibilidad
Sprint 13 → Performance
Sprint 14 → Limpieza de código muerto
Sprint 15 → Nuevas funcionalidades
```

---

## Sprint 0 — Documentación ✔

**Objetivo:** Comprender el proyecto al 100% antes de tocar código.

**Entregables:**
- Auditoría técnica (arquitectura, rutas, APIs, BD, integraciones)
- Auditoría funcional (bugs priorizados)
- Auditoría producto + UI/UX
- Especificación Design System (Fase 4)
- Este roadmap

**Riesgo:** —  
**Estado:** Completado

---

## Sprint 1 — Seguridad

**Objetivo:** Cerrar vectores de ataque y fugas de datos antes de rediseñar UI.

**Tareas:**
- [x] Proteger todas las rutas `/api/admin/*` con `requireAdminProfile()`
- [x] Bloquear o eliminar `/api/upload` legacy sin auth
- [x] Validar firma webhook Mercado Pago (o secret compartido)
- [x] Eliminar secret por defecto en `download-token.ts` (fail fast en prod)
- [x] Restringir `/api/purchases/status` (token o email verificado)
- [x] Restringir `/api/mis-compras` (no exponer ZIP sin verificación fuerte)
- [x] Proteger `/descargas` con token o sesión
- [x] Enforcer `is_active` en `requirePhotographerProfile()`
- [x] Verificar ownership en `tag-numbers` y `reset-tags`

**Archivos:** `src/app/api/admin/*`, `src/lib/download-token.ts`, `src/lib/photographer-auth.ts`, webhooks MP, checkout/descargas/mis-compras

**Riesgo:** Alto (pagos y HD)  
**Prioridad:** P0  
**Estimado:** 3–5 días  
**Estado:** Completado

---

## Sprint 2 — Bugs críticos ✔

**Objetivo:** Corregir lógica de negocio que pierde dinero o rompe flujos.

**Tareas:**
- [x] Race condition doble venta (reserva atómica + finalize transaccional)
- [x] Stripe `session_id` en `/compra/exito` y `/api/purchases/status`
- [x] Pack discount calculado y validado server-side
- [x] Checkout deshabilitado si fotógrafo sin MP / inactivo
- [x] Fotos vendidas ocultas en galería pública
- [x] Stats revenue sin doble conteo
- [x] Ownership en `/api/photographer/photos` y `/stats`
- [x] Respuestas API estándar en checkout + logging seguro
- [x] Checklist QA manual (`SPRINT-2-QA-CHECKLIST.md`)
- [ ] Nav `/#buscar` → `/explorar` (diferido — requiere UI Sprint 5)

**Entregables:** `SPRINT-2-INFORME.md`, `supabase/sprint2-checkout-atomic.sql`

**Riesgo:** Alto  
**Prioridad:** P0  
**Estado:** Completado (ejecutar SQL en Supabase)

---

## Sprint 3 — Arquitectura

**Objetivo:** Estructura mantenible sin cambiar comportamiento.

**Tareas:**
- [ ] Dividir `globals.css` en módulos
- [ ] Unificar auth helpers (admin guard middleware pattern)
- [ ] Extraer `src/components/ui/` scaffold
- [ ] Documentar convenciones en `ARCHITECTURE.md`
- [ ] Resolver duplicación `storage.ts` vs `photo-storage.ts` (documentar paths)

**Riesgo:** Medio  
**Prioridad:** P1  
**Estimado:** 3–4 días

---

## Sprint 4 — Design System

**Objetivo:** Tokens + componentes base reutilizables.

**Tareas:** Tokens spacing/radius/shadow/color/type, Button, Input, Card, Badge, Alert, Skeleton, EmptyState

**Riesgo:** Medio  
**Prioridad:** P0 (bloquea sprints 5–10)  
**Estimado:** 5–7 días

---

## Sprint 5 — Landing

**Objetivo:** Primera impresión SaaS premium (Stripe/Linear level).

**Estimado:** 3–4 días

---

## Sprint 6 — Dashboard fotógrafo

**Objetivo:** De CRUD a dashboard con widgets, onboarding, wizard crear evento.

**Estimado:** 5–7 días

---

## Sprint 7 — Upload

**Objetivo:** Drag & drop, progreso, miniaturas, retry (misma API).

**Estimado:** 4–5 días

---

## Sprint 8 — Galería

**Objetivo:** Fotos protagonistas, hover, toolbar, lightbox polish.

**Estimado:** 4–5 días

---

## Sprint 9 — Checkout

**Objetivo:** Drawer estilo Stripe, trust, claridad (misma API checkout).

**Estimado:** 4–5 días

---

## Sprint 10 — Administrador

**Objetivo:** Panel profesional con métricas visuales.

**Estimado:** 3–4 días

---

## Sprint 11 — Responsive

**Objetivo:** Desktop → mobile sin scroll horizontal ni layouts rotos.

**Estimado:** 3–5 días

---

## Sprint 12 — Accesibilidad

**Objetivo:** WCAG AA — contraste, focus, labels, ARIA.

**Estimado:** 3–4 días

---

## Sprint 13 — Performance

**Objetivo:** Lazy images, CSS split, bundle, Core Web Vitals.

**Estimado:** 2–3 días

---

## Sprint 14 — Limpieza código muerto

**Objetivo:** Eliminar `CinematicHome`, `home/*`, componentes huérfanos, CSS unused.

**Estimado:** 2 días

---

## Sprint 15 — Nuevas funcionalidades

**Objetivo:** Features post-MVP (IA reactivada, dominio custom, analytics, etc.) — definir backlog en sprint planning.

**Estimado:** TBD

---

## Reglas globales

- No romper APIs existentes en sprints 1–14
- No cambiar lógica Mercado Pago OAuth sin prueba en sandbox
- Commit + push al cerrar cada sprint
- QA manual checklist por sprint antes de merge
