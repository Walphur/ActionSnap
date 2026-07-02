# Action Snap — Design System

Sistema de diseño profesional para Action Snap 2.0.  
**Sprint 4** — listo para consumo en Sprints 5–10 (Landing, Dashboard, Checkout, Admin).

---

## Principios

1. **Un solo lenguaje visual** — Stripe / Linear / Vercel level (referencia, no copia).
2. **Tokens primero** — nada hardcodeado en componentes nuevos; usar variables CSS.
3. **Inter por defecto** — Bebas solo en hero, números destacados y landing display.
4. **Lucide único** — iconografía consistente (excepto logos OAuth de terceros hasta migración).
5. **Compatibilidad** — clases legacy (`btn-primary`, `card`, `--accent`) siguen funcionando.

---

## Estructura de archivos

```text
src/app/styles/
  tokens.css       # Design tokens + aliases legacy
  typography.css   # Escala tipográfica .ds-h1 … .ds-overline
  animations.css   # Duraciones, keyframes, utilidades motion
  ui.css           # Estilos primitivos .ds-*
  base.css         # Reset / body / .card legacy
  buttons.css      # .btn-primary|secondary|ghost legacy

src/components/ui/
  Button.tsx … Toast (via toast.ts)
  index.ts         # Barrel export

src/lib/ui/
  cn.ts            # className helper + tipos compartidos
```

---

## Tokens

### Spacing

| Token | Valor |
|-------|-------|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 20px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-10` | 40px |
| `--space-12` | 48px |
| `--space-16` | 64px |

### Radius (Design System)

| Token | Valor |
|-------|-------|
| `--ds-radius-sm` | 12px |
| `--ds-radius-md` | 16px |
| `--ds-radius-lg` | 20px |
| `--ds-radius-xl` | 24px |
| `--ds-radius-full` | 9999px |

**Legacy (páginas actuales):** `--radius`, `--radius-lg`, `--radius-xl` sin cambios.

### Sombras

| Token | Uso |
|-------|-----|
| `--shadow-sm` | Cards, inputs |
| `--shadow-md` | Dropdowns, tooltips |
| `--shadow-lg` | Modals, drawers |
| `--shadow-glow` | Acento brand (hero/CTA) |

### Colores

| Token | Rol |
|-------|-----|
| `--color-bg` | Fondo app |
| `--color-bg-elevated` | Paneles elevados |
| `--color-surface` | Superficie base |
| `--color-surface-hover` | Hover superficie |
| `--color-card` | Cards |
| `--color-border` | Bordes |
| `--color-border-hover` | Bordes hover |
| `--color-text-primary` | Texto principal |
| `--color-text-secondary` | Texto secundario |
| `--color-text-disabled` | Deshabilitado |
| `--color-primary` | Brand / CTA |
| `--color-primary-hover` | CTA hover |
| `--color-primary-muted` | Focus rings, selección |
| `--color-success` | Éxito |
| `--color-warning` | Advertencia |
| `--color-danger` | Error |
| `--color-info` | Información |
| `--color-overlay` | Backdrop modal |
| `--color-focus-ring` | Anillo foco |

**Aliases legacy:** `--bg`, `--surface`, `--text`, `--muted`, `--accent`, etc.

### Motion

| Token | Valor |
|-------|-------|
| `--duration-fast` | 120ms |
| `--duration-normal` | 200ms |
| `--duration-slow` | 320ms |
| `--ease-out` | cubic-bezier(0.16, 1, 0.3, 1) |
| `--ease-in-out` | cubic-bezier(0.45, 0, 0.55, 1) |

---

## Tipografía

| Clase | Uso | Fuente |
|-------|-----|--------|
| `.ds-h1` | Título página hero | Bebas |
| `.ds-h2` | Sección principal | Bebas |
| `.ds-h3` | Subsección | Inter 600 |
| `.ds-h4` | Título card | Inter 600 |
| `.ds-body-lg` | Lead / intro | Inter |
| `.ds-body` | Cuerpo | Inter |
| `.ds-caption` | Meta / secundario | Inter |
| `.ds-label` | Labels formulario | Inter uppercase |
| `.ds-overline` | Eyebrow | Inter uppercase |
| `.ds-display` | Números destacados | Bebas |

---

## Componentes base

Importar desde `@/components/ui`:

```tsx
import { Button, Input, Card, Badge, toast } from "@/components/ui";
```

| Componente | Archivo | Client? |
|------------|---------|---------|
| Button | `Button.tsx` | No |
| Input | `Input.tsx` | No |
| Textarea | `Textarea.tsx` | No |
| Select | `Select.tsx` | No |
| Checkbox | `Checkbox.tsx` | No |
| Switch | `Switch.tsx` | No |
| Radio | `Radio.tsx` | No |
| Badge | `Badge.tsx` | No |
| Chip | `Chip.tsx` | No |
| Alert | `Alert.tsx` | No |
| Card | `Card.tsx` | No |
| Modal | `Modal.tsx` | Sí |
| Tabs | `Tabs.tsx` | Sí |
| Accordion | `Accordion.tsx` | Sí |
| Tooltip | `Tooltip.tsx` | No |
| Dropdown | `Dropdown.tsx` | Sí |
| Table | `Table.tsx` | No |
| Pagination | `Pagination.tsx` | Sí |
| Avatar | `Avatar.tsx` | No |
| EmptyState | `EmptyState.tsx` | No |
| Skeleton | `Skeleton.tsx` | No |
| Spinner | `Spinner.tsx` | No |
| Toast | `toast.ts` | Wrapper Sonner |

---

## Estados (todos los componentes interactivos)

- **Hover** — transición `--duration-normal`
- **Focus** — `box-shadow: 0 0 0 3px var(--color-focus-ring)` o `--color-primary-muted`
- **Pressed** — `.ds-pressable:active` scale 0.98
- **Disabled** — opacity 0.45–0.5, `pointer-events: none`
- **Loading** — `data-loading` en Button + Spinner
- **Selected** — `data-selected="true"` en Chip, Tabs, Table, Pagination
- **Success / Error** — `data-success` / `data-error` en inputs; tones en Alert/Badge

---

## Ejemplos de uso

### Button

```tsx
<Button variant="primary" size="md" loading={isPending}>
  Pagar
