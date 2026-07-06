# ActionSnap — Sprint UI/UX Premium

**Fecha:** 5 de julio de 2026  
**Alcance:** Solo diseño, CSS y microinteracciones. Sin backend, APIs ni funcionalidades nuevas.

---

## Resumen ejecutivo

Se unificó el lenguaje visual de ActionSnap bajo criterios de productos SaaS premium (Stripe, Linear, Vercel): sombras más profundas, glass morphism consistente, CTAs con mayor peso visual, hero de evento como pieza central, checkout con sensación de confianza y dashboard con KPIs más refinados.

**Build:** `npm run build` — ✅ exitoso (Next.js 15.5.18, 51 rutas).

---

## Design system (`tokens.css`, `ui.css`, `animations.css`)

| Token / primitiva | Mejora |
|---|---|
| `--shadow-xl`, `--shadow-primary` | Profundidad y glow de marca en CTAs |
| `--glass-bg`, `--glass-border`, `--ds-layout-max` | Superficies glass unificadas (navbar, filtros) |
| `.ds-btn--primary` | Elevación en hover, sombra primaria, feedback táctil |
| `.ds-card` | Gradiente sutil superior, transiciones de borde |
| `.ds-input::placeholder` | Placeholders más legibles (`opacity: 1`) |
| `.ds-field__error` | Restaurado (accesibilidad en formularios) |
| `prefers-reduced-motion` | Desactiva animaciones invasivas |
| `@supports (animation-timeline: view())` | Reveal al scroll en landing (progressive enhancement) |

---

## Componentes / áreas mejoradas

### Navbar (`chrome.css`)
- Altura mínima 3rem, blur 24px + saturate 180%
- Tokens glass compartidos con filtros de evento
- Estado activo con borde interior sutil
- `:focus-visible` en links de navegación

### Landing (`landing.css`)
- Secciones más compactas, separadores con gradiente horizontal
- Feature cards: hover con sombra + glow
- CTA final: borde primario, gradiente radial más intenso, sombra XL
- CTAs del hero con `shadow-primary`

### Evento — Hero (`buyer.css`, `EventHero.tsx`)
- Overlay dual (lateral + vertical) para mejor legibilidad
- Cover con `shadow-xl` y borde luminoso
- Badge de precio destacado (`.buyer-hero__price`)
- Metadata alineada con `align-items: center`

### Buscador (`buyer.css`)
- Panel sticky glass (blur + saturate)
- Inputs con fondo oscuro semitransparente
- Botón Buscar con ancho mínimo y sombra primaria

### Galería (`buyer.css`)
- Cards con `shadow-sm` base, `shadow-lg` en hover
- Elevación -3px y zoom de imagen conservado

### Checkout (`buyer.css`)
- Drawer con gradiente superior y animación slide-up
- Resumen estilo Stripe (surface, padding ampliado)
- Miniaturas con borde y sombra

### Dashboard fotógrafo (`dashboard.css`)
- KPIs con línea gradiente superior en hover
- Elevación y sombra al interactuar

---

## Archivos modificados

```
src/app/styles/tokens.css
src/app/styles/ui.css
src/app/styles/chrome.css
src/app/styles/landing.css
src/app/styles/buyer.css
src/app/styles/dashboard.css
src/app/styles/animations.css
src/components/EventHero.tsx
UI-UX-SPRINT-REPORT.md (nuevo)
```

**No modificados:** rutas API, lógica de checkout, hooks, Supabase, Mercado Pago.

---

## Responsive verificado (CSS)

Breakpoints cubiertos en reglas existentes y ampliadas:

| Ancho | Áreas |
|---|---|
| 320–390px | Filtros full-width, padding reducido, botones flex |
| 640px+ | Grid de filtros 3 columnas |
| 768px+ | Navbar desktop, hero 21:9, landing 2-col |
| 1024px+ | Lightbox sidebar, landing mockup, filtros 4-col |
| 1280–1920px | Contenedores max 72–80rem centrados |

No se detectaron regresiones de layout en build estático.

---

## Accesibilidad

- `:focus-visible` en navbar y primitivas DS existentes
- `prefers-reduced-motion: reduce` global
- Placeholders con contraste mejorado
- `ds-field__error` con `role="alert"` en componentes Input/Select/Textarea (sin cambios)

---

## Performance

- Solo CSS; sin dependencias nuevas
- First Load JS sin incremento (build comparado con baseline del proyecto)
- Animaciones scroll-driven solo donde el navegador las soporta

---

## Confirmación build

```bash
npm run build
# ✓ Compiled successfully
# ✓ Generating static pages (51/51)
```

---

## Próximos pasos opcionales (fuera de este sprint)

- Capturas visuales en staging/producción post-deploy
- Auditoría Lighthouse en `/`, `/eventos/[slug]`, `/fotografos`
- Revisión de contraste WCAG en badges del hero sobre fotos claras
