# Sprint 6 — Dashboard del Fotógrafo (Premium SaaS)

Informe de implementación. Solo UI/UX; sin cambios en backend, APIs, auth, Mercado Pago ni Stripe.

---

## Cambios realizados

### Fase 1 — Nueva estructura
El dashboard se reorganizó en **4 tabs** con contenido modular:

| Tab | Secciones |
|-----|-----------|
| **Resumen** | Bienvenida → KPIs → Actividad → Eventos (preview) → Ventas → Subidas → Acciones rápidas → MP |
| **Eventos** | Grid premium + formulario crear evento |
| **Subir** | Etiquetado, upload, portada, edición, stats (lógica intacta) |
| **Ajustes** | Mercado Pago + marca de agua |

### Fase 2 — Hero del dashboard
- `DashboardHero`: saludo personalizado (`full_name` del perfil)
- Resumen con Cards DS: ingreso, eventos, fotos, ventas recientes
- Sin emoji; icono Lucide `Hand`

### Fase 3 — KPIs
- `DashboardKpiGrid`: ventas, eventos, fotos, compradores, ingresos, estado MP
- Placeholders `—` cuando no hay compradores
- Skeleton mientras carga overview

### Fase 4 — Checklist
- `DashboardChecklist`: 6 pasos derivados de datos reales
- Se oculta automáticamente al completar todos

### Fase 5 — Actividad
- `DashboardActivity`: ventas recientes + eventos (proxy temporal)
- `EmptyState` si no hay datos

### Fase 6 — Eventos
- `DashboardEventCard`: portada, badges, meta, acciones rápidas, hover premium
- Grid responsive en overview (preview) y tab Eventos

### Fase 7 — Quick actions
- `DashboardQuickActions`: Crear evento, Subir, Etiquetar, Ver ventas, Configuración

### Fase 8 — Mercado Pago
- `DashboardMpCard`: Badge (Conectado/Pendiente/Sin conectar), Alert, botón OAuth
- Versión compacta en Resumen; completa en Ajustes

### Fase 9 — Empty states
- Todas las secciones sin datos usan `EmptyState` con icono Lucide + CTA

### Fase 10 — Responsive
- Grids adaptativos 2→3→6 columnas
- Panel full-bleed sin chrome del sitio
- Sin `overflow-x` en `.ds-dashboard`

### Fase 11 — Microinteracciones
- `ds-hover-lift`, `ds-dash-reveal`, `ds-pressable`, transiciones DS

### Fase 12 — Limpieza
- Eliminado `AdminCard`, `btn-hero`, `dashboard-toast`, `glass-panel` del dashboard
- Chrome del sitio oculto en `/fotografos` (panel dedicado)
- `WatermarkSettings` migrado a Input, Button, Checkbox DS

---

## Componentes reutilizados (Design System)

| Componente | Uso |
|------------|-----|
| `Card` / `CardHeader` / `CardBody` | KPIs, secciones, eventos, forms |
| `Button` / `ButtonLink` | CTAs, acciones, MP OAuth |
| `Badge` | Estado evento, MP, mockups |
| `Alert` | Feedback, MP, notificaciones |
| `EmptyState` | Sin datos en todas las secciones |
| `Skeleton` | Carga de KPIs |
| `Input` / `Select` / `Checkbox` | Forms evento y watermark |
| Tipografía `.ds-h*` / `.ds-overline` | Jerarquía visual |
| `ds-tabs__*` | Navegación del panel |

---

## Componentes nuevos

```
src/components/photographer/dashboard/
  DashboardHero.tsx
  DashboardKpiGrid.tsx
  DashboardChecklist.tsx
  DashboardActivity.tsx
  DashboardEventCard.tsx
  DashboardQuickActions.tsx
  DashboardMpCard.tsx
  DashboardOverviewTab.tsx
  DashboardEventsTab.tsx
  DashboardUploadTab.tsx
  DashboardSettingsTab.tsx

src/app/styles/dashboard.css
src/lib/routes.ts          # isPhotographerPanelPath()
```

---

## Archivos modificados

```
src/components/photographer/PhotographerDashboard.tsx
src/components/photographer/PhotographerShell.tsx
src/components/photographer/WatermarkSettings.tsx
src/hooks/usePhotographerDashboard.ts   # +photographerName (desde profile existente)
src/types/event.ts                      # +cover_url en EventRow
src/components/SiteHeader.tsx           # oculto en panel
src/components/SiteFooter.tsx           # oculto en panel (client)
src/components/MobileTabBar.tsx         # oculto en panel
src/components/MainShell.tsx            # full-bleed panel
src/app/globals.css                     # import dashboard.css
ROADMAP-ACTION-SNAP-2.md
```

---

## CSS legacy eliminado del dashboard (en uso)

| Antes | Después |
|-------|---------|
| `.photographer-panel`, `.panel-header` | `.ds-dashboard-shell*` |
| `.dashboard-stats`, `.dashboard-stat` | `.ds-dash-kpis`, `.ds-dash-kpi` |
| `.dashboard-tab` | `.ds-tabs__trigger` |
| `.dashboard-toast` | `Alert` DS |
| `.event-picker` | `DashboardEventCard` |
| `AdminCard`, `glass-panel` | `Card` DS |
| `btn-hero`, `btn-primary` en panel | `Button` DS |
| `field-input` en forms panel | `Input` / `Select` DS |

**Nota:** reglas `.dashboard-*` y `.photographer-panel` en `globals.css` quedan por referencia hasta Sprint 14; el panel ya no las usa.

---

## Mejoras UX

1. **Centro de operaciones** — el fotógrafo ve de un vistazo ingresos, pendientes y próximo paso
2. **Checklist inteligente** — onboarding sin tutorial; desaparece al completar
3. **Panel dedicado** — sin header/footer duplicados del marketing site
4. **Acciones rápidas** — un tap a la tarea más común
5. **Empty states con CTA** — nunca cajas vacías sin guía

## Mejoras UI

1. Jerarquía Stripe/Linear: hero → métricas → actividad → contenido
2. Event cards con portada y hover premium
3. MP card con estados semánticos (success/warning/danger)
4. Tipografía DS consistente con landing

---

## Problemas encontrados

1. **`salesCount` en overview** — API limita a 8 ventas recientes; el KPI refleja ese subset, no total histórico (preexistente).
2. **Actividad de uploads** — no hay feed de API; se usa proxy ventas + eventos.
3. **Ventas por evento en cards** — no disponible sin llamar `/stats` por evento; no se agregaron llamadas extra.
4. **SiteFooter** — pasó a client component para ocultar en panel (trade-off mínimo).
5. **BulkTagger / EventCoverPanel / AdminStats** — aún usan estilos legacy internos (pendiente Sprint 7).

---

## Pendientes para Sprint 7 (Upload)

- Migrar `BulkTagger`, `EventCoverPanel`, `EditEventPanel`, `AdminStats` al DS
- Wizard de upload paso a paso
- Feed de actividad real si se expone endpoint
- KPI de ventas totales si API lo provee
- Eliminar bloques `.dashboard-*` de `globals.css` tras migración completa

---

## Hook — cambio mínimo

`usePhotographerDashboard` expone `photographerName` leyendo `full_name` del mismo `GET /api/photographer/profile` ya existente. Sin cambios de API.
