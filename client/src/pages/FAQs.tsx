import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQs = () => {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
          Preguntas Frecuentes
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Encuentra respuestas a las preguntas más comunes sobre Utale, nuestros libros personalizados y cómo funcionamos.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border mb-10">
        <h2 className="text-xl font-bold mb-4">Sobre Nuestros Libros</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-left font-medium">¿Qué hace que los libros de Utale sean especiales?</AccordionTrigger>
            <AccordionContent>
              Los libros de Utale son completamente personalizados para cada niño. Utilizamos información detallada sobre los intereses, personalidad y características de tu hijo para crear historias únicas con ilustraciones personalizadas que lo convierten en el protagonista de cada aventura.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger className="text-left font-medium">¿Cuánto tiempo tarda en generarse un libro?</AccordionTrigger>
            <AccordionContent>
              Los libros se generan casi instantáneamente gracias a nuestra avanzada tecnología de IA. Una vez que proporcionas la información sobre tu hijo y eliges el tema de la historia, el libro digital estará disponible en tu biblioteca en cuestión de minutos.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger className="text-left font-medium">¿Puedo editar la historia una vez generada?</AccordionTrigger>
            <AccordionContent>
              Actualmente no ofrecemos edición directa de las historias. Sin embargo, puedes regenerar el libro con parámetros diferentes si no estás completamente satisfecho con el resultado.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger className="text-left font-medium">¿En qué idiomas están disponibles los libros?</AccordionTrigger>
            <AccordionContent>
              Actualmente, nuestros libros están disponibles exclusivamente en español, con un enfoque especial para el público de España.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border mb-10">
        <h2 className="text-xl font-bold mb-4">Suscripciones y Pagos</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-5">
            <AccordionTrigger className="text-left font-medium">¿Cómo funciona el modelo de suscripción?</AccordionTrigger>
            <AccordionContent>
              Ofrecemos varios planes de suscripción semanales que varían según el número de libros que quieras crear y el número de páginas de cada libro. Puedes elegir desde 1 hasta 7 libros por semana, con entre 10 y 40 páginas por libro.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-6">
            <AccordionTrigger className="text-left font-medium">¿Puedo cambiar mi plan de suscripción?</AccordionTrigger>
            <AccordionContent>
              Sí, puedes cambiar tu plan de suscripción en cualquier momento desde la sección "Mi Suscripción" en tu panel de control. El cambio se aplicará en tu próximo ciclo de facturación.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-7">
            <AccordionTrigger className="text-left font-medium">¿Qué métodos de pago aceptan?</AccordionTrigger>
            <AccordionContent>
              Aceptamos pagos con tarjetas de crédito y débito a través de nuestra plataforma segura Stripe.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-8">
            <AccordionTrigger className="text-left font-medium">¿Cómo cancelo mi suscripción?</AccordionTrigger>
            <AccordionContent>
              Puedes cancelar tu suscripción en cualquier momento desde la sección "Mi Suscripción" en tu panel de control. Seguirás teniendo acceso a tus libros y a la funcionalidad hasta el final del período de facturación actual.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border mb-10">
        <h2 className="text-xl font-bold mb-4">Perfil Infantil</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-9">
            <AccordionTrigger className="text-left font-medium">¿Qué información necesito proporcionar sobre mi hijo?</AccordionTrigger>
            <AccordionContent>
              Para crear un perfil infantil completo, te pedimos información como el nombre, edad, gustos, aficiones, personalidad y una descripción física. También puedes subir una foto para personalizar aún más la experiencia. Cuanta más información proporciones, más personalizadas serán las historias.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-10">
            <AccordionTrigger className="text-left font-medium">¿Es segura la información de mi hijo?</AccordionTrigger>
            <AccordionContent>
              Absolutamente. La privacidad y seguridad de los datos de tu hijo son nuestra prioridad. Toda la información se almacena de forma segura y nunca se comparte con terceros. Cumplimos con todas las normativas de protección de datos vigentes.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-11">
            <AccordionTrigger className="text-left font-medium">¿Puedo crear varios perfiles infantiles?</AccordionTrigger>
            <AccordionContent>
              Sí, puedes crear múltiples perfiles infantiles en tu cuenta. Esto es ideal para familias con varios hijos, permitiéndote crear libros personalizados para cada uno de ellos.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-12">
            <AccordionTrigger className="text-left font-medium">¿Puedo incluir varios niños en un mismo libro?</AccordionTrigger>
            <AccordionContent>
              Sí, nuestra funcionalidad más reciente permite incluir múltiples perfiles infantiles en un mismo libro. Simplemente selecciona los perfiles que quieres incluir al crear un nuevo libro y la historia se adaptará para incluir a todos los personajes.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-bold mb-4">Soporte Técnico</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-13">
            <AccordionTrigger className="text-left font-medium">¿Qué hago si tengo problemas para generar un libro?</AccordionTrigger>
            <AccordionContent>
              Si experimentas algún problema, primero intenta actualizar tu navegador o usa un navegador diferente. Si el problema persiste, contáctanos a través de nuestra página de soporte y nuestro equipo te ayudará lo antes posible.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-14">
            <AccordionTrigger className="text-left font-medium">¿Puedo acceder a mis libros desde cualquier dispositivo?</AccordionTrigger>
            <AccordionContent>
              Sí, puedes acceder a tu biblioteca de libros desde cualquier dispositivo con conexión a internet. Simplemente inicia sesión en tu cuenta de Utale desde un navegador web y tendrás acceso a todos tus libros.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-15">
            <AccordionTrigger className="text-left font-medium">¿Cómo puedo descargar mis libros?</AccordionTrigger>
            <AccordionContent>
              Puedes descargar tus libros en formato PDF desde tu biblioteca. Simplemente ve a la vista del libro y haz clic en el botón "Descargar PDF".
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-16">
            <AccordionTrigger className="text-left font-medium">¿Dónde puedo reportar un error o problema?</AccordionTrigger>
            <AccordionContent>
              Puedes reportar cualquier error o problema a través de nuestra página de contacto o enviando un correo electrónico a soporte@utale.es. Nuestro equipo está disponible para ayudarte con cualquier inconveniente que puedas tener.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="mt-12 text-center">
        <h3 className="text-xl font-semibold mb-4">¿No encuentras respuesta a tu pregunta?</h3>
        <p className="text-muted-foreground mb-6">
          Estamos aquí para ayudarte. Ponte en contacto con nuestro equipo de soporte.
        </p>
        <a 
          href="/contacto" 
          className="inline-flex items-center justify-center px-6 py-3 font-medium rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
        >
          Contáctanos
        </a>
      </div>
    </div>
  );
};

export default FAQs;