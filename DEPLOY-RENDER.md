# Subir Victor Films / Moto Fotos a Render

Sí, la app está lista para **Render** como **Web Service** (Node.js + Next.js).

## Requisitos previos

1. Cuenta en [render.com](https://render.com)
2. Repo en **GitHub** (subí el proyecto con `git push`)
3. **Supabase** ya configurado (schema + bucket `photos` público)
4. Opcional: **Stripe** para pagos en producción

## Pasos rápidos

### 1. Subir código a GitHub

```powershell
cd C:\Users\User\Projects\moto-fotos
git remote add origin https://github.com/TU_USUARIO/moto-fotos.git
git push -u origin master
```

### 2. Crear servicio en Render

1. **Dashboard** → **New +** → **Web Service**
2. Conectá el repo `moto-fotos`
3. Render detecta Node; si no, usá:
   - **Build Command:** `npm ci && npm run build`
   - **Start Command:** `npm start`
4. Plan **Free** (para probar) o **Starter** (más estable para subidas de fotos)

O importá el blueprint: **New +** → **Blueprint** → elegí el repo (usa `render.yaml`).

### 3. Variables de entorno (obligatorias)

En **Environment** del servicio:

| Variable | Ejemplo |
|----------|---------|
| `NEXT_PUBLIC_APP_URL` | `https://victor-films.onrender.com` (tu URL de Render) |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | clave anon |
| `SUPABASE_SERVICE_ROLE_KEY` | service role (secreto) |
| `DETECTION_DISABLE_LOCAL` | `true` (recomendado en Render) |
| `DOWNLOAD_SIGNING_SECRET` | cadena larga aleatoria |

### 4. Stripe (si usás pagos)

| Variable | Dónde |
|----------|--------|
| `STRIPE_SECRET_KEY` | Dashboard Stripe |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Webhooks → endpoint |

**Webhook en producción:**

```
https://TU-SERVICIO.onrender.com/api/webhooks/stripe
```

Eventos: `checkout.session.completed`

### 5. Cloudflare R2 (recomendado para fotos nuevas)

Guide completa: **[docs/R2-SETUP.md](./docs/R2-SETUP.md)**

| Variable | Dónde |
|----------|--------|
| `R2_ACCOUNT_ID` | Cloudflare Dashboard → R2 |
| `R2_ACCESS_KEY_ID` | R2 → Manage API Tokens |
| `R2_SECRET_ACCESS_KEY` | Idem |
| `R2_BUCKET_HD` | `hd-originals` (default) |
| `R2_BUCKET_PREVIEW` | `public-previews` (default) |
| `R2_PUBLIC_BASE_URL` | URL pública del bucket de previews (sin `/` final) |

Sin estas variables, las fotos nuevas siguen yendo a **Supabase Storage**.

### 6. Cloudinary (opcional, solo legacy)

Si preferís Cloudinary en vez de solo Supabase Storage, agregá `CLOUDINARY_*` en Environment.

### 7. Deploy

**Manual Deploy** o push a `master` → Render construye y publica.

La primera build puede tardar **5–10 minutos**.

## Notas importantes

- **Plan Free:** el servicio se “duerme” sin visitas (~1 min al despertar). Para mostrarle a un cliente, mejor **Starter**.
- **Subida de fotos:** con R2 configurado usa Cloudflare R2; si no, Supabase Storage. Las fotos viejas en Supabase siguen descargándose.
- **Marca de agua:** se genera en el servidor (Sharp); en Free puede ir un poco lento con muchas fotos grandes.
- **OCR / IA local:** desactivado en Render (`DETECTION_DISABLE_LOCAL=true`). Etiquetá números manual en el panel.
- **Supabase:** en Authentication → URL Configuration podés agregar la URL de Render si usás auth más adelante.

## Probar después del deploy

1. `https://tu-app.onrender.com` — inicio  
2. `https://tu-app.onrender.com/admin` — panel fotógrafo  
3. Crear carrera, subir fotos, etiquetar dorsales  

## Si falla el build

- Revisá **Logs** en Render
- Verificá que todas las env vars estén definidas
- `NEXT_PUBLIC_APP_URL` debe ser la URL **https** final (sin barra al final)
