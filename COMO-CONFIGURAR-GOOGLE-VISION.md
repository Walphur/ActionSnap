# Configurar Google Cloud Vision (OCR de dorsales)

Action Snap usa **Google Cloud Vision** para leer números en las fotos cuando apretás **Limpiar y re-analizar** o **Solo analizar pendientes** en el panel del fotógrafo.

Sin estas credenciales verás:

> Google Cloud Vision no configurado — Configurá GOOGLE_CLIENT_EMAIL y GOOGLE_PRIVATE_KEY

---

## Resumen rápido

1. Creás un proyecto en Google Cloud.
2. Activás la **Cloud Vision API**.
3. Creás una **cuenta de servicio** y descargás un archivo **JSON**.
4. Del JSON copiás **2 valores** a Render (producción) o a `.env.local` (local).
5. Redeploy / reiniciás el servidor y probás de nuevo.

Tiempo estimado: **10–15 minutos**.

---

## Parte 1 — Google Cloud (una sola vez)

### Paso 1: Entrar y crear proyecto

1. Abrí: https://console.cloud.google.com/
2. Iniciá sesión con tu cuenta de Google.
3. Arriba a la izquierda, al lado de **Google Cloud**, click en el **nombre del proyecto**.
4. Click en **Nuevo proyecto** (o **New project**).
5. Nombre sugerido: `ActionSnap`.
6. Click **Crear** / **Create**.
7. Esperá unos segundos y **seleccioná ese proyecto** en el selector de arriba.

### Paso 2: Activar la Vision API

1. Abrí este link directo (con el proyecto ya seleccionado):
   - https://console.cloud.google.com/apis/library/vision.googleapis.com
2. Click en **Habilitar** / **Enable**.
3. Debe quedar en estado **API enabled**.

> Si Google te pide **facturación** (billing): tenés que asociar una cuenta de facturación al proyecto. Vision tiene **~1.000 análisis gratis por mes**; después cobra por imagen. Para pruebas y eventos chicos suele alcanzar con el free tier.

### Paso 3: Crear cuenta de servicio

1. Abrí: https://console.cloud.google.com/iam-admin/serviceaccounts
2. Click **+ Crear cuenta de servicio** / **Create service account**.
3. Completá:
   - **Nombre:** `actionsnap-vision`
   - **ID:** se autocompleta (dejalo así)
4. Click **Crear y continuar** / **Create and continue**.
5. En **Rol** / **Role**, elegí:
   - **Cloud Vision API User**  
   (si no aparece, usá **Editor** solo para probar)
6. Click **Continuar** → **Listo** / **Done**.

### Paso 4: Descargar la clave JSON

1. En la lista de cuentas de servicio, click en la que creaste (`actionsnap-vision@...`).
2. Pestaña **Claves** / **Keys**.
3. **Agregar clave** → **Crear clave nueva** / **Add key** → **Create new key**.
4. Tipo: **JSON**.
5. Click **Crear** — se descarga un archivo como:
   ```
   actionsnap-vision-a1b2c3d4e5.json
   ```
6. **Guardalo en un lugar seguro.** No lo subas a GitHub.

### Paso 5: Qué sacar del JSON

Abrí el archivo con el Bloc de notas. Vas a ver algo así:

```json
{
  "type": "service_account",
  "project_id": "actionsnap-123456",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...(muchas líneas)...\n-----END PRIVATE KEY-----\n",
  "client_email": "actionsnap-vision@actionsnap-123456.iam.gserviceaccount.com",
  "client_id": "123456789",
  ...
}
```

Solo necesitás **dos campos**:

| Variable en Action Snap | Campo del JSON |
|-------------------------|----------------|
| `GOOGLE_CLIENT_EMAIL`   | `client_email` |
| `GOOGLE_PRIVATE_KEY`    | `private_key`  |

Copiá cada valor **completo**, incluyendo comillas si las copiás del JSON (en Render no van las comillas externas).

---

## Parte 2 — Dónde pegar las variables

### En producción (actionsnap.store → Render)

1. Entrá a https://dashboard.render.com/
2. Abrí tu servicio web (Action Snap / victor-films).
3. Menú izquierdo → **Environment**.
4. Agregá estas variables:

**Variable 1**

| Key | Value |
|-----|-------|
| `GOOGLE_CLIENT_EMAIL` | `actionsnap-vision@tu-proyecto.iam.gserviceaccount.com` |

