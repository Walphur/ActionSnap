# Sprint 5 — Landing + Navegación + Identidad Visual

Informe de implementación. Solo frontend; sin cambios en backend, APIs, auth, Mercado Pago ni Stripe.

---

## Cambios realizados

### Fase 1 — Header
- `SiteHeader` rediseñado con clases DS (`.ds-header*`)
- Sticky con blur, transición al scroll, borde y sombra premium
- Navegación: Explorar, Para fotógrafos, FAQ
- CTA primario: **Empezar gratis** · secundario desktop: **Ingresar**
- Menú móvil con panel desplegable (Lucide Menu/X)
- Estados hover y activo por ruta
- Eliminado link roto `/#buscar`

### Fase 2 — Hero
- Sección `LandingHero` con jerarquía `.ds-h1`, `.ds-overline`, `.ds-body-lg`
- Responde: qué es, para quién, problema, confianza (badges IA + HD)
- CTAs: Empezar gratis + Explorar eventos
- Mockup premium `DashboardMockup` con Badge DS

### Fase 3 — Social proof
- `LandingSocialProof`: logos, stats y testimonios como **placeholders elegantes**
- Sin datos inventados (valores `—`, copy “próximamente”)
- Eventos reales siguen en sección aparte (desde Supabase)

### Fase 4 — Features
- `LandingFeatures`: cards DS con estructura **Problema → Solución → Beneficio**
- Hover lift + reveal animation

### Fase 5 — Mockups
- `DashboardMockup.tsx` usa tokens DS, Badge, tipografía DS
- Ya no muestra UI legacy genérica

### Fase 6 — CTA final
- `LandingCta`: Registrar fotógrafo, Ver eventos, Conectar Mercado Pago
- Eliminada nav duplicada del pie de landing (footer global unificado)

### Fase 7 — Footer
- `SiteFooter` con `.ds-footer*`, Lucide (Globe, Mail)
- Sin emojis; links reorganizados
- Eliminado `/#buscar`

### Fase 8 — Navegación
- Header, footer y mobile tab bar normalizados
- CTAs alineados a `/fotografos/registro` y `/explorar`
- `MobileTabBar` migrado a `.ds-tab-bar*`

### Fase 9 — Animaciones
- `landing-reveal`, `ds-animate-slide-down`, `ds-hover-lift`, `ds-scale-in`
- Duraciones y easing del Design System

### Fase 10 — Responsive
- Header colapsa a menú hamburguesa en mobile
- Grids adaptativos en features, steps, events, trust
- `overflow-x: hidden` en `.landing`

---

## Componentes reutilizados (Design System)

| Componente | Uso |
|------------|-----|
| `ButtonLink` | CTAs en hero, header, features, events, CTA final |
| `Card` / `CardBody` | Features, steps, testimonios placeholder |
| `Badge` | Mockup dashboard (MP conectado, IA, ventas) |
| `Alert` | Aviso config Supabase |
| `EmptyState` | Sin eventos publicados |
| Tipografía `.ds-h1` … `.ds-overline` | Toda la landing |
| Lucide | Iconografía consistente |

---

## Componentes / estilos legacy eliminados (landing + chrome)

| Eliminado | Reemplazo |
|-----------|-----------|
| `.nav-floating*` en header | `.ds-header*` |
| `.site-footer*` / `.footer-social` | `.ds-footer*` |
| `.mobile-tab-bar*` | `.ds-tab-bar*` |
| `.btn-hero` en landing | `ButtonLink` |
| `.landing-*` monolítico en `LandingPage` | Secciones modulares + `landing.css` |
| `.landing-cta-nav` duplicada | `SiteFooter` |
| Link `/#buscar` | `/explorar` o eliminado |
| Emojis en footer (IG, ✉) | Lucide Globe, Mail |

**Nota:** `.btn-hero`, `.nav-floating`, `.landing-*` antiguos permanecen en `globals.css` por uso en Dashboard/Checkout/Galería (Sprints 6–9).

---

## Archivos nuevos

```
src/components/ui/ButtonLink.tsx
src/components/landing/LandingHero.tsx
src/components/landing/LandingSocialProof.tsx
src/components/landing/LandingFeatures.tsx
src/components/landing/LandingSteps.tsx
src/components/landing/LandingEvents.tsx
src/components/landing/LandingCta.tsx
src/components/landing/DashboardMockup.tsx
src/app/styles/chrome.css
src/app/styles/landing.css
LANDING-REDESIGN.md
```

## Archivos modificados

```
src/components/landing/LandingPage.tsx
src/components/SiteHeader.tsx
src/components/SiteFooter.tsx
src/components/MobileTabBar.tsx
src/components/ui/index.ts
src/app/globals.css
ROADMAP-ACTION-SNAP-2.md
```

---

## Problemas encontrados

1. **`/#buscar` roto** — sección eliminada en Sprint 3; corregido en header/footer.
2. **Lucide sin icono Instagram** — Lucide no exporta marcas; se usa `Globe` para link social.
3. **CSS legacy duplicado** — landing/nav/footer viejos en `globals.css` quedan hasta limpieza Sprint 14; nuevos estilos en módulos DS.
4. **Footer `/#eventos`** — anchor válido solo en home; comportamiento esperado.

---

## Mejoras futuras

- Conectar stats reales desde API/admin cuando existan métricas públicas
- Reemplazar placeholders de logos y testimonios con contenido real
- Migrar `/para-fotografos`, FAQ y marketing pages al mismo DS (Sprint 5+)
- Eliminar bloques `.landing-*` / `.nav-floating` de `globals.css` tras migrar resto de app
- Icono social dedicado si se adopta SVG de marca aprobado
- Animaciones on-scroll con Intersection Observer (opcional, sin exagerar)

---

## Preparación Sprint 6

Header, footer, `ButtonLink`, `Card`, tipografía DS y `chrome.css` están listos para reutilizar en Dashboard fotógrafo sin duplicar chrome.
