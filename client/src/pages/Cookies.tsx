import React from "react";
import { Separator } from "@/components/ui/separator";

const Cookies = () => {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
          Política de Cookies
        </h1>
        <p className="text-muted-foreground">
          Última actualización: 6 de abril de 2025
        </p>
      </div>

      <div className="prose prose-blue max-w-none">
        <p>
          Esta Política de Cookies explica cómo Utale ("nosotros", "nuestro" o "Utale") utiliza cookies y tecnologías similares para reconocerte cuando visitas nuestro sitio web. Explica qué son estas tecnologías y por qué las usamos, así como tus derechos para controlar nuestro uso de ellas.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-4">1. ¿Qué son las Cookies?</h2>
        <p>
          Las cookies son pequeños archivos de datos que se colocan en tu ordenador o dispositivo móvil cuando visitas un sitio web. Las cookies se utilizan ampliamente para hacer que los sitios web funcionen, o funcionen de manera más eficiente, así como para proporcionar información a los propietarios del sitio.
        </p>
        <p>
          Las cookies establecidas por el propietario del sitio (en este caso, Utale) se denominan "cookies de origen". Las cookies establecidas por partes distintas del propietario del sitio se denominan "cookies de terceros". Las cookies de terceros permiten que se proporcionen funciones o características de terceros en o a través del sitio web (por ejemplo, publicidad, contenido interactivo y análisis).
        </p>

        <h2 className="text-xl font-bold mt-8 mb-4">2. Tipos de Cookies que Utilizamos</h2>
        <p>
          Utilizamos los siguientes tipos de cookies:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Cookies Esenciales:</strong> Estas cookies son necesarias para que el sitio web funcione y no pueden ser desactivadas en nuestros sistemas. Generalmente se establecen en respuesta a acciones realizadas por ti que equivalen a una solicitud de servicios, como establecer tus preferencias de privacidad, iniciar sesión o rellenar formularios. Puedes configurar tu navegador para que bloquee o te alerte sobre estas cookies, pero algunas partes del sitio no funcionarán.
          </li>
          <li>
            <strong>Cookies de Rendimiento:</strong> Estas cookies nos permiten contar visitas y fuentes de tráfico para que podamos medir y mejorar el rendimiento de nuestro sitio. Nos ayudan a saber qué páginas son las más y menos populares y a ver cómo se mueven los visitantes por el sitio. Toda la información que recogen estas cookies es agregada y, por lo tanto, anónima.
          </li>
          <li>
            <strong>Cookies de Funcionalidad:</strong> Estas cookies permiten que el sitio proporcione funcionalidad y personalización mejoradas. Pueden ser establecidas por nosotros o por proveedores externos cuyos servicios hemos añadido a nuestras páginas. Si no permites estas cookies, es posible que algunos o todos estos servicios no funcionen correctamente.
          </li>
          <li>
            <strong>Cookies de Orientación:</strong> Estas cookies pueden establecerse a través de nuestro sitio por nuestros socios publicitarios. Pueden ser utilizadas por esas empresas para construir un perfil de tus intereses y mostrarte anuncios relevantes en otros sitios. No almacenan directamente información personal, sino que se basan en la identificación única de tu navegador y dispositivo de internet.
          </li>
          <li>
            <strong>Cookies de Redes Sociales:</strong> Estas cookies se establecen por una serie de servicios de redes sociales que hemos añadido al sitio para permitirte compartir nuestro contenido con tus amigos y redes. Son capaces de rastrear tu navegador a través de otros sitios y construir un perfil de tus intereses. Esto puede afectar al contenido y los mensajes que ves en otros sitios web que visitas.
          </li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-4">3. ¿Cómo Utilizamos las Cookies?</h2>
        <p>
          Utilizamos cookies para varios propósitos, incluyendo:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Entender y guardar las preferencias del usuario para futuras visitas.</li>
          <li>Registrar información anónima sobre cómo los usuarios utilizan el sitio.</li>
          <li>Ayudar a proporcionar anuncios que sean relevantes para los usuarios.</li>
          <li>Mantener a los usuarios conectados a nuestros servicios mientras navegan por el sitio.</li>
          <li>Ayudar a identificar a los usuarios cuando regresan al sitio.</li>
          <li>Personalizar el contenido y la experiencia del usuario.</li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-4">4. Tus Opciones Respecto a las Cookies</h2>
        <p>
          La mayoría de los navegadores web permiten cierto control de la mayoría de las cookies a través de la configuración del navegador. Para saber más sobre las cookies, incluyendo cómo ver qué cookies se han establecido, visita <a href="https://www.aboutcookies.org" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">www.aboutcookies.org</a> o <a href="https://www.allaboutcookies.org" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">www.allaboutcookies.org</a>.
        </p>
        <p>
          Puedes optar por rechazar o bloquear las cookies activando la configuración en tu navegador que te permite rechazar la configuración de algunas o todas las cookies. Sin embargo, si utilizas la configuración de tu navegador para bloquear todas las cookies (incluidas las cookies esenciales), es posible que no puedas acceder a todo o parte de nuestro sitio.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-4">5. Cambios a Nuestra Política de Cookies</h2>
        <p>
          Podemos actualizar nuestra Política de Cookies de vez en cuando. Te notificaremos cualquier cambio publicando la nueva Política de Cookies en esta página y actualizando la fecha de "última actualización" en la parte superior.
        </p>
        <p>
          Te animamos a revisar esta Política de Cookies periódicamente para estar informado sobre cómo utilizamos las cookies.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-4">6. Contacto</h2>
        <p>
          Si tienes alguna pregunta sobre nuestra Política de Cookies, contáctanos en:
        </p>
        <p>
          Email: cookies@utale.es<br />
          Dirección: Calle Imaginación, 123, 28001 Madrid, España<br />
          Teléfono: +34 XXX XXX XXX
        </p>
      </div>
      
      <Separator className="my-10" />

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Al usar nuestro servicio, aceptas esta Política de Cookies, nuestra{" "}
          <a href="/privacidad" className="text-primary hover:underline">
            Política de Privacidad
          </a>{" "}
          y nuestros{" "}
          <a href="/terminos" className="text-primary hover:underline">
            Términos de Servicio
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default Cookies;