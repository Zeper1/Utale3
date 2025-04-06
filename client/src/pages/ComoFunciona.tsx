import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BookOpen, Wand2, Palette, BookCopy, Users, Clock, CreditCard } from "lucide-react";

const FeatureCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string 
}) => {
  return (
    <div className="bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center mb-4">
        <div className="mr-4 bg-primary/10 p-3 rounded-full text-primary">
          {icon}
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

const StepCard = ({
  step,
  title,
  description,
  image
}: {
  step: number;
  title: string;
  description: string;
  image?: string;
}) => {
  return (
    <div className="relative border rounded-lg overflow-hidden">
      {image && (
        <div className="h-48 overflow-hidden">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover object-center"
          />
        </div>
      )}
      <div className="p-6">
        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm mb-4">
          {step}
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

const ComoFunciona = () => {
  return (
    <div className="container mx-auto py-12 px-4">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent sm:text-5xl mb-6">
          ¿Cómo Funciona Utale?
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Utale transforma tus ideas en historias personalizadas en minutos, combinando inteligencia artificial avanzada y creatividad para ofrecer libros únicos para tus pequeños.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/crear-libro">Crear Mi Primer Libro</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/catalogo">Ver Ejemplos</Link>
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-10">Características Principales</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Users size={24} />}
            title="Múltiples Protagonistas"
            description="Incluye hasta 5 personajes principales en tu historia: niños, adultos, mascotas, peluches o criaturas de fantasía."
          />
          <FeatureCard
            icon={<Wand2 size={24} />}
            title="100% Personalizado"
            description="Cada historia es única, adaptada a los intereses, personalidad y características de tus personajes."
          />
          <FeatureCard
            icon={<Palette size={24} />}
            title="Ilustraciones Mágicas"
            description="Hermosas ilustraciones generadas con IA que dan vida a tus personajes y aventuras."
          />
          <FeatureCard
            icon={<BookOpen size={24} />}
            title="Biblioteca Digital"
            description="Accede a todos tus libros creados en cualquier momento desde nuestra biblioteca digital."
          />
          <FeatureCard
            icon={<Clock size={24} />}
            title="Creación Rápida"
            description="De la idea al libro terminado en minutos, sin esperas largas ni procesos complicados."
          />
          <FeatureCard
            icon={<CreditCard size={24} />}
            title="Suscripciones Flexibles"
            description="Elige el plan que mejor se adapte a ti, desde uno hasta siete libros por semana."
          />
        </div>
      </div>

      {/* Process Section */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-4">El Proceso de Creación</h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">
          Crear un libro personalizado es un proceso sencillo e intuitivo que puedes completar en pocos minutos.
        </p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <StepCard
            step={1}
            title="Crea tus personajes"
            description="Define los protagonistas de tu historia con nombre, edad, apariencia, personalidad e intereses."
            image="/images/step1.jpg"
          />
          <StepCard
            step={2}
            title="Elige el tema"
            description="Selecciona el tipo de aventura, época, enseñanza o valor que quieres transmitir en la historia."
            image="/images/step2.jpg"
          />
          <StepCard
            step={3}
            title="Personaliza detalles"
            description="Añade características específicas para esta historia, como habilidades especiales o roles específicos."
            image="/images/step3.jpg"
          />
          <StepCard
            step={4}
            title="Genera la historia"
            description="Nuestro sistema creará una narrativa única combinando tus personajes y preferencias."
            image="/images/step4.jpg"
          />
          <StepCard
            step={5}
            title="Revisa y edita"
            description="Lee tu libro, realiza cambios si es necesario y aprueba la versión final."
            image="/images/step5.jpg"
          />
          <StepCard
            step={6}
            title="¡Disfruta tu creación!"
            description="Lee el libro digital o solicita una versión impresa para disfrutar con tus pequeños."
            image="/images/step6.jpg"
          />
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-10">Preguntas Frecuentes</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-2">¿Cuántos libros puedo crear?</h3>
            <p className="text-muted-foreground">
              Depende de tu plan de suscripción, que va desde 1 hasta 7 libros por semana. Los libros no utilizados no se acumulan para la siguiente semana.
            </p>
          </div>
          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-2">¿Puedo pedir copias impresas?</h3>
            <p className="text-muted-foreground">
              ¡Sí! Ofrecemos la opción de solicitar versiones impresas de tus libros favoritos con un costo adicional que incluye impresión y envío.
            </p>
          </div>
          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-2">¿Puedo editar un libro ya creado?</h3>
            <p className="text-muted-foreground">
              Una vez finalizado un libro, no puedes editarlo, pero puedes crear una nueva versión utilizando los mismos personajes con diferentes aventuras o situaciones.
            </p>
          </div>
          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-2">¿Cuántos personajes puedo incluir?</h3>
            <p className="text-muted-foreground">
              Puedes incluir hasta 5 personajes principales en cada historia, lo que permite crear aventuras familiares o con grupos de amigos.
            </p>
          </div>
        </div>
        <div className="text-center mt-8">
          <Button variant="outline" asChild>
            <Link href="/faqs">Ver todas las preguntas frecuentes</Link>
          </Button>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary/5 rounded-lg p-8 text-center">
        <BookCopy className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-bold mb-4">¿Listo para crear tu primera historia?</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
          Empieza hoy mismo a crear historias únicas y mágicas que capturen la imaginación de tus pequeños y creen recuerdos que durarán toda la vida.
        </p>
        <Button size="lg" asChild>
          <Link href="/crear-libro">Comenzar Ahora</Link>
        </Button>
      </div>
    </div>
  );
};

export default ComoFunciona;