**Variable 2**

| Key | Value |
|-----|-------|
| `GOOGLE_PRIVATE_KEY` | Toda la clave privada (ver abajo) |

#### Cómo pegar `GOOGLE_PRIVATE_KEY` en Render (importante)

El JSON trae la clave con `\n` entre comillas. Tenés **dos formas válidas**:

**Forma A — Una sola línea con `\n` (recomendada en Render)**

Pegá exactamente lo que dice el JSON en `private_key`, por ejemplo:

```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n
```

**Forma B — Varias líneas**

Algunos paneles permiten pegar la key en varias líneas reales:

```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
(más líneas)
-----END PRIVATE KEY-----
```

Si después del deploy falla con error de clave inválida, probá la **Forma A**.

5. Click **Save Changes**.
6. Render redeployea solo. Esperá **2–5 minutos**.

### En local (desarrollo en tu PC)

1. En la raíz del proyecto abrí `.env.local` (si no existe, copiá `.env.example`).
2. Pegá:

```env
GOOGLE_CLIENT_EMAIL=actionsnap-vision@tu-proyecto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
```

3. Guardá (`Ctrl+S`).
4. Reiniciá el servidor:

```powershell
npm run dev
```

---

## Parte 3 — Probar que funciona

1. Entrá a https://actionsnap.store/fotografos (o local).
2. Elegí un evento con fotos subidas.
3. Abrí **OCR avanzado**.
4. Click **Limpiar y re-analizar**.

**Si está bien configurado:**

- Desaparece el mensaje gris de “Google Cloud Vision no configurado”.
- El análisis corre (puede tardar según cantidad de fotos).
- Algunas fotos pueden quedar sin dorsal (normal en motocross); ahí etiquetás manual.

**Si sigue fallando:**

| Síntoma | Qué revisar |
|---------|-------------|
| Sigue diciendo “no configurado” | Variables en Render sin espacios de más; redeploy terminado |
| Error 400 / clave inválida | Formato de `GOOGLE_PRIVATE_KEY` (usar `\n`) |
| Error 403 / billing | Activar facturación en Google Cloud |
| Error 403 / API disabled | Habilitar Cloud Vision API (Paso 2) |
| No detecta números | La API funciona; el OCR a veces falla — usá etiquetado manual |

---

## Opcional: IA al subir fotos (automático)

Por defecto, al **subir** fotos la IA no corre en Render porque:

- `DETECTION_DISABLE_LOCAL=true` (OCR local apagado en el servidor)

Si querés que también analice al subir, agregá en Render:

```env
DETECTION_USE_CLOUD=true
```

(y las mismas credenciales de Google Vision de arriba).

---

## Alternativa más simple: API Key (solo si no querés JSON)

1. Google Cloud → **APIs y servicios** → **Credenciales**.
2. **+ Crear credenciales** → **Clave de API**.
3. Restringí la clave a **Cloud Vision API** (recomendado).
4. En Render:

```env
GOOGLE_VISION_API_KEY=AIzaSy...
```

Action Snap acepta **Service Account (recomendado)** o **API Key**, no hace falta las dos.

---

## Costos aproximados

- **~1.000 detecciones de texto gratis por mes** (tier gratuito de Google).
- Después: orden de **USD 1,50 por 1.000 imágenes** (precio puede cambiar; ver pricing de Google Cloud Vision).
- Para un evento de 200–500 fotos, normalmente entra en lo gratis.

---

## Seguridad

- **Nunca** commitees el JSON ni las keys a GitHub.
- Si se filtró una clave: en Google Cloud → Cuentas de servicio → Claves → **Eliminar** la clave vieja y crear una nueva.
- En Render las variables ya están marcadas como secretas.

---

## Checklist final

- [ ] Proyecto creado en Google Cloud
- [ ] Cloud Vision API **habilitada**
- [ ] Cuenta de servicio creada
- [ ] JSON descargado
- [ ] `GOOGLE_CLIENT_EMAIL` en Render
- [ ] `GOOGLE_PRIVATE_KEY` en Render (formato correcto)
- [ ] Deploy de Render terminado
- [ ] Probado **Limpiar y re-analizar** en `/fotografos`

Si algo no cierra, decime en qué paso te trabaste (número de paso + captura) y lo vemos.
