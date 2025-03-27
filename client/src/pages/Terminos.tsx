import React from "react";
import { Separator } from "@/components/ui/separator";

const Terminos = () => {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
          Términos de Servicio
        </h1>
        <p className="text-muted-foreground">
          Última actualización: 27 de marzo de 2025
        </p>
      </div>

      <div className="prose prose-blue max-w-none">
        <p>
          Bienvenido/a a Utale. Estos Términos de Servicio ("Términos") regulan tu acceso y uso del servicio de Utale, incluyendo nuestro sitio web, aplicaciones, interfaces, contenido, productos y servicios (colectivamente, el "Servicio").
        </p>

        <p>
          Al acceder o utilizar nuestro Servicio, aceptas estar vinculado por estos Términos. Si no estás de acuerdo con alguna parte de estos términos, no podrás acceder al Servicio.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-4">1. Descripción del Servicio</h2>
        <p>
          Utale es un servicio de creación de libros infantiles personalizados que utiliza tecnología de inteligencia artificial para generar contenido personalizado basado en la información proporcionada por los usuarios sobre sus hijos.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-4">2. Cuentas de Usuario</h2>
        <p>
          Al crear una cuenta en nuestro Servicio, debes proporcionarnos información precisa, completa y actualizada. El incumplimiento de esta obligación constituye una violación de los Términos y podría resultar en la cancelación inmediata de tu cuenta.
        </p>
        <p>
          Eres responsable de mantener la confidencialidad de tu contraseña y de todas las actividades que ocurran en tu cuenta. Debes notificarnos inmediatamente cualquier uso no autorizado de tu cuenta o cualquier otra violación de seguridad.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-4">3. Suscripciones y Pagos</h2>
        <p>
          Ofrecemos varios planes de suscripción para el acceso a nuestro Servicio. Al suscribirte a un plan, aceptas pagar todas las tarifas asociadas con el plan seleccionado. Las tarifas se cobrarán de forma recurrente según el ciclo de facturación elegido (semanal, mensual o anual).
        </p>
        <p>
          Puedes cancelar tu suscripción en cualquier momento. Las cancelaciones entrarán en vigor al final del período de facturación actual. No proporcionamos reembolsos por pagos ya realizados.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-4">4. Generación y Uso de Contenido</h2>
        <p>
          Nuestro Servicio utiliza inteligencia artificial para generar contenido personalizado basado en la información que proporcionas. Aunque nos esforzamos por mantener un alto nivel de calidad, no podemos garantizar que todo el contenido generado sea completamente preciso, apropiado o libre de errores.
        </p>
        <p>
          Al utilizar nuestro Servicio, recibes una licencia limitada, no exclusiva, no transferible y revocable para acceder y utilizar el contenido generado para uso personal y no comercial. No puedes redistribuir, vender, sublicenciar o crear trabajos derivados del contenido generado sin nuestro consentimiento explícito.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-4">5. Privacidad y Protección de Datos</h2>
        <p>
          La protección de datos personales, especialmente los relacionados con menores, es de suma importancia para nosotros. Nuestra Política de Privacidad, que forma parte integral de estos Términos, describe cómo recopilamos, usamos y compartimos la información que recopilamos de ti.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-4">6. Propiedad Intelectual</h2>
        <p>
          Todos los derechos, títulos e intereses en y hacia el Servicio (excluyendo el contenido proporcionado por los usuarios) son y seguirán siendo propiedad exclusiva de Utale y sus licenciantes. El Servicio está protegido por derechos de autor, marcas registradas y otras leyes de España y países extranjeros.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-4">7. Enlaces a Otros Sitios Web</h2>
        <p>
          Nuestro Servicio puede contener enlaces a sitios web de terceros que no son propiedad ni están controlados por Utale. No tenemos control sobre el contenido, las políticas de privacidad o las prácticas de sitios web o servicios de terceros y no asumimos responsabilidad por ellos.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-4">8. Terminación</h2>
        <p>
          Podemos terminar o suspender tu acceso a nuestro Servicio inmediatamente, sin previo aviso ni responsabilidad, por cualquier motivo, incluyendo, sin limitación, el incumplimiento de estos Términos.
        </p>
        <p>
          Tras la terminación, tu derecho a utilizar el Servicio cesará inmediatamente. Si deseas terminar tu cuenta, puedes simplemente discontinuar el uso del Servicio o notificárnoslo.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-4">9. Limitación de Responsabilidad</h2>
        <p>
          En ningún caso Utale, sus directores, empleados, socios, agentes, proveedores o afiliados serán responsables por daños indirectos, incidentales, especiales, consecuentes o punitivos, incluyendo, sin limitación, pérdida de beneficios, datos, uso, buena voluntad u otras pérdidas intangibles, resultantes de tu acceso o uso o incapacidad para acceder o usar el Servicio.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-4">10. Cambios en los Términos</h2>
        <p>
          Nos reservamos el derecho, a nuestra sola discreción, de modificar o reemplazar estos Términos en cualquier momento. Si una revisión es material, intentaremos proporcionar un aviso con al menos 30 días de anticipación antes de que entren en vigor los nuevos términos. Lo que constituye un cambio material será determinado a nuestra sola discreción.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-4">11. Ley Aplicable</h2>
        <p>
          Estos Términos se regirán e interpretarán de acuerdo con las leyes de España, sin tener en cuenta sus disposiciones sobre conflictos de leyes.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-4">12. Contacto</h2>
        <p>
          Si tienes alguna pregunta sobre estos Términos, por favor contáctanos en:
        </p>
        <p>
          Email: legal@utale.es<br />
          Dirección: Calle Imaginación, 123, 28001 Madrid, España
        </p>
      </div>

      <Separator className="my-10" />

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Al usar nuestro servicio, aceptas estos Términos de Servicio y nuestra{" "}
          <a href="/privacidad" className="text-primary hover:underline">
            Política de Privacidad
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default Terminos;