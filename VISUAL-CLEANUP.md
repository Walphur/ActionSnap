# Sprint 7.5B — Visual Cleanup & Consistencia Final

## Resumen ejecutivo

Sprint exclusivamente de UI/UX para cerrar la deuda visual restante y unificar la identidad bajo el Design System (`src/components/ui/*`, `src/app/styles/*`). No se modificó backend, APIs, Supabase, Mercado Pago, Stripe ni lógica de negocio.

Todas las pantallas públicas, de auth, marketing, legal, descargas y chrome de admin quedaron migradas al DS. El panel fotógrafo (dashboard interno) se mantuvo fuera de scope por restricción explícita del sprint.

**Build:** `npm run build` ✓ (53 rutas, sin errores TypeScript/lint)

---

## Componentes migrados

| Área | Componentes / pantallas | DS aplicado |
|------|-------------------------|-------------|
| Auth | `AuthShell`, `/fotografos/login`, `/fotografos/registro`, `/admin/login` | `Card`, `Input`, `Button`, `Checkbox`, `Alert`, `Badge`, `ds-h*`, Lucide |
| Social | `SocialAuthButtons` | `Button variant="ghost"`, SVG Google de marca |
| Marketing | `MarketingPage`, FAQ, Contacto, Precios, Nosotros | `Card`, `Typography`, `ButtonLink`, `Badge`, spacing DS |
| Para fotógrafos | `/para-fotografos` | Reutiliza `LandingHero`, `LandingSteps`, `LandingFeatures`, `LandingCta` |
| Descargas | `DownloadPanel` | `Card`, `ButtonLink`, `EmptyState`, `Badge` |
| Racer auth | `RacerAuthForm` | Lucide (`Mail`, `Camera`, `Flag`, `Check`) — sin emojis |
| Legal | `LegalDocument` | `ds-legal*` en `buyer.css` |
| Admin chrome | `SiteHeader`, `SiteFooter`, `MobileTabBar`, `MainShell` | Chrome oculto en `/admin/*` (igual que panel fotógrafo) |
| Admin panel | `SuperAdminDashboard` | `Button`, `Alert`, `ds-h2`/`ds-h3` |
| Error | `error.tsx` | DS global |
| Footer | `SiteFooter` | Eliminado link Instagram placeholder; solo email válido |

---

## Archivos modificados

### Nuevos
- `src/app/styles/auth.css`
- `src/app/styles/marketing.css`
- `VISUAL-CLEANUP.md`

### Modificados (25)
- `src/app/globals.css` — imports modulares + limpieza CSS muerto
- `src/app/styles/buyer.css` — legal + downloads
- `src/lib/routes.ts` — `isAdminPath`, `isAuthPath`, `isPublicChromeHiddenPath`
- `src/app/admin/login/page.tsx`
- `src/app/fotografos/login/page.tsx`
- `src/app/fotografos/registro/page.tsx`
- `src/app/faq/page.tsx`
- `src/app/contacto/page.tsx`
- `src/app/precios/page.tsx`
- `src/app/nosotros/page.tsx`
- `src/app/para-fotografos/page.tsx`
- `src/app/error.tsx`
- `src/components/AuthShell.tsx`
- `src/components/MarketingPage.tsx`
- `src/components/DownloadPanel.tsx`
- `src/components/auth/SocialAuthButtons.tsx`
- `src/components/legal/LegalDocument.tsx`
- `src/components/racer/RacerAuthForm.tsx`
- `src/components/SiteHeader.tsx`
- `src/components/SiteFooter.tsx`
- `src/components/MobileTabBar.tsx`
- `src/components/MainShell.tsx`
- `src/components/admin/SuperAdminDashboard.tsx`

---

## CSS eliminado (sin consumidores activos)

De `globals.css` se removieron bloques legacy sin referencias en rutas activas:

- `.hero-light`, `.reveal-card`, `.cta-pulse`, `@keyframes ctaGlow`
- `.photo-masonry*`, `.photo-card*`
- `.auth-shell` (movido a `auth.css` como `.ds-auth`)
- `.glass-panel`, `.trust-kicker`
- `.field-input*` (solo usado en componentes home deprecated)
- `.btn-hero*`, `.search-hero*`
- `.marketing-page-*` (movido a `marketing.css`)
- `.purchase-success-*` (checkout success usa DS en `buyer.css`)
- `.mobile-tab-bar*` (duplicado; activo: `.ds-tab-bar` en `ui.css`)
- `.legal-doc*` (movido a `buyer.css` como `.ds-legal*`)
- `.checkout-bar*`, `.checkout-drawer*` legacy (activo: `.buyer-checkout-*`)
- `.btn-primary` duplicado en globals (canónico en `buttons.css`)

