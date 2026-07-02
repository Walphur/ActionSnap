# Beta Checklist — Action Snap RC1

Checklist para probar con **5 fotógrafos reales** durante varios días.

Marcá cada ítem al completarlo. Anotá problemas en el canal de feedback acordado.

---

## Pre-requisitos (antes de empezar)

- [ ] Cuenta de fotógrafo creada y verificada
- [ ] Cuenta de Mercado Pago activa (Argentina)
- [ ] Al menos 50–100 fotos de prueba (JPG/WebP)
- [ ] Segundo dispositivo o navegador para simular comprador
- [ ] Email de prueba para magic link de compras

---

## Onboarding fotógrafo

- [ ] Registrarse en `/fotografos/registro`
- [ ] Completar login (email o Google)
- [ ] Ver checklist de "Primeros pasos" en el panel
- [ ] Leer tips contextuales (primera visita a cada tab)
- [ ] Conectar Mercado Pago desde el panel
- [ ] Confirmar badge "Conectado" en Mercado Pago

---

## Crear y publicar evento

- [ ] Crear primer evento (título, slug, deporte, fecha, precio)
- [ ] Marcar "Publicar al crear" o publicar después
- [ ] Subir portada (URL, primera foto, o archivo)
- [ ] Subir lote de fotos (probar con 20+ fotos)
- [ ] Ver barra de progreso durante la subida
- [ ] Etiquetar dorsales manualmente (mínimo 10 fotos)
- [ ] Probar atajos: Guardar y siguiente, multiselección
- [ ] Publicar evento si quedó en borrador
- [ ] Verificar badge "Publicado" en la tarjeta del evento

---

## Compartir y vender

- [ ] Copiar enlace del evento publicado
- [ ] Compartir por WhatsApp
- [ ] Ver código QR
- [ ] Abrir galería pública `/eventos/[slug]` en incógnito
- [ ] Completar compra de prueba (otro usuario/email)
- [ ] Ver primera venta en el panel
- [ ] Ver celebración de primera venta
- [ ] Completar feedback "¿Cómo fue tu experiencia?"

---

## Flujo comprador (segundo usuario)

- [ ] Entrar a la landing `/`
- [ ] Explorar eventos en `/explorar`
- [ ] Abrir evento publicado
- [ ] Buscar fotos por dorsal
- [ ] Seleccionar 1–3 fotos
- [ ] Abrir checkout y pagar con Mercado Pago
- [ ] Ver página de compra exitosa
- [ ] Descargar fotos en HD
- [ ] Descargar ZIP (si compró más de una)
- [ ] Ver compras en `/mis-compras` (magic link email)
- [ ] Completar feedback de compra

---

## Panel fotógrafo — uso continuo

- [ ] Subir 100+ fotos en un solo evento
- [ ] Etiquetar lote grande (100+ fotos)
- [ ] Revisar estadísticas del evento
- [ ] Editar precio o descuento pack
- [ ] Revisar ventas en Resumen
- [ ] Cerrar sesión y volver a entrar
- [ ] Verificar que el checklist desaparece al completar todos los pasos

---

## Responsive (opcional pero recomendado)

- [ ] Panel fotógrafo en celular (Android o iPhone)
- [ ] Galería y checkout en celular
- [ ] Tab bar inferior funciona (Explorar, Mis compras, Fotógrafo)
- [ ] Sin scroll horizontal en ninguna pantalla probada

---

## Problemas a reportar

Si algo falla, anotá:

1. **Qué hiciste** (paso a paso)
2. **Qué esperabas**
3. **Qué pasó**
4. **Dispositivo y navegador**
5. **Captura de pantalla** si es posible

Enviar a: **hola@actionsnap.store**

---

## Checklist de Lanzamiento (post-beta)

Solo avanzar cuando la beta con 5 fotógrafos esté completa.

### Producto
- [ ] 5 fotógrafos completaron el flujo sin bloqueos críticos
- [ ] Al menos 10 ventas reales procesadas
- [ ] Feedback de beta revisado y priorizado
- [ ] Bugs críticos de beta resueltos

### Técnico
- [ ] Variables de entorno de producción verificadas
- [ ] Webhooks Mercado Pago en producción
- [ ] Dominio y SSL configurados
- [ ] Backup Supabase configurado
- [ ] Monitoreo de errores (Sentry o similar)

### Legal y operaciones
- [ ] Términos y privacidad revisados por abogado
- [ ] Canal de soporte definido (email/WhatsApp)
- [ ] Política de reembolsos documentada

### Go-live
- [ ] Anuncio a lista de espera / fotógrafos beta
- [ ] Documentación de onboarding para nuevos fotógrafos
- [ ] Plan de escalado si hay pico de tráfico

---

## Flujo oficial (no cambiar sin validación)

```
Subir fotos → Etiquetar manualmente → Publicar → Vender
```

La beta debe validar que este flujo funciona sin fricción para fotógrafos reales en cancha.
