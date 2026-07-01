import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { PLATFORM } from "@/lib/platform";

export const metadata: Metadata = {
  title: `Políticas de Privacidad — ${PLATFORM.name}`,
  description:
    "Cómo Action Snap trata datos personales, uso de IA para dorsales y procesamiento de pagos con Mercado Pago.",
};

export default function PrivacidadLegalesPage() {
  return (
    <LegalDocument
      title="Políticas de Privacidad"
      intro={
        <p>
          En <strong>{PLATFORM.name}</strong> respetamos tu privacidad. Este documento describe qué
          datos recopilamos, para qué los usamos y cómo protegemos la información de fotógrafos,
          pilotos y visitantes de la Plataforma.
        </p>
      }
      sections={[
        {
          id: "datos",
          title: "1. Datos que recopilamos",
          content: (
            <>
              <p>Podemos tratar las siguientes categorías de datos personales:</p>
              <ul>
                <li>
                  <strong>Datos de cuenta:</strong> dirección de correo electrónico, nombre y
                  apellido (cuando se proporcionan al registrarse), rol de usuario (fotógrafo,
                  piloto/atleta o administrador) e identificadores técnicos de autenticación.
                </li>
                <li>
                  <strong>Datos de perfil:</strong> nombre comercial o artístico del fotógrafo,
                  preferencias de marca de agua y estado de vinculación con Mercado Pago Connect.
                </li>
                <li>
                  <strong>Datos de transacciones:</strong> email del comprador, identificadores de
                  compra, montos, estado del pago y referencias de Mercado Pago o Stripe.{" "}
                  <strong>No almacenamos números de tarjeta de crédito ni CVV.</strong>
                </li>
                <li>
                  <strong>Datos técnicos:</strong> dirección IP, tipo de navegador, registros de
                  acceso y cookies estrictamente necesarias para sesión y seguridad.
                </li>
                <li>
                  <strong>Contenido subido:</strong> fotografías, metadatos asociados y etiquetas
                  generadas automáticamente (por ejemplo, dorsales detectados).
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "finalidad",
          title: "2. Finalidad del tratamiento",
          content: (
            <>
              <p>Utilizamos los datos para:</p>
              <ul>
                <li>Crear y administrar cuentas de usuario.</li>
                <li>Publicar eventos, procesar búsquedas y facilitar compras de fotografías.</li>
                <li>Entregar descargas en HD mediante enlaces seguros y temporales.</li>
                <li>Procesar pagos y splits de comisión a través de Mercado Pago Connect.</li>
                <li>Enviar comunicaciones transaccionales (confirmación de compra, acceso a descargas).</li>
                <li>Prevenir fraude, abuso y accesos no autorizados.</li>
                <li>Cumplir obligaciones legales y responder requerimientos de autoridades competentes.</li>
              </ul>
              <p>
                No vendemos ni alquilamos datos personales a terceros con fines publicitarios
                externos.
              </p>
            </>
          ),
        },
        {
          id: "ia",
          title: "3. Uso de inteligencia artificial",
          content: (
            <>
              <p>
                {PLATFORM.name} utiliza servicios de visión por computadora, incluido{" "}
                <strong>Google Cloud Vision</strong>, con un propósito estrictamente funcional:
              </p>
              <ul>
                <li>Detectar y leer <strong>números de dorsal</strong> en motos, cascos o indumentaria.</li>
                <li>
                  Identificar <strong>atributos visuales genéricos</strong>, como colores
                  predominantes de vehículos o equipamiento, para facilitar filtros de búsqueda.
                </li>
              </ul>
              <p>
                <strong>
                  No realizamos reconocimiento facial biométrico ni identificación de personas
                </strong>{" "}
                con el fin de determinar la identidad de un individuo sin su consentimiento
                expreso. La IA no se emplea para crear perfiles biométricos, vigilancia masiva ni
                categorización sensible de personas.
              </p>
              <p>
                Las imágenes enviadas al servicio de IA se procesan únicamente para generar
                etiquetas técnicas de búsqueda. Recomendamos a los Fotógrafos evitar subir material
                que exponga datos personales innecesarios más allá del contexto deportivo habitual.
              </p>
            </>
          ),
        },
        {
          id: "pagos",
          title: "4. Pagos y Mercado Pago",
          content: (
            <>
              <p>
                Los pagos son procesados de forma segura por <strong>Mercado Pago</strong> (y, en
                su caso, Stripe para operaciones internacionales). Al pagar, el Cliente interactúa
                con la pasarela correspondiente bajo sus propias políticas de privacidad y seguridad.
              </p>
              <p>
                {PLATFORM.name} recibe confirmaciones de pago, identificadores de transacción y, en
                su caso, el email del pagador, pero{" "}
                <strong>no almacena datos completos de tarjetas</strong> ni información de
                autenticación bancaria.
              </p>
              <p>
                Los Fotógrafos vinculan su cuenta de Mercado Pago mediante OAuth Connect. Los tokens
                de acceso se almacenan de forma cifrada y se utilizan exclusivamente para acreditar
                pagos y operar el split de comisiones.
              </p>
            </>
          ),
        },
        {
          id: "conservacion",
          title: "5. Conservación, seguridad y derechos",
          content: (
            <>
              <p>
                Conservamos los datos mientras la cuenta esté activa y el tiempo necesario para
                cumplir obligaciones legales, resolver disputas y respaldar historiales de compra
                de los usuarios.
              </p>
              <p>
                Aplicamos medidas técnicas y organizativas razonables: cifrado en tránsito (HTTPS),
                almacenamiento en proveedores con controles de acceso, URLs firmadas para descargas
                HD y segregación de roles.
              </p>
              <p>
                De acuerdo con la normativa aplicable en la República Argentina (Ley 25.326 de
                Protección de Datos Personales y normas complementarias), podés solicitar acceso,
                rectificación, actualización o supresión de tus datos contactando a{" "}
                <a href="mailto:hola@actionsnap.store">hola@actionsnap.store</a>.
              </p>
              <p>
                Podemos actualizar esta Política. Publicaremos la versión vigente en esta misma URL
                e indicaremos la fecha de última modificación.
              </p>
            </>
          ),
        },
        {
          id: "terceros",
          title: "6. Encargados y transferencias",
          content: (
            <>
              <p>Compartimos datos únicamente con proveedores necesarios para operar la Plataforma:</p>
              <ul>
                <li>
                  <strong>Supabase:</strong> autenticación, base de datos y almacenamiento de
                  archivos.
                </li>
                <li>
                  <strong>Google Cloud Vision:</strong> procesamiento de imágenes para etiquetado de
                  dorsales (sin reconocimiento facial biométrico).
                </li>
                <li>
                  <strong>Mercado Pago / Stripe:</strong> procesamiento de pagos.
                </li>
                <li>
                  <strong>Resend u otros:</strong> envío de emails transaccionales, cuando estén
                  configurados.
                </li>
                <li>
                  <strong>Cloudflare Turnstile:</strong> verificación anti-bot en formularios
                  públicos.
                </li>
              </ul>
              <p>
                Estos proveedores actúan como encargados del tratamiento conforme a sus propios
                estándares de seguridad y acuerdos contractuales.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
