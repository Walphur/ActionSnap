# Moto Fotos

Plataforma web para fotógrafos de carreras de motos: subir fotos a la nube, **detectar dorsales con IA**, que los corredores **busquen por número**, **paguen con Stripe** y **descarguen en alta resolución**.

## Qué hace

| Rol | Función |
|-----|---------|
| **Fotógrafo** | Crea carreras, sube lotes de fotos a Cloudinary, publica el evento |
| **Corredor** | Busca por dorsal (#42), ve previews con marca de agua, paga y descarga HD |
| **IA** | OpenAI Vision lee números en motos/pilotos y los guarda para búsqueda rápida |

## Stack

- **Next.js 15** — frontend y API
- **Supabase** — base de datos y (opcional) auth
- **Cloudinary** — almacenamiento, CDN, marca de agua y enlaces de descarga firmados
- **Stripe** — pagos
- **OpenAI** (`gpt-4o-mini`) — detección de números de dorsal

> **¿Google Drive?** Para miles de fotos en web, Cloudinary (o S3) es más simple: subida directa, URLs optimizadas y descargas firmadas. Drive se puede integrar después si lo necesitás.

## Instalación

### 1. Node.js

Instalá [Node.js LTS](https://nodejs.org/) (incluye `npm` y `git`).

```powershell
cd C:\Users\User\Projects\moto-fotos
npm install
copy .env.example .env.local
```

### 2. Supabase

1. Creá un proyecto en [supabase.com](https://supabase.com)
2. En **SQL Editor**, pegá y ejecutá `supabase/schema.sql`
3. Copiá URL y keys a `.env.local`

Insertá el fotógrafo demo (solo desarrollo):

```sql
insert into public.profiles (id, full_name, role)
values ('00000000-0000-0000-0000-000000000001', 'Tu amigo fotógrafo', 'photographer');
```

### 3. Cloudinary

1. Cuenta gratis en [cloudinary.com](https://cloudinary.com)
2. Settings → Upload → **Add upload preset** → modo **Unsigned**
3. Carpeta sugerida: `moto-fotos`
4. Completá `CLOUDINARY_*` en `.env.local`

### 4. OpenAI

1. API key en [platform.openai.com](https://platform.openai.com)
2. `OPENAI_API_KEY` en `.env.local`
3. Cada foto subida consume ~1 llamada vision (modelo económico `gpt-4o-mini`)

### 5. Stripe

1. Cuenta en [stripe.com](https://stripe.com) (modo test)
2. Keys en `.env.local`
3. Webhook local:

```powershell
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copiá el `whsec_...` a `STRIPE_WEBHOOK_SECRET`.

> Stripe en Argentina: verificá moneda `ars` en el dashboard; si no está habilitada, cambiá `currency` en `src/app/api/checkout/route.ts` a `usd`.

### 6. Correr

```powershell
npm run dev
```

- Público: http://localhost:3000  
- Panel fotógrafo: http://localhost:3000/admin  

## Flujo de uso

1. **Admin** → Nueva carrera (título, slug, precio, publicar)
2. **Admin** → Subir fotos (JPG/PNG, múltiples)
3. La API sube a Cloudinary, guarda en Supabase y lanza IA para dorsales
4. **Corredor** → Entra a la carrera, busca su número, selecciona fotos, paga
5. Tras el pago → `/descargas?session_id=...` con enlaces HD firmados

## Producción

- Deploy en [Vercel](https://vercel.com) con las mismas variables de entorno
- Activá RLS y **login del fotógrafo** (Supabase Auth) — el panel `/admin` hoy es MVP sin contraseña
- Dominio propio y Stripe en modo live
- Opcional: cola (Inngest / Supabase Edge) para IA en lotes grandes

## Próximos pasos sugeridos

- [ ] Login fotógrafo (email mágico Supabase)
- [ ] Email post-compra con link de descarga (Resend)
- [ ] Packs “todas mis fotos del #42” con descuento
- [ ] Marca de agua con logo del fotógrafo en Cloudinary

## Estructura

```
src/app/
  page.tsx              # Listado de carreras
  eventos/[slug]/       # Galería + búsqueda por dorsal
  admin/                # Panel fotógrafo
  compra/exito/         # Post-pago Stripe
  descargas/            # Descarga HD
  api/upload/           # Subida + IA
  api/checkout/         # Stripe Checkout
  api/webhooks/stripe/  # Confirmación de pago
```

---

Hecho para tu amigo fotógrafo de motos. Cualquier ajuste (precios en pesos, logo, dominio), lo vemos en el siguiente paso.
