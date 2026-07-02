# Sprint 9.2 — Estabilización final pre-Beta

**Fecha:** 2026-07-02  
**Objetivo:** Corregir bugs detectados antes de la beta. Sin nuevas funcionalidades ni cambios de lógica de negocio.

---

## QA checklist

| Verificación | Estado |
|---|---|
| Registro no queda debajo del navbar | ✓ |
| Un solo logo por pantalla (auth sin chrome público) | ✓ |
| Mercado Pago OAuth con redirect URI normalizado | ✓ |
| Uploader moderno con drag & drop | ✓ |
| Etiquetado usa Design System (Chips, Buttons, ColorInput) | ✓ |
| Colores personalizados (input + datalist) | ✓ |
| Guardar / Guardar y siguiente corregidos | ✓ |
| Sin llamadas a `analyze-event` | ✓ |
| Sin referencias activas a IA/OCR en flujo | ✓ |
| Mis compras sin duplicado en header | ✓ |
| `npm run build` sin errores | ✓ |

---

## Bugs corregidos

### 1. Registro fotógrafo — layout y branding duplicado
- `isPublicChromeHiddenPath()` ahora incluye rutas auth (`/fotografos/login`, `/fotografos/registro`, `/admin/login`).
- `SiteHeader` y `MobileTabBar` no se renderizan en auth → un solo logo (`AuthShell`).
- `auth.css`: `min-height: 100vh` en el grid (sin restar altura del navbar inexistente).

### 2. Mercado Pago OAuth
- `normalizeAppUrl()` y `resolveAppUrl()` en `mercadopago.ts`.
- Redirect URI consistente en auth y token exchange.
- Validación explícita de `MERCADOPAGO_CLIENT_ID` antes de redirigir.
- Mensaje de error en dashboard con hint sobre Redirect URI si falla OAuth.

### 3. Eliminación de IA / OCR del flujo activo
- Eliminados: `TagNumbersPanel`, `/api/photographer/analyze-event`, `/api/admin/analyze-event`, `/api/admin/test-detect`.
- Removido panel experimental del tab de upload.
- `setup/status` ya no expone `aiProviders` / `aiReady`.
- `.env.example` sin variables de detección automática.

### 4. Upload de fotografías
- Nuevo `PhotoUploader`: drag & drop, selección, miniaturas, peso total, progreso, estados completado/error.
- Mismo endpoint backend (`uploadPhotos` → `POST /api/photographer/upload`).

### 5. Etiquetado manual — Design System
- Filtros Pendientes / Todas / Etiquetadas como Chips DS (`ds-chip`).
- Botones Guardar, Guardar y siguiente, Anterior, Copiar, Pegar, Deshacer con `Button` DS.
- Estilos legacy de filtros removidos de `dashboard.css`.

### 6. Colores personalizados
- Nuevo `ColorInput` (input + datalist).
- `SUGGESTED_BIKE_COLORS` y `SUGGESTED_RIDER_COLORS` en `color-options.ts`.
- Cualquier color puede escribirse manualmente (ej. "rojo flúor", "naranja KTM").

### 7. Guardado del etiquetado
- Bug corregido: en filtro "Pendientes", "Guardar y siguiente" ya no salta la siguiente foto (la etiquetada desaparece del filtro).
- Toasts descriptivos con `sonner` en éxito y error (mensaje del API cuando existe).

### 8. Navegación
- Eliminado botón duplicado "Mis compras" en `SiteHeader` (queda solo en nav links).

### 9. Dashboard fotógrafo — header más compacto
- Reducido padding del shell header y margen de tabs.

### 10. Limpieza
- CSS experimental AI removido.
- Endpoints y componentes de IA eliminados del flujo activo.

---

## Archivos modificados

```
.env.example
src/app/api/mercadopago/auth/route.ts
src/app/api/mercadopago/callback/route.ts
src/app/api/setup/status/route.ts
src/app/styles/auth.css
src/app/styles/dashboard.css
src/components/BulkTagger.tsx
src/components/MobileTabBar.tsx
src/components/SiteHeader.tsx
src/components/photographer/PhotographerDashboard.tsx
src/components/photographer/dashboard/DashboardUploadTab.tsx
src/lib/color-options.ts
src/lib/mercadopago.ts
src/lib/routes.ts
```

## Archivos nuevos

```
src/components/photographer/PhotoUploader.tsx
src/components/ui/ColorInput.tsx
SPRINT-9.2-REPORT.md
```

## Archivos eliminados

```
src/app/api/admin/analyze-event/route.ts
src/app/api/admin/test-detect/route.ts
src/app/api/photographer/analyze-event/route.ts
src/components/TagNumbersPanel.tsx
```

---

## Build

```
npm run build — exit 0 (Next.js 15.5.18)
```

---

## Notas Mercado Pago

Si persiste el error *"La aplicación no está preparada para conectarse a Mercado Pago"* en producción, verificar en el [panel de desarrolladores](https://www.mercadopago.com.ar/developers/panel/app) que la **Redirect URI** registrada coincida **exactamente** con:

- `MERCADOPAGO_REDIRECT_URI` en variables de entorno, o
- `{NEXT_PUBLIC_APP_URL}/api/mercadopago/callback` si no está definida.

También confirmar `MERCADOPAGO_CLIENT_ID` y `MERCADOPAGO_CLIENT_SECRET` de la misma aplicación.

---

## Flujo oficial (sin cambios)

Subir fotos → Etiquetar manualmente → Publicar → Vender
