# Sprint 8 — Onboarding del Fotógrafo

## Resumen ejecutivo

Sprint orientado a eliminar la incertidumbre del primer uso del panel fotógrafo. Sin cambios en backend, APIs, autenticación ni Mercado Pago. Toda la detección de progreso usa datos ya expuestos por `usePhotographerDashboard` y persistencia local (`localStorage`).

**Flujo oficial reforzado:** Subir fotos → Etiquetar manualmente → Publicar → Vender.

**Build:** `npm run build` ✓

---

## Fases implementadas

### Fase 1 — Checklist inteligente

**Archivo:** `src/lib/onboarding-checklist.ts`, `src/components/photographer/dashboard/DashboardChecklist.tsx`

| Paso | Detección automática |
|------|----------------------|
| Completar perfil | `photographerName.trim().length > 0` |
| Conectar Mercado Pago | `overview.mpConnected \|\| mpReceiverId` |
| Crear primer evento | `events.length > 0` |
| Agregar portada | `events.some(e => e.cover_url)` |
| Subir fotos | `overview.photoCount > 0` |
| Etiquetar manualmente | `taggedPhotoCount >= photoCount` (con fotos) |
| Publicar evento | `events.some(e => e.is_published)` |
| Conseguir primera venta | `overview.recentSales.length > 0` |

Cuando todos los pasos están completos:
- Se oculta el checklist.
- Se muestra `OnboardingComplete` con mensaje de felicitación (dismissible, persistido).

### Fase 2 — Empty states

Pantallas vacías con CTA explícito en:

- `DashboardOverviewTab` — eventos, ventas, fotos
- `DashboardEventsTab` — sin eventos → "Crear mi primer evento"
- `DashboardUploadTab` — sin eventos / sin fotos / sin fotos para etiquetar
- `DashboardActivity` — sin actividad con siguiente paso contextual

### Fase 3 — Tooltips (primera vez)

**Hook:** `src/hooks/useOnboardingTips.ts`  
**Componente:** `src/components/photographer/onboarding/OnboardingTip.tsx`  
**Persistencia:** `localStorage` → `actionsnap_onboarding_tips_seen`

| ID | Ubicación | Tema |
|----|-----------|------|
| `tab-overview` | Resumen | Ventas |
| `tab-events` | Eventos | Crear coberturas |
| `tab-upload` | Subir | Subidas |
| `tagging` | Subir | Etiquetado manual |
| `tab-settings` | Ajustes | Configuración |
| `mercadopago` | Ajustes (si MP desconectado) | Mercado Pago |

Popovers pequeños con botón "Entendido" — sin modales.

### Fase 4 — Primera venta

**Componente:** `src/components/photographer/onboarding/FirstSaleCelebration.tsx`

- Se muestra cuando `recentSales.length > 0` y el usuario no lo vio antes.
- Persistencia: `actionsnap_onboarding_first_sale_seen`
- Celebración discreta y profesional, dismissible.

### Fase 5 — Mercado Pago

**Componente:** `DashboardMpCard` (variante `highlight`)

- Si MP no está conectado: card destacada al inicio del Resumen.
- Explica por qué conectar y qué pasa después.
- Pasos numerados + botón "Conectar Mercado Pago".
- En Ajustes: card destacada + tip contextual.

### Fase 6 — Compartir evento

**Componente:** `src/components/photographer/onboarding/EventSharePanel.tsx`

Acciones tras publicar (reutiliza `Button` / `ButtonLink`):

- Copiar enlace
- WhatsApp
- Facebook
- Instagram (copia enlace + toast)
- QR (imagen generada vía API pública, sin dependencia npm)

Visible en: Resumen (evento publicado), pestaña Eventos, pestaña Subir (evento activo publicado).

### Fase 7 — Documentación

Este archivo (`ONBOARDING.md`).

---

## Archivos nuevos

| Archivo | Rol |
|---------|-----|
| `src/lib/onboarding.ts` | Keys localStorage, URLs de share/QR |
| `src/lib/onboarding-checklist.ts` | Lógica del checklist |
| `src/hooks/useOnboardingTips.ts` | Tips primera vez |
| `src/components/photographer/onboarding/OnboardingTip.tsx` | Popover de ayuda |
| `src/components/photographer/onboarding/OnboardingComplete.tsx` | Felicitación checklist |
| `src/components/photographer/onboarding/FirstSaleCelebration.tsx` | Primera venta |
| `src/components/photographer/onboarding/EventSharePanel.tsx` | Compartir evento |

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `DashboardChecklist.tsx` | 8 pasos + perfil + felicitación |
| `DashboardOverviewTab.tsx` | MP destacado, empty states, share |
| `DashboardEventsTab.tsx` | Tips, empty states, share |
| `DashboardUploadTab.tsx` | Tips, empty states, share |
| `DashboardSettingsTab.tsx` | Tips MP + configuración |
| `DashboardMpCard.tsx` | Variante highlight + copy mejorado |
| `DashboardActivity.tsx` | Empty state con CTA |
| `PhotographerDashboard.tsx` | Integración tips + primera venta |
| `src/app/styles/dashboard.css` | Estilos onboarding |

---

## Persistencia (localStorage)

| Key | Uso |
|-----|-----|
| `actionsnap_onboarding_checklist_complete_seen` | Usuario vio felicitación del checklist |
| `actionsnap_onboarding_first_sale_seen` | Usuario vio celebración primera venta |
| `actionsnap_onboarding_tips_seen` | JSON array de tip IDs vistos |

Sin cambios en Supabase ni APIs.

---

## Riesgos y limitaciones

| Riesgo | Mitigación |
|--------|------------|
| `recentSales` limitado a 8 en overview | Suficiente para detectar primera venta en uso normal |
| QR vía API externa (`api.qrserver.com`) | Sin dependencia npm; requiere red al mostrar QR |
| Perfil "completo" solo por nombre | OAuth suele proveer nombre; extensible en sprint futuro |
| Tips en localStorage por dispositivo | Comportamiento esperado para onboarding UX |

---

## QA checklist

| Escenario | Estado |
|-----------|--------|
| Usuario nuevo | ✓ Checklist + tips + empty states |
| Usuario con MP conectado | ✓ MP card compacta al final |
| Usuario sin MP | ✓ Card destacada arriba |
| Usuario sin eventos | ✓ CTA crear evento |
| Usuario con eventos | ✓ Cards + share si publicado |
| Usuario sin ventas | ✓ CTA compartir / publicar |
| Usuario con ventas | ✓ Celebración primera venta |
| Responsive | ✓ Flex/wrap en share y tips |
| `npm run build` | ✓ |

---

## Objetivo final

El fotógrafo siempre tiene un siguiente paso claro:

1. Completar perfil y conectar MP  
2. Crear evento y subir fotos  
3. Etiquetar manualmente  
4. Publicar y compartir  
5. Conseguir la primera venta  

Sin IA. Sin OCR. Etiquetado manual como flujo oficial.
