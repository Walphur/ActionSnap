# CORS del bucket HD (R2) — obligatorio para subida directa

En Cloudflare Dashboard → R2 → bucket `hd-originals` (o el de `R2_BUCKET_HD`) → Settings → CORS Policy,
pegá el JSON de `r2-hd-cors.json`.

Sin eso el navegador no puede hacer PUT a la URL firmada y la app cae al proxy por Render (más lento / más RAM).
