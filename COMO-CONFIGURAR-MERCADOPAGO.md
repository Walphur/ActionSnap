# Configurar Mercado Pago Connect (Action Snap)

El botón **Conectar Mercado Pago** en `/fotografos` → **Ajustes** usa OAuth. Si falta configuración, verás:

> `MERCADOPAGO_CLIENT_ID no configurado`

Eso se arregla en **Render** (producción), no en el panel del fotógrafo.

---

## Qué necesitás

1. Una **aplicación** en Mercado Pago Developers (cuenta del dueño de Action Snap).
2. **4 variables** en Render.
3. La **Redirect URL** registrada en Mercado Pago.

---

## Paso 1 — Crear app en Mercado Pago

1. Entrá a https://www.mercadopago.com.ar/developers/panel/app
2. **Crear aplicación** (o usá una existente).
3. Nombre sugerido: `Action Snap`.
4. Tipo: aplicación con **Checkout** y **Marketplace / Split** si está disponible.

Anotá:

| Dato | Dónde está en MP |
|------|------------------|
| **Client ID** | Credenciales de producción (o prueba) |
| **Client Secret** | Mismo panel |
| **Access Token** | Token de la aplicación (producción para actionsnap.store) |

> Para cobrar de verdad usá credenciales de **producción**. Para pruebas, credenciales de **prueba**.

---

## Paso 2 — Redirect URL en Mercado Pago

En la app de Mercado Pago → **Redirect URL** / **URLs de redirección**, agregá:

```
https://actionsnap.store/api/mercadopago/callback
```

Si probás en local:

```
http://localhost:3000/api/mercadopago/callback
```

Tiene que coincidir **exacto** (https, sin barra final de más).

---

## Paso 3 — Variables en Render

Render → tu servicio → **Environment** → agregá:

| Variable | Valor |
|----------|--------|
| `NEXT_PUBLIC_APP_URL` | `https://actionsnap.store` |
| `MERCADOPAGO_CLIENT_ID` | Client ID de tu app MP |
| `MERCADOPAGO_CLIENT_SECRET` | Client Secret de tu app MP |
| `MERCADOPAGO_ACCESS_TOKEN` | Access Token de la app (plataforma) |

Opcional (solo si la URL de callback es otra):

```
MERCADOPAGO_REDIRECT_URI=https://actionsnap.store/api/mercadopago/callback
```

**Save Changes** → esperá el redeploy (~2–3 min).

---

## Paso 4 — Vincular tu cuenta de fotógrafo

1. Entrá a https://actionsnap.store/fotografos
2. Tab **Ajustes**
3. **Conectar Mercado Pago**
4. Iniciás sesión en Mercado Pago y autorizás
5. Volvés al panel con “Mercado Pago vinculado”

El **Collector ID** se guarda solo en tu perfil (`mp_receiver_id`).

---

## Split de comisiones

- **20%** plataforma (Action Snap)
- **80%** fotógrafo

Requiere que el checkout use la cuenta vinculada del fotógrafo + `MERCADOPAGO_ACCESS_TOKEN` de la app marketplace.

---

## Errores frecuentes

| Error | Causa | Solución |
|-------|--------|----------|
| `MERCADOPAGO_CLIENT_ID no configurado` | Falta variable en Render | Paso 3 |
| `MERCADOPAGO_ACCESS_TOKEN no configurado` | Falta token de la app | Agregar en Render |
| `invalid_state` | Cookie / volviste atrás en OAuth | Reintentar Conectar |
| Redirect mismatch | URL distinta en MP vs app | Igualar callback en panel MP |
| Pagos sin split | Fotógrafo no conectó MP | Ajustes → Conectar Mercado Pago |

---

## Checklist

- [ ] App creada en Mercado Pago Developers
- [ ] Redirect URL = `https://actionsnap.store/api/mercadopago/callback`
- [ ] `MERCADOPAGO_CLIENT_ID` en Render
- [ ] `MERCADOPAGO_CLIENT_SECRET` en Render
- [ ] `MERCADOPAGO_ACCESS_TOKEN` en Render
- [ ] `NEXT_PUBLIC_APP_URL=https://actionsnap.store`
- [ ] Redeploy terminado
- [ ] Conectar desde `/fotografos` → Ajustes

---

## Webhook (opcional pero recomendado)

En Mercado Pago → Webhooks / Notificaciones:

```
https://actionsnap.store/api/webhooks/mercadopago
```

Evento: **Pagos** (`payment`).

Así las compras pasan a `paid` automáticamente cuando el piloto paga.
