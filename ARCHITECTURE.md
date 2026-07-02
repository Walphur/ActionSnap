# Action Snap Frontend Architecture

## Scope

Documento de arquitectura frontend (Sprint 3).  
No cubre contratos de backend ni cambios de API.

## Estructura de carpetas

```text
src/
  app/
    (rutas Next.js)
    styles/
      tokens.css
      base.css
      buttons.css
    globals.css
  components/
    admin/
    auth/
    checkout/
    landing/
    photographer/
    racer/
    legal/
    ...
  hooks/
    usePhotographerDashboard.ts
    usePurchaseStatus.ts
  lib/
    (helpers de negocio y clientes)
  types/
    admin.ts
    checkout.ts
    event.ts
    photo.ts
    purchase.ts
    user.ts
  legacy/
    deprecated/
      README.md
```

## Capas

- **Routing / Composition (`src/app`)**: ensambla páginas, layouts y server/client boundaries.
- **UI Components (`src/components`)**: bloques visuales y contenedores por dominio.
- **Hooks (`src/hooks`)**: estado y efectos reutilizables de frontend.
- **Domain Utilities (`src/lib`)**: lógica de negocio compartida.
- **Types (`src/types`)**: contratos TS reutilizables en frontend.
- **Legacy (`src/legacy`)**: código descontinuado aislado del árbol activo.

## Flujo principal de compra

1. `EventPhotoGallery` / `PhotoGrid` construyen selección.
2. `CheckoutDrawer` envía a `/api/checkout`.
3. Redirect de pago a `/compra/exito`.
4. `PurchaseSuccess` usa `usePurchaseStatus` para polling.
5. Si está `paid`, renderiza links HD/ZIP.
6. `DownloadPanel` y `/descargas` mantienen acceso por token.

## Responsabilidades por dominio

- **Photographer**
  - `PhotographerDashboard`: shell de tabs y composición.
  - `usePhotographerDashboard`: carga de overview/eventos/profile, creación de evento, upload por lote, guardado manual MP.
  - `BulkTagger`, `EventCoverPanel`, `EditEventPanel`, `AdminStats`, `WatermarkSettings`: operaciones separadas por función.

- **Checkout**
  - `PurchaseSuccess`: presentación de estados.
  - `usePurchaseStatus`: parse query + polling + timeout.

- **Admin**
  - `SuperAdminDashboard`: supervisión plataforma.
  - `AdminCard`/`AdminField`: bloques reutilizables.

- **Racer**
  - `RacerPurchasesPanel`: historial y descarga autenticada.

## Dependencias entre módulos (alto nivel)

- `app/*` -> `components/*` -> `hooks/*` -> `lib/*` -> APIs
- `components/*` -> `types/*` (contratos compartidos)
- `globals.css` -> `styles/*.css` (tokens/base/buttons)

## Convenciones

- No mezclar lógica de polling/fetch compleja dentro de componentes visuales si se puede extraer a hook.
- Tipos compartidos en `src/types` cuando se usan en 2+ módulos.
- Componentes legacy no se renderizan desde `src/app`.
- Sin cambios visuales en refactors de arquitectura.

## Estado de código legacy

Se removió del árbol activo código no renderizado y quedó documentado en:

- `src/legacy/deprecated/README.md`

## Riesgos técnicos pendientes

- `PhotographerDashboard` sigue siendo componente grande (aunque con lógica principal extraída a hook).
- `globals.css` aún contiene estilos de múltiples dominios; el split actual es inicial.
- Falta estandarizar hooks para más flujos (`useUpload`, `useGallery`, `useAdmin`, `useAuth`).

## Preparación para Sprint 4 (Design System)

- Tokens de estilo ya desacoplados en `styles/tokens.css`.
- Botones base centralizados en `styles/buttons.css`.
- Tipos de dominio centralizados para facilitar componentes UI genéricos.
- Código legacy fuera del camino crítico para reducir ruido de refactor visual.
