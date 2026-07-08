import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { getContactEmail } from "@/lib/contact";
import { PLATFORM } from "@/lib/platform";

export const metadata: Metadata = {
  title: `Términos y Condiciones — ${PLATFORM.name}`,
  description:
    "Condiciones de uso de Action Snap: intermediación tecnológica, comisiones, propiedad intelectual y política de reembolsos.",
};

export default function TerminosLegalesPage() {
  const supportEmail = getContactEmail();

  return (
    <LegalDocument
      title="Términos y Condiciones de Uso"
      intro={
        <p>
          Estos Términos y Condiciones regulan el acceso y uso de la plataforma{" "}
          <strong>{PLATFORM.name}</strong> (en adelante, la &quot;Plataforma&quot;). Al
          registrarse, publicar contenido o realizar una compra, el usuario acepta íntegramente
          este documento.
        </p>
      }
      sections={[
        {
          id: "naturaleza",
          title: "1. Naturaleza del servicio",
          content: (
            <>
              <p>
                {PLATFORM.name} es una plataforma tecnológica de intermediación que conecta a
                fotógrafos independientes (&quot;Fotógrafos&quot;) con deportistas, participantes y
                público en general (&quot;Clientes&quot; o &quot;Usuarios compradores&quot;) para
                la comercialización de fotografías de eventos en formato digital.
              </p>
              <p>
                {PLATFORM.name} <strong>no es productora</strong> de eventos,{" "}
                <strong>no es organizadora</strong> de competencias ni actividades, <strong>no es empleador</strong>{" "}
                ni mandante de los Fotógrafos, y <strong>no adquiere la titularidad</strong> de las
                imágenes publicadas. Cada Fotógrafo actúa por cuenta propia y bajo su exclusiva
                responsabilidad profesional.
              </p>
              <p>
                La Plataforma provee herramientas de hosting, procesamiento automatizado, búsqueda
                por número, pasarela de cobro mediante Mercado Pago Connect y entrega digital de
                archivos en alta definición.
              </p>
            </>
          ),
        },
        {
          id: "propiedad-intelectual",
          title: "2. Propiedad intelectual",
          content: (
            <>
              <p>
                Los Fotógrafos conservan en todo momento los derechos de autor y la titularidad
                sobre las fotografías que suben a la Plataforma.
              </p>
              <p>
                Al utilizar {PLATFORM.name}, el Fotógrafo otorga a la Plataforma una{" "}
                <strong>licencia limitada, no exclusiva, revocable y territorialmente necesaria</strong>{" "}
                para:
              </p>
              <ul>
                <li>Almacenar, procesar y transmitir las imágenes en servidores seguros.</li>
                <li>
                  Generar vistas previas con marca de agua y versiones optimizadas para la galería
                  pública.
                </li>
                <li>
                  Aplicar procesamiento automatizado, incluido etiquetado asistido por inteligencia
                  artificial (por ejemplo, lectura de números y atributos visuales genéricos).
                </li>
                <li>
                  Entregar al Cliente el archivo en HD una vez acreditado el pago correspondiente.
                </li>
              </ul>
              <p>
                Esta licencia no implica cesión de derechos patrimoniales ni autoriza a{" "}
                {PLATFORM.name} a explotar comercialmente las obras fuera del marco de la
                Plataforma, salvo autorización expresa del Fotógrafo.
              </p>
              <p>
                El Cliente adquiere, mediante la compra, una licencia de uso personal sobre la
                fotografía adquirida, conforme a las condiciones informadas en el evento. Queda
                prohibida la reventa, redistribución masiva o uso comercial no autorizado por el
                Fotógrafo titular.
              </p>
            </>
          ),
        },
        {
          id: "comisiones",
          title: "3. Modelo de negocio y comisiones",
          content: (
            <>
              <p>
                Por cada transacción exitosa procesada a través de la Plataforma,{" "}
                {PLATFORM.name} retiene una comisión del{" "}
                <strong>{PLATFORM.commissionPercent}%</strong> sobre el monto total abonado por el
                Cliente. Dicha comisión remunera el uso del software, el procesamiento con IA, el
                almacenamiento de archivos HD, la infraestructura de entrega digital y los costos
                asociados a la pasarela de pago.
              </p>
              <p>
                El <strong>{PLATFORM.photographerSharePercent}% restante</strong> es acreditado
                automáticamente en la cuenta de Mercado Pago vinculada del Fotógrafo mediante el
                sistema de <strong>split de Mercado Pago Connect</strong>, sin intervención manual
                de {PLATFORM.name}.
              </p>
              <p>
                Los Fotógrafos son responsables de vincular una cuenta de Mercado Pago válida y de
                cumplir con las obligaciones fiscales, impositivas y comerciales derivadas de sus
                ingresos. {PLATFORM.name} actúa como proveedor tecnológico y no como agente de
                retención, salvo que la normativa aplicable disponga lo contrario.
              </p>
              <p>
                Las tarifas publicadas por evento (precio por foto, descuentos por pack u otras
                promociones) son definidas exclusivamente por cada Fotógrafo.
              </p>
            </>
          ),
        },
        {
          id: "contenido",
          title: "4. Responsabilidad sobre el contenido",
          content: (
            <>
              <p>
                Los Fotógrafos son los <strong>únicos responsables</strong> del contenido que
                suben, publican y comercializan a través de la Plataforma.
              </p>
              <p>Queda expresamente prohibido subir o vender imágenes que:</p>
              <ul>
                <li>
                  Violen la intimidad, honra o imagen de terceros sin la autorización correspondiente.
                </li>
                <li>
                  Incluyan material difamatorio, discriminatorio, violento, sexual explícito o
                  ilegal.
                </li>
                <li>Infrinjan derechos de autor, marcas o derechos de imagen de terceros.</li>
                <li>
                  Hayan sido obtenidas incumpliendo reglamentos del evento o restricciones del
                  organizador.
                </li>
              </ul>
              <p>
                {PLATFORM.name} podrá retirar contenido, suspender cuentas o colaborar con
                autoridades cuando exista denuncia fundada, orden judicial o incumplimiento grave de
                estos Términos. La Plataforma no está obligada a supervisar preventivamente todo el
                material publicado, pero se reserva facultades de moderación.
              </p>
            </>
          ),
        },
        {
          id: "reembolsos",
          title: "5. Política de reembolsos",
          content: (
            <>
              <p>
                Las fotografías comercializadas en {PLATFORM.name} son{" "}
                <strong>productos digitales de descarga inmediata</strong>. Una vez que el Cliente
                accede o descarga el archivo en alta definición (HD), la entrega se considera
                consumada.
              </p>
              <p>
                Por este motivo, <strong>no se otorgan reembolsos</strong> después de la descarga
                exitosa del original en HD, salvo los siguientes casos excepcionales:
              </p>
              <ul>
                <li>
                  Archivo técnicamente corrupto o ilegible, debidamente acreditado, siempre que el
                  Cliente contacte a soporte dentro de las 72 horas posteriores a la compra.
                </li>
                <li>
                  Error comprobado de la Plataforma que haya impedido la entrega del archivo
                  correcto.
                </li>
                <li>
                  Duplicidad de cobro por falla del procesador de pagos, conforme resolución de
                  Mercado Pago o Stripe según corresponda.
                </li>
              </ul>
              <p>
                Consultas sobre compras:{" "}
                <a href={`mailto:${supportEmail}`}>{supportEmail}</a>. Los Clientes
                también pueden acceder a su historial en{" "}
                <a href="/mis-compras">Mis compras</a>.
              </p>
            </>
          ),
        },
        {
          id: "cuentas",
          title: "6. Cuentas, suspensiones y modificaciones",
          content: (
            <>
              <p>
                Los Fotógrafos deben proporcionar información veraz y mantener la seguridad de sus
                credenciales. {PLATFORM.name} puede suspender o cancelar cuentas ante fraude,
                chargebacks reiterados, incumplimiento legal o violación de estos Términos.
              </p>
              <p>
                Nos reservamos el derecho de modificar estos Términos. Los cambios relevantes serán
                comunicados por medios razonables (correo electrónico o aviso en la Plataforma).
                El uso continuado después de la publicación implica aceptación.
              </p>
              <p>
                Para conflictos entre Fotógrafos y Clientes, las partes deberán intentar una
                resolución directa. {PLATFORM.name} podrá colaborar como intermediario tecnológico
                sin asumir responsabilidad por la relación comercial subyacente.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