</Button>

{/* Compat legacy — misma apariencia que btn-primary */}
<Button variant="primary" legacyClass="btn-primary">
  Continuar
</Button>
```

### Input con error

```tsx
<Input
  label="Email"
  name="email"
  type="email"
  error={errors.email}
  hint="Usamos este email para enviarte las descargas."
/>
```

### Card

```tsx
<Card>
  <CardHeader><h3 className="ds-h4">Ventas</h3></CardHeader>
  <CardBody>…</CardBody>
  <CardFooter><Button variant="secondary">Ver más</Button></CardFooter>
</Card>
```

### Toast

```tsx
import { toast } from "@/components/ui";

toast.success("Pago confirmado");
toast.error("No se pudo subir la foto");
```

### Modal

```tsx
<Modal open={open} onClose={() => setOpen(false)} title="Confirmar" footer={<Button onClick={…}>OK</Button>}>
  …
</Modal>
```

---

## Iconografía

- **Estándar:** `lucide-react` en todos los componentes UI nuevos.
- **Excepción temporal:** logo Google en `SocialAuthButtons` (OAuth brand) — migrar en Sprint 5+ si hay icono alternativo aprobado.
- **Prohibido en código nuevo:** emojis en UI, SVG inline sueltos.

---

## Animaciones

Clases utilitarias:

- `.ds-animate-fade-in`
- `.ds-animate-scale-in`
- `.ds-animate-slide-up` / `.ds-animate-slide-down`
- `.ds-transition`
- `.ds-hover-lift` / `.ds-hover-scale`

Modals, dropdowns y tooltips usan keyframes de `animations.css`.

---

## Compatibilidad con código existente

| Legacy | Equivalente DS |
|--------|----------------|
| `.btn-primary` | `Button variant="primary"` o `legacyClass="btn-primary"` |
| `.btn-secondary` | `Button variant="secondary"` |
| `.btn-ghost` | `Button variant="ghost"` |
| `.card` | `Card` o `.ds-card` |
| `var(--accent)` | `var(--color-primary)` |
| `var(--muted)` | `var(--color-text-secondary)` |
| `font-display` | `.ds-display` / `.ds-h1` |

**No migrar aún:** Landing, Dashboard, Checkout, Admin — Sprint 5–10.

---

## Buenas prácticas

1. Preferir `@/components/ui` sobre clases sueltas en código nuevo.
2. No hardcodear colores/spacing en TSX — usar tokens CSS o props de variant.
3. Bebas solo donde indica la escala tipográfica.
4. Formularios: siempre `label` + `error`/`hint` en Input/Select/Textarea.
5. Feedback: `toast` para acciones; `Alert` para mensajes persistentes en página.
6. Listas vacías: `EmptyState` + acción primaria.

---

## Próximos sprints

- **Sprint 5 Landing** — reemplazar markup con DS components + `.ds-h1` hero
- **Sprint 6 Dashboard** — AdminCard → Card, field-input → Input
- **Sprint 9 Checkout** — CheckoutDrawer → Modal/Drawer DS
- **Sprint 10 Admin** — Table, Badge, Pagination

---

## Referencia rápida variables CSS

Ver `src/app/styles/tokens.css` para la lista completa exportada.
