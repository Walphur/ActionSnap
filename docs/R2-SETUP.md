# Cloudflare R2 — fotos de Action Snap

Storage principal para **fotos nuevas** (preview con marca de agua + original HD).
Las fotos ya subidas a Supabase **siguen funcionando** sin migrar.

## Por qué R2

| | Supabase free | Cloudflare R2 free |
|--|---------------|---------------------|
| Storage | ~1 GB | **10 GB** |
| Egress (descargas) | cuenta | **gratis** |
| S3-compatible | no | sí |

## Pasos en Cloudflare

### 1. Crear buckets

1. Entrá a [dash.cloudflare.com](https://dash.cloudflare.com) → **R2 Object Storage**.
2. Creá dos buckets:
   - `hd-originals` — **privado** (solo firmado; descargas post-compra)
   - `public-previews` — acceso público (galería con watermark)

### 2. Acceso público a previews

En el bucket `public-previews`:

1. **Settings** → **Public access**
2. Conectá un **R2.dev subdomain** (ej. `https://pub-XXXX.r2.dev`)  
   o un custom domain (ej. `https://cdn.actionsnap.store`)
3. Esa URL base (sin barra al final) es `R2_PUBLIC_BASE_URL`

### 3. API token S3

1. R2 → **Manage R2 API Tokens** → **Create API token**
2. Permisos: **Object Read & Write** (o Admin de lectura/escritura sobre esos buckets)
3. Copiá:
   - **Access Key ID** → `R2_ACCESS_KEY_ID`
   - **Secret Access Key** → `R2_SECRET_ACCESS_KEY`
4. El **Account ID** está en la URL/dashboard R2 → `R2_ACCOUNT_ID`

### 4. Variables en Render / `.env.local`

```env
R2_ACCOUNT_ID=tu_account_id
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_HD=hd-originals
R2_BUCKET_PREVIEW=public-previews
R2_PUBLIC_BASE_URL=https://pub-xxxx.r2.dev
```

Sin estas variables, la app **sigue subiendo a Supabase** (fallback).

## Cómo guarda la app

| Campo DB | Valor nuevo (R2) | Valor viejo (Supabase) |
|----------|------------------|------------------------|
| `preview_url` | `https://…r2.dev/{path}.jpg` | URL pública Supabase |
| `original_url` | `r2://hd/{photographer}/{event}/{photo}.jpg` | path interno en `hd-originals` |

Path de objeto: `{photographer_id}/{event_id}/{photo_id}.jpg`

## Verificar

1. Subí una foto desde el panel fotógrafo.
2. En la respuesta API debería aparecer `"storage": "r2"`.
3. La preview de la galería debe cargar desde tu dominio R2.
4. Tras una compra de prueba, la descarga HD debe abrir un link firmado de R2 (~1 h).

## CORS (si subís directo al navegador en el futuro)

Por ahora el upload va por el servidor Next.js; no hace falta CORS en R2.
Si más adelante usás presigned PUT desde el browser, agregá tu dominio en la política CORS del bucket.