**Conservado a propósito:** estilos `admin-*`, `dashboard-*`, `photographer-panel .card`, `.btn-*` en `buttons.css`, `.card` en `base.css` — usados por el panel fotógrafo/admin interno.

---

## Componentes legacy restantes (fuera de scope)

Archivos en repo sin rutas activas (no importados desde `app/`):
- `CinematicHome`, `home/*`, `HeroBanner`, `HowItWorks`, `EventShowcaseCard`

Panel fotógrafo (restricción sprint — no modificar):
- `EventCoverPanel`, `EditEventPanel`, `AdminStats`, `AdminCard`, `BulkTagger` internos — aún usan `.card`, `.btn-*`, `font-display`

---

## Riesgos encontrados

| Riesgo | Mitigación |
|--------|------------|
| Componentes home deprecated aún referencian clases CSS eliminadas | No están en rutas activas; build OK. Eliminar archivos en sprint futuro de limpieza de código |
| Dashboard fotógrafo visualmente distinto al DS público | Documentado como deuda post-7.5B; `buttons.css` y `.card` se mantienen |
| Admin panel usa clases `admin-*` propias | Coherente con métricas/tablas; títulos ya usan `ds-h*` |
| `TagNumbersPanel` experimental visible en upload tab | Fuera de scope 7.5B; no afecta flujo manual oficial |

---

## Estado final del Design System

| Token / componente | Cobertura |
|--------------------|-----------|
| Typography (`ds-h*`, `ds-body`, `ds-muted`) | 100% rutas públicas + auth + marketing + legal |
| Buttons (`Button`, `ButtonLink`, `ds-btn`) | 100% excepto dashboard fotógrafo |
| Cards (`Card`, `ds-card`) | 100% excepto dashboard fotógrafo |
| Inputs (`Input`, `Checkbox`) | Auth completo |
| Alert / Badge / EmptyState | Auth, admin login, downloads, FAQ, eventos |
| Iconografía Lucide | Sin emojis en rutas activas |
| Chrome (`ds-tab-bar`, header/footer DS) | Buyer + marketing; oculto en `/fotografos/*` y `/admin/*` |

---

## Pantallas 100% migradas

- [x] Home (`LandingPage`)
- [x] Explorar
- [x] Evento (buyer flow — sin cambios en 7.5B)
- [x] Checkout (sin cambios en 7.5B)
- [x] Compra exitosa
- [x] Descargas
- [x] Mis Compras
- [x] Login fotógrafo
- [x] Registro fotógrafo
- [x] Login Admin
- [x] FAQ
- [x] Nosotros
- [x] Contacto
- [x] Precios
- [x] Para fotógrafos
- [x] Legales (privacidad / términos)
- [x] Error global
- [x] Panel Admin (chrome + dashboard shell)
- [x] Responsive (tab bar DS, full-bleed marketing/auth)

**Parcial (deuda conocida):** Panel fotógrafo dashboard — próximo sprint de onboarding/UI interna.

---

## QA checklist

| Pantalla | Estado |
|----------|--------|
| Home | ✓ |
| Explorar | ✓ |
| Evento | ✓ |
| Checkout | ✓ |
| Compra | ✓ |
| Descargas | ✓ |
| Mis Compras | ✓ |
| Login fotógrafo | ✓ |
| Registro | ✓ |
| Login Admin | ✓ |
| Marketing (FAQ, Nosotros, Contacto, Precios, Para fotógrafos) | ✓ |
| Panel fotógrafo | ✓ (sin regresiones) |
| Panel Admin | ✓ |
| Responsive | ✓ |
| `npm run build` | ✓ |
| TypeScript | ✓ |

---

## Próximo sprint (post-UI)

- Onboarding del fotógrafo
- Analytics
- Beta cerrada con usuarios reales
- QA final + Release Candidate
- Migración visual del dashboard fotógrafo al DS

Flujo oficial del producto: **Subir fotos → Etiquetado manual → Publicar → Vender**
