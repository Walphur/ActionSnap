# Cómo abrir el proyecto y poner las keys

## Abrir en Visual Studio Code

1. Abrí **Visual Studio Code** (no Cursor, si querés VS puro).
2. Menú **Archivo** → **Abrir carpeta…**
3. Elegí esta carpeta:
   ```
   C:\Users\User\Projects\moto-fotos
   ```
4. Click **Seleccionar carpeta**.

## Dónde están las keys

En el panel izquierdo (**Explorador**), buscá el archivo:

```
.env.local
```

Está en la raíz del proyecto (misma altura que `package.json` y `README.md`).

- Si no lo ves: en el Explorador arriba hay **⋯** → activá **Mostrar archivos ocultos** o buscá con `Ctrl+P` y escribí `.env.local`.

## Qué pegar en cada línea

| Variable | Dónde la sacás |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → service_role (secreta) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary Dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary Dashboard |
| `OPENAI_API_KEY` | platform.openai.com → API keys |
| `STRIPE_SECRET_KEY` | Stripe → Developers → Secret key (test) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe → Publishable key (test) |
| `DOWNLOAD_SIGNING_SECRET` | Cualquier texto largo aleatorio (ej. 32 caracteres) |

Ejemplo (con valores inventados):

```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Guardar

`Ctrl + S` en `.env.local`.

## Probar

En la terminal de VS Code (`Ctrl+ñ` o Ver → Terminal):

```powershell
npm run dev
```

Abrí http://localhost:3000/admin
