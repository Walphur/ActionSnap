# Action Snap — Release Candidate (RC1)

## Estado actual

Action Snap está listo para **beta cerrada con 5 fotógrafos reales**. La plataforma cubre el flujo completo de punta a punta sin depender de IA ni OCR.

| Área | Estado |
|------|--------|
| Seguridad y auth | ✓ Completo |
| Design System | ✓ Rutas públicas + buyer + onboarding |
| Landing y marketing | ✓ |
| Panel fotógrafo | ✓ Con onboarding guiado |
| Experiencia comprador | ✓ |
| Checkout Mercado Pago | ✓ |
| Descargas HD | ✓ |
| Panel admin | ✓ |
| RC1 polish | ✓ Este sprint |

**Build:** `npm run build` ✓ (53 rutas, TypeScript OK)

---

## Funcionalidades terminadas

### Fotógrafo
- Registro / login (email + Google)
- Onboarding con checklist de 8 pasos
- Conexión Mercado Pago OAuth
- Crear eventos, portada, subir fotos
- Etiquetado manual (BulkTagger)
- Publicar evento
- Compartir (link, WhatsApp, Facebook, Instagram, QR)
- Ver ventas y estadísticas

### Comprador
- Landing, explorar eventos
- Galería por evento, filtro por dorsal
- Selección múltiple, checkout drawer
- Pago Mercado Pago
- Página de éxito, descargas HD, ZIP
- Mis compras (magic link email)

### Admin
- Login super admin
- Métricas de plataforma
- Gestión de fotógrafos y eventos

---

## Cambios RC1 (Sprint 9)

| Categoría | Cambio |
|-----------|--------|
| 404 | Nueva página `not-found.tsx` con DS y CTAs |
| Errores | `error.tsx` con copy de producción (sin instrucciones de terminal) |
| Links | `/para-fotografos` → "Explorar eventos" apunta a `/explorar` |
| Landing | Eliminados placeholders "Logo" y testimonios falsos |
| Panel upload | `EventCoverPanel`, `EditEventPanel`, `AdminStats` migrados al DS |
| Loading | Spinner en crear evento, guardar dorsales, portada, editar evento |
| Mensajes | Errores genéricos reemplazados por copy accionable |
| Empty states | CTAs en upload tab (fotos / etiquetado) |
| A11y | `aria-label` en miniaturas del BulkTagger |
| Feedback | Sistema preparado (localStorage) post primera venta/compra/descarga |
| Performance | `loading="lazy"` en imágenes de portada y descargas |

---

## Bugs conocidos

| Bug | Severidad | Workaround |
|-----|-----------|------------|
| `TagNumbersPanel` (IA experimental) visible en upload | Baja | Colapsado; no es flujo oficial |
| QR de share usa API externa (`api.qrserver.com`) | Baja | Requiere internet; copiar link como alternativa |
| Feedback guardado solo en `localStorage` | Esperado | Envío automático pendiente post-beta |
| Dashboard fotógrafo interno parcialmente legacy en CSS global | Baja | Funcional; polish visual futuro |
| `recentSales` en overview limitado a 8 registros | Baja | Suficiente para onboarding y preview |

---

## Limitaciones

- **Sin IA/OCR en flujo oficial** — etiquetado 100% manual
- **Beta cerrada** — sin registro abierto masivo configurado
- **Mercado Pago** — requiere cuenta real del fotógrafo
- **Feedback** — no se envía a servidor aún (preparado para conectar)
- **Métricas landing** — sin estadísticas en vivo (copy honesto de beta)

---

## Pendientes post-beta (desde feedback real)

1. Conectar envío de feedback a backend/email
2. Migración visual completa del dashboard interno al DS
3. Ocultar o remover `TagNumbersPanel` experimental
4. Analytics para fotógrafos
5. Onboarding por video o tour interactivo si los usuarios lo piden

---

## Checklist de Beta

Ver [`BETA-CHECKLIST.md`](BETA-CHECKLIST.md)

## Checklist de Lanzamiento

Ver sección final de [`BETA-CHECKLIST.md`](BETA-CHECKLIST.md)

## QA

Ver [`QA-REPORT.md`](QA-REPORT.md)

---

## Flujo oficial del producto

```
Subir fotos → Etiquetar manualmente → Publicar → Vender
```

No modificar este flujo sin validación con usuarios reales.
