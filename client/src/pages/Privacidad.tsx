import React from "react";
import { Separator } from "@/components/ui/separator";

const Privacidad = () => {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
          Política de Privacidad
        </h1>
        <p className="text-muted-foreground">
          Última actualización: 6 de abril de 2025
        </p>
      </div>

      <div className="prose prose-blue max-w-none">
        <p>
          Esta Política de Privacidad describe cómo Utale ("nosotros", "nuestro" o "Utale") recopila, utiliza y comparte la información personal que obtenemos cuando utilizas nuestro sitio web y servicios, especialmente en relación con la creación de libros personalizados para niños.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-4">1. Información que Recopilamos</h2>
        <p>
          Recopilamos diferentes tipos de información para proporcionarte y mejorar nuestros servicios:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Información de registro:</strong> Cuando creas una cuenta, recopilamos tu nombre, dirección de correo electrónico, contraseña y, opcionalmente, tu información de pago.
          </li>
          <li>
            <strong>Información de perfiles:</strong> Recopilamos información sobre los perfiles de niños que creas, incluyendo su nombre, edad, género, intereses, preferencias y cualquier otra información que proporciones para personalizar los libros.
          </li>
          <li>
            <strong>Información de uso:</strong> Recopilamos información sobre cómo utilizas nuestro servicio, incluyendo las páginas que visitas, las características que utilizas y el tiempo que pasas en nuestro sitio.
          </li>
          <li>
            <strong>Información de dispositivo:</strong> Recopilamos información sobre el dispositivo que utilizas para acceder a nuestro servicio, incluyendo el tipo de dispositivo, sistema operativo, navegador y configuración.
          </li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-4">2. Cómo Utilizamos la Información</h2>
        <p>
          Utilizamos la información recopilada para los siguientes propósitos:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Proporcionar, mantener y mejorar nuestros servicios.</li>
          <li>Crear libros personalizados según tus especificaciones.</li>
          <li>Procesar pagos y gestionar tu cuenta de suscripción.</li>
          <li>Enviarte comunicaciones de servicio, como confirmaciones, facturas y notificaciones.</li>
          <li>Responder a tus comentarios, preguntas y solicitudes de atención al cliente.</li>
          <li>Desarrollar nuevos productos, servicios y características.</li>
          <li>Prevenir el fraude y mejorar la seguridad de nuestro servicio.</li>
          <li>Cumplir con las obligaciones legales.</li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-4">3. Compartir de Información</h2>
        <p>
          No vendemos ni alquilamos tu información personal a terceros. Sin embargo, podemos compartir tu información en las siguientes circunstancias:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Proveedores de servicios:</strong> Compartimos información con proveedores de servicios que nos ayudan a operar nuestro negocio, como procesadores de pago, servicios de alojamiento web y servicios de atención al cliente.
          </li>
          <li>
            <strong>Cumplimiento legal:</strong> Podemos compartir información si creemos de buena fe que la divulgación es necesaria para cumplir con la ley, responder a citaciones o procedimientos legales.
          </li>
          <li>
            <strong>Protección de derechos:</strong> Podemos compartir información para proteger los derechos, la propiedad o la seguridad de Utale, nuestros usuarios u otros.
          </li>
          <li>
            <strong>Con tu consentimiento:</strong> Podemos compartir información con terceros cuando nos des tu consentimiento para hacerlo.
          </li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-4">4. Protección de la Información Infantil</h2>
        <p>
          Entendemos la importancia de proteger la privacidad de los niños. Nuestro servicio está dirigido a padres y tutores, y no recopilamos intencionalmente información directamente de niños menores de 13 años sin el consentimiento verificable de los padres. Si crees que hemos recopilado información de un niño menor de 13 años sin el consentimiento adecuado, contáctanos para que podamos tomar las medidas apropiadas.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-4">5. Tus Derechos</h2>
        <p>
          Dependiendo de tu ubicación, puedes tener ciertos derechos con respecto a tu información personal, incluyendo el derecho a:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Acceder a la información personal que tenemos sobre ti.</li>
          <li>Corregir información inexacta o incompleta.</li>
          <li>Eliminar tu información personal.</li>
          <li>Oponerte al procesamiento de tu información personal.</li>
          <li>Restringir el procesamiento de tu información personal.</li>
          <li>Recibir tu información personal en un formato estructurado.</li>
          <li>Retirar tu consentimiento en cualquier momento.</li>
        </ul>
        <p>
          Para ejercer estos derechos, contáctanos a través de los detalles proporcionados al final de esta política.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-4">6. Seguridad de los Datos</h2>
        <p>
          Implementamos medidas de seguridad técnicas y organizativas diseñadas para proteger tu información personal contra acceso no autorizado, divulgación, alteración y destrucción. Sin embargo, ningún sistema de seguridad es completamente impenetrable, y no podemos garantizar la seguridad absoluta de tu información.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-4">7. Transferencias Internacionales de Datos</h2>
        <p>
          Utale opera principalmente en España, pero podemos transferir tu información a otros países para procesarla y almacenarla. Al utilizar nuestros servicios, consientes a estas transferencias. Tomamos medidas para garantizar que tu información reciba un nivel adecuado de protección en los países donde la procesamos.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-4">8. Cambios a Esta Política</h2>
        <p>
          Podemos actualizar esta Política de Privacidad periódicamente. Si realizamos cambios, te notificaremos publicando la nueva política en nuestro sitio web y actualizando la fecha de "última actualización". Te recomendamos revisar la Política de Privacidad regularmente para estar informado sobre cómo protegemos tu información.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-4">9. Contacto</h2>
        <p>
          Si tienes preguntas o inquietudes sobre esta Política de Privacidad o el procesamiento de tu información personal, contáctanos en:
        </p>
        <p>
          Email: privacidad@utale.es<br />
          Dirección: Calle Imaginación, 123, 28001 Madrid, España<br />
          Teléfono: +34 XXX XXX XXX
        </p>
      </div>
      
      <Separator className="my-10" />

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Al usar nuestro servicio, aceptas esta Política de Privacidad y nuestros{" "}
          <a href="/terminos" className="text-primary hover:underline">
            Términos de Servicio
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default Privacidad;