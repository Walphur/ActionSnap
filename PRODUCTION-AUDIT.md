# Production Audit — Sprint 11 Hardening

**Fecha:** 2026-07-02  
**Objetivo:** Pulir ActionSnap para producción sin nuevas features ni cambios de flujo.

---

## Rutas auditadas

| Ruta | Estado |
|------|--------|
| `/` | ✓ Landing DS, copy sin referencias IA |
| `/explorar` | ✓ Listado eventos |
| `/eventos/[slug]` | ✓ Búsqueda dorsal, galería, checkout |
| `/mis-compras` | ✓ Auth piloto, descargas, empty/error |
| `/descargas` | ✓ Token/pago, panel descarga |
| `/faq` | ✓ Marketing DS |
| `/contacto` | ✓ |
| `/precios` | ✓ |
| `/para-fotografos` | ✓ |
| `/fotografos/login` | ✓ Turnstile, errores claros |
| `/fotografos/registro` | ✓ Términos, validación |
| `/fotografos` | ✓ Dashboard completo, publicación, etiquetado |
| `/admin/login` | ✓ Guard rol admin |
| `/admin` | ✓ Panel super admin |
| `/compra/exito` | ✓ Polling pago, feedback |

---

## Problemas encontrados

### Consola / errores genéricos
- `error.tsx` hacía `console.error` en el cliente en cada error de página.
- Mensajes genéricos en BulkTagger (`"Error"`, `"Error al cargar fotos"`).
- Upload usaba `Error ${status}` sin mensaje descriptivo.
- Checkout, galería y mis-compras con `"Error de conexión"` poco accionable.
- WatermarkSettings sin manejo de fallo de red.

### Accesibilidad
- `CheckoutDrawer` sin cierre con Escape ni `aria-modal`.
- `Select` sin `aria-describedby` para hints/errores; faltaba spread de props en un refactor previo.

### Responsive
- Riesgo de scroll horizontal en layouts estrechos (320–390px).
- Checkout drawer sin `overflow-x: hidden` ni `100dvh` en móvil.

### Copy / producto
- Landing mencionaba IA experimental (ya eliminada del producto).

### Código muerto (ya resuelto en Sprint 9.2)
- `TagNumbersPanel`, rutas `analyze-event`, `test-detect` — confirmado ausentes en repo.

### Lint
- `npm run lint` requiere configuración interactiva de ESLint (no hay `eslint.config` en repo). El build de Next.js sí ejecuta typecheck + lint integrado: **exit 0**.

---

## Problemas corregidos

| Área | Corrección |
|------|------------|
| Errores UI | Mensajes claros y accionables en español en BulkTagger, upload, checkout, galería, mis-compras, watermark |
| `error.tsx` | Eliminado `console.error` en cliente; mensaje amigable ya existente |
| `formatApiError` | Usado consistentemente en upload MP y watermark |
| A11y checkout | Escape para cerrar, `aria-modal="true"` |
| A11y Select | `aria-describedby`, `aria-invalid`, props restaurados |
| Responsive | `overflow-x: clip` en html/body; `min-w-0` + clip en MainShell; drawer checkout mejorado |
| Sincronización | `EventCoverPanel` notifica `onSaved` → refresco dashboard/publicación |
| Landing | Textos sin IA/OCR experimental |

---

## Archivos modificados

```
src/app/error.tsx
src/app/styles/base.css
src/app/styles/buyer.css
src/components/BulkTagger.tsx
src/components/EventCoverPanel.tsx
src/components/EventPhotoGallery.tsx
src/components/MainShell.tsx
src/components/PhotoGrid.tsx
src/components/checkout/CheckoutDrawer.tsx
src/components/landing/LandingFeatures.tsx
src/components/landing/LandingSteps.tsx
src/components/photographer/WatermarkSettings.tsx
src/components/photographer/dashboard/DashboardUploadTab.tsx
src/components/racer/RacerPurchasesPanel.tsx
src/components/ui/Select.tsx
src/hooks/usePhotographerDashboard.ts
PRODUCTION-AUDIT.md
```

---

## Mejoras realizadas

1. **Mensajes de error unificados** — El usuario siempre recibe qué falló y qué puede hacer.
2. **Consola del navegador más limpia** — Sin `console.error` en boundary global.
3. **Teclado en checkout** — Escape cierra el drawer de pago.
4. **Layouts móviles** — Menos riesgo de overflow horizontal en toda la app.
5. **Portada → publicación** — Al guardar portada se refresca el estado del evento activo.
6. **Copy de marketing** — Alineado al flujo manual oficial.

---

## Deuda técnica restante (no bloqueante para beta)

| Item | Prioridad | Notas |
|------|-----------|-------|
| ESLint standalone | Media | Configurar `eslint.config.mjs` para `npm run lint` no interactivo |
| Libs IA en `package.json` | Baja | `openai`, `tesseract.js`, `@google-cloud/vision` siguen como deps pero sin uso en flujo activo |
| `lib/detect-*`, `analyze-photo*` | Baja | Código servidor legacy; no expuesto en UI |
| Feedback solo localStorage | Baja | Documentado; sin backend de encuestas |
| QR externo (`api.qrserver.com`) | Baja | Dependencia de tercero para compartir |
| Favoritos en galería | Baja | UI presente, sync "próximamente" |
| Admin panel | Media | Tablas aún con clases `admin-table` vs DS Table completo |
| `console.error` en API routes | Baja | Aceptable en servidor; usar `safe-logger` de forma consistente en futuro |

---

## Verificación

```
npm run build — exit 0 (Next.js 15.5.18, 50 rutas)
```

Flujo oficial verificado en código: **Crear cuenta → MP → Evento → Subir → Etiquetar → Publicar → Vender → Comprar → Descargar**.

---

## Restricciones respetadas

- Sin nuevas features
- Sin IA / OCR en UX
- Sin cambios de APIs ni backend (salvo bugs — ninguno requerido)
- Sin cambios de flujo Mercado Pago, Stripe, Supabase, Auth
