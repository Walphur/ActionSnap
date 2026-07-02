# Sprint 7.5A — Buyer Experience Polish

## Resumen ejecutivo

Se unificó el recorrido del **comprador** bajo el Design System ya existente (Sprint 4–7), sin tocar backend, APIs, auth ni panel fotógrafo. Las pantallas que seguían en legacy (`EventCard`, `/explorar`, `ContactHelp`, `Mis compras`, `Descargas`) ahora comparten tipografía, cards, botones y espaciado con Landing, Evento, Checkout y Success.

El flujo de producto asumido en copy y navegación es **manual** (subir → etiquetar → publicar → vender). No se agregó ni se expuso IA/OCR en estas pantallas.

---

## Componentes migrados

| Componente | Antes | Después |
|------------|-------|---------|
| `EventCard` | `.card`, `.badge-sport`, `font-display`, CTA texto | `Card`, `Badge`, `ds-h4`, Lucide, `ds-event-card` |
| `/explorar` | `glass-panel`, `explore-row`, lista vertical | Grid `landing-events__grid`, `EmptyState`, `ds-h1` |
| `ContactHelp` | `.card`, `.btn-primary` con hacks | `Card`, `ButtonLink`, `Badge` success, Lucide |
| `RacerPurchasesPanel` | Emojis, `.card`, `.btn-*` | `Card`, `EmptyState`, `Button`, `ButtonLink`, Lucide |
| `descargas` (UI) | `.card`, `.btn-secondary`, `font-display` | `Card`, `ButtonLink`, `ds-h2` |
| `MainShell` | Solo `/` y panel full-bleed | + `/eventos/*`, `/compra/*` |
| `MobileTabBar` | Visible en success | Oculto en `/compra/*` |
| `SiteHeader` | Sin entrada comprador desktop | Link **Mis compras** (`ButtonLink` ghost) |

---

## Archivos modificados

```
src/components/EventCard.tsx
src/app/explorar/page.tsx
src/components/ContactHelp.tsx
src/components/MainShell.tsx
src/components/MobileTabBar.tsx
src/components/SiteHeader.tsx
src/components/racer/RacerPurchasesPanel.tsx
src/app/descargas/page.tsx
src/app/faq/page.tsx
src/app/mis-compras/page.tsx
src/lib/routes.ts
src/app/styles/buyer.css
```

---

## CSS añadido / ajustado

**Añadido en `buyer.css`:**
- `.ds-event-card*` — card de evento en grid
- `.buyer-explore*` — layout de `/explorar`
- `.buyer-contact-help*` — bloque de ayuda en galería
- `.buyer-purchases*` — Mis compras
- `.buyer-downloads` — contenedor descargas

**Hacks eliminados:**
- `.buyer-hero` — margin negativo (`calc(-1 * var(--space-*)`) reemplazado por layout full-bleed en `MainShell`
- Contenido post-hero en `.buyer-event` — padding vía selector `> :not(.buyer-hero)` en lugar de depender del shell acolchado

**CSS legacy no eliminado de `globals.css`** (aún usado en marketing, auth, admin): `.card`, `.btn-*`, `.glass-panel`, etc.

---

## Clases legacy eliminadas (en archivos del sprint)

| Clase | Archivos donde se quitó |
|-------|-------------------------|
| `.card` | `EventCard`, `ContactHelp`, `RacerPurchasesPanel`, `descargas` |
| `.badge-sport` | `EventCard`, `explorar` |
| `.font-display` | `RacerPurchasesPanel`, `descargas` |
| `.btn-primary` / `.btn-secondary` / `.btn-ghost` | `ContactHelp`, `RacerPurchasesPanel`, `descargas` |
| `.glass-panel` | `explorar` |
| `.explore-row` | `explorar` |
| `.marketing-page*` | `explorar` (página reescrita) |
| Emojis 📷 🏁 | `RacerPurchasesPanel` |

---

## Navegación / copy

- CTAs de comprador vacío y footer: `/` → **`/explorar`**
- Descargas: "Volver al inicio" → **"Volver a explorar eventos"**
- FAQ: texto actualizado sin referencia al buscador de la home
- Header desktop: **Mis compras** visible

---

## Riesgos detectados

| Riesgo | Mitigación |
|--------|------------|
| `RacerAuthForm` sigue legacy en login de Mis compras | Fuera de scope 7.5A; pendiente 7.5B |
| `DownloadPanel` interno puede tener `.btn-*` | Solo se migró la página wrapper; revisar en 7.5B |
| FAQ items siguen en `glass-panel` vía `MarketingPage` | Solo se actualizó copy; shell marketing en 7.5B |
| Full-bleed en evento requiere padding en hijos del hero | Regla CSS en `.buyer-event > :not(.buyer-hero)` |

---

## Pendientes Sprint 7.5B

1. `MarketingPage` + páginas `/faq`, `/nosotros`, `/contacto`, `/precios` → DS shell
2. `DownloadPanel` → `Card` + `Button`
3. `RacerAuthForm` → `Input` + `Button`
4. Ocultar chrome en `/admin*` (doble header)
5. `para-fotografos` alinear con landing
6. Limpieza CSS muerto en `globals.css` (`.photo-*`, `.checkout-bar` legacy)

---

## QA

| Check | Resultado |
|-------|-----------|
| `npm run build` | ✓ OK (sin errores TS/lint) |
| Home | ✓ `EventCard` DS en grid landing |
| Explorar | ✓ Grid + EmptyState |
| Evento | ✓ Full-bleed + hero sin hack negativo |
| Checkout | ✓ Sin cambios (ya DS) |
| Compra exitosa | ✓ Tab bar oculta, full-bleed |
| Mis compras | ✓ DS + CTA `/explorar` |
| Descargas | ✓ CTA explorar + Card pending |
| Mobile | ✓ Tab bar oculta en `/compra/*` |
| Desktop | ✓ Mis compras en header |
| Responsive | ✓ Grids y paneles con breakpoints DS |

---

*Sprint 7.5A — Action Snap 2.0 · Solo UI · Sin backend*
