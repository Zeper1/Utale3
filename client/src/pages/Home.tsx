import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle,
  BookOpen,
  Paintbrush,
  UserCircle,
  MessageSquare,
  Truck,
  BookMarked,
  Star,
  ArrowRight,
  Info,
  ChevronDown
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Home() {
  const [_, setLocation] = useLocation();
  const { user } = useAuth();
  
  // References for scroll sections
  const howItWorksRef = useRef<HTMLElement>(null);
  const bookShowcaseRef = useRef<HTMLElement>(null);
  const pricingRef = useRef<HTMLElement>(null);

  // Scroll to section when hash changes
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, []);

  const handleCreateProfile = () => {
    if (user) {
      setLocation("/dashboard");
    } else {
      // Find the right position for the auth modal
      const loginButton = document.querySelector('[data-event="click:handleLogin"]') as HTMLElement;
      if (loginButton) {
        loginButton.click();
      }
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="pt-12 pb-24 bg-gradient-to-b from-white to-primary-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 flex flex-col items-start gap-6">
              <div className="bg-primary-100 text-primary-800 py-2 px-4 rounded-full text-sm font-medium">
                Historias personalizadas para tus pequeños
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-gray-900 leading-tight">
                Crea <span className="text-primary">Libros Mágicos</span> adaptados a tu hijo
              </h1>
              <p className="text-lg text-gray-600 max-w-lg">
                Diseña aventuras únicas con tu hijo como protagonista, incorporando sus intereses, amigos y aventuras en libros bellamente ilustrados que atesorarán para siempre.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Button 
                  onClick={handleCreateProfile} 
                  size="lg" 
                  className="px-6 py-3 rounded-full text-lg font-medium"
                >
                  Crea tu primer libro
                </Button>
                <Button 
                  onClick={() => howItWorksRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  variant="outline" 
                  size="lg" 
                  className="px-6 py-3 rounded-full border border-gray-300 hover:border-primary-400 text-gray-700 hover:text-primary text-lg font-medium"
                >
                  Saber más
                </Button>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500 mt-4">
                <div className="flex -space-x-2">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=40&ixid=MnwxfDB8MXxyYW5kb218MHx8cGVyc29ufHx8fHx8MTY4ODk5ODQwMg&ixlib=rb-4.0.3&q=80&w=40" alt="User" className="w-8 h-8 rounded-full border-2 border-white" />
                  <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=40&ixid=MnwxfDB8MXxyYW5kb218MHx8cGVyc29ufHx8fHx8MTY4ODk5ODQ1OQ&ixlib=rb-4.0.3&q=80&w=40" alt="User" className="w-8 h-8 rounded-full border-2 border-white" />
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=40&ixid=MnwxfDB8MXxyYW5kb218MHx8cGVyc29ufHx8fHx8MTY4ODk5ODQ5MQ&ixlib=rb-4.0.3&q=80&w=40" alt="User" className="w-8 h-8 rounded-full border-2 border-white" />
                </div>
                <span>Trusted by <strong>2,500+</strong> parents worldwide</span>
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-20 h-20 bg-secondary-200 rounded-full opacity-50"></div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary-200 rounded-full opacity-50"></div>
                <img 
                  src="https://images.unsplash.com/photo-1512253020576-ee9f5f3fa330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" 
                  alt="Child reading a personalized book" 
                  className="rounded-2xl shadow-card relative z-10 w-full max-w-lg mx-auto"
                />
                <div className="absolute -bottom-10 -right-10 bg-white p-4 rounded-xl shadow-soft z-20 max-w-[240px] animate-float hidden lg:block">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-full text-green-600">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-medium">Another story completed for Emma!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 mb-4">Por qué los padres adoran Utale</h2>
            <p className="text-lg text-gray-600">
              Combinamos la narración potenciada por IA con tus toques personales para crear libros que tus hijos atesorarán durante años.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-soft transition-shadow duration-300">
              <div className="bg-primary-100 w-12 h-12 flex items-center justify-center rounded-lg mb-4 text-primary">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-heading text-gray-900 mb-2">Personalized Stories</h3>
              <p className="text-gray-600">
                Each book features your child as the main character, with details about their interests, friends, and even their pets.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-soft transition-shadow duration-300">
              <div className="bg-primary-100 w-12 h-12 flex items-center justify-center rounded-lg mb-4 text-primary">
                <Paintbrush className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-heading text-gray-900 mb-2">Beautiful Illustrations</h3>
              <p className="text-gray-600">
                Vibrant, professionally designed illustrations bring the stories to life and capture your child's imagination.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-soft transition-shadow duration-300">
              <div className="bg-primary-100 w-12 h-12 flex items-center justify-center rounded-lg mb-4 text-primary">
                <UserCircle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-heading text-gray-900 mb-2">Evolving Profiles</h3>
              <p className="text-gray-600">
                Your child's profile grows with them, allowing stories to evolve as they develop new interests and experiences.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-soft transition-shadow duration-300">
              <div className="bg-primary-100 w-12 h-12 flex items-center justify-center rounded-lg mb-4 text-primary">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-heading text-gray-900 mb-2">Conversational Interface</h3>
              <p className="text-gray-600">
                Our friendly chat system makes creating and updating your child's profile simple and enjoyable.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-soft transition-shadow duration-300">
              <div className="bg-primary-100 w-12 h-12 flex items-center justify-center rounded-lg mb-4 text-primary">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-heading text-gray-900 mb-2">Multiple Formats</h3>
              <p className="text-gray-600">
                Choose between digital downloads, premium hardcover books, or softcover editions to suit your preferences.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-soft transition-shadow duration-300">
              <div className="bg-primary-100 w-12 h-12 flex items-center justify-center rounded-lg mb-4 text-primary">
                <BookMarked className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-heading text-gray-900 mb-2">Libros de Colección</h3>
              <p className="text-gray-600">
                Crea historias para conservar y compartir, perfectas para momentos especiales que los niños atesorarán para siempre.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" ref={howItWorksRef} className="py-20 bg-primary-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 mb-4">¿Cómo funciona Utale?</h2>
            <p className="text-lg text-gray-600">
              Crear tu libro personalizado es sencillo y divertido con nuestro proceso de cuatro pasos.
            </p>
          </div>
          
          <div className="relative">
            <div className="hidden lg:block absolute left-0 right-0 top-1/2 h-0.5 bg-primary-200 -translate-y-1/2 z-0"></div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              <div className="bg-white rounded-xl p-6 shadow-soft flex flex-col items-center text-center">
                <div className="bg-primary w-12 h-12 flex items-center justify-center rounded-full mb-4 text-white font-bold text-xl">
                  1
                </div>
                <h3 className="text-xl font-bold font-heading text-gray-900 mb-2">Crea un perfil</h3>
                <p className="text-gray-600">
                  Crea el perfil de tu hijo a través de nuestra amigable interfaz de chat, compartiendo detalles sobre sus intereses, amigos y personalidad.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-soft flex flex-col items-center text-center">
                <div className="bg-primary w-12 h-12 flex items-center justify-center rounded-full mb-4 text-white font-bold text-xl">
                  2
                </div>
                <h3 className="text-xl font-bold font-heading text-gray-900 mb-2">Elige un tema</h3>
                <p className="text-gray-600">
                  Selecciona entre varios temas como aventuras espaciales, viajes submarinos, reinos mágicos o héroes cotidianos.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-soft flex flex-col items-center text-center">
                <div className="bg-primary w-12 h-12 flex items-center justify-center rounded-full mb-4 text-white font-bold text-xl">
                  3
                </div>
                <h3 className="text-xl font-bold font-heading text-gray-900 mb-2">Vista previa y personalización</h3>
                <p className="text-gray-600">
                  Revisa tu historia generada, haz los ajustes que desees y visualiza el resultado final antes de confirmar.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-soft flex flex-col items-center text-center">
                <div className="bg-primary w-12 h-12 flex items-center justify-center rounded-full mb-4 text-white font-bold text-xl">
                  4
                </div>
                <h3 className="text-xl font-bold font-heading text-gray-900 mb-2">Ordena y disfruta</h3>
                <p className="text-gray-600">
                  Elige tu formato preferido (digital, tapa dura, tapa blanda), realiza tu pedido y disfruta de tu creación única.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Button 
              onClick={handleCreateProfile} 
              className="px-6 py-3 rounded-full text-lg font-medium"
            >
              Comienza a crear tu historia
            </Button>
          </div>
        </div>
      </section>

      {/* Book Showcase Section */}
      <section id="book-showcase" ref={bookShowcaseRef} className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 mb-4">Muestra de libros</h2>
            <p className="text-lg text-gray-600">
              Explora algunos ejemplos de nuestros mágicos libros personalizados.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="rounded-xl overflow-hidden shadow-soft group">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1629196915184-d1a7db45c7c9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80" 
                  alt="Space Adventure Book Cover" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <h3 className="text-xl font-bold font-heading">Aventura Espacial</h3>
                  <p className="text-sm text-white/80">Edades 4-8</p>
                </div>
              </div>
              <div className="p-6 bg-white">
                <p className="text-gray-600 mb-4">
                  Acompaña a [Nombre del niño] en un emocionante viaje por el cosmos, donde descubrirá planetas extraños y hará amigos alienígenas.
                </p>
                <Button 
                  onClick={handleCreateProfile}
                  variant="link" 
                  className="text-primary hover:text-primary/90 font-medium flex items-center gap-2 p-0"
                >
                  Ver libro <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="rounded-xl overflow-hidden shadow-soft group">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1568667256549-094345857637?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80" 
                  alt="Underwater Kingdom Book Cover" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <h3 className="text-xl font-bold font-heading">Reino Submarino</h3>
                  <p className="text-sm text-white/80">Edades 3-7</p>
                </div>
              </div>
              <div className="p-6 bg-white">
                <p className="text-gray-600 mb-4">
                  Sumérgete con [Nombre del niño] mientras explora un mundo submarino encantado lleno de amistosas criaturas marinas y tesoros escondidos.
                </p>
                <Button 
                  onClick={handleCreateProfile}
                  variant="link" 
                  className="text-primary hover:text-primary/90 font-medium flex items-center gap-2 p-0"
                >
                  Ver libro <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="rounded-xl overflow-hidden shadow-soft group">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1633613286848-e6f43bbafb8d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80" 
                  alt="Magical Forest Book Cover" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <h3 className="text-xl font-bold font-heading">Bosque Mágico</h3>
                  <p className="text-sm text-white/80">Edades 4-9</p>
                </div>
              </div>
              <div className="p-6 bg-white">
                <p className="text-gray-600 mb-4">
                  Sigue a [Nombre del niño] mientras descubre un bosque mágico donde animales parlantes y árboles encantados le ayudan en una misión especial.
                </p>
                <Button 
                  onClick={handleCreateProfile}
                  variant="link" 
                  className="text-primary hover:text-primary/90 font-medium flex items-center gap-2 p-0"
                >
                  Ver libro <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" ref={pricingRef} className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 mb-4">Precios simples y transparentes</h2>
            <p className="text-lg text-gray-600">
              Elige el formato que mejor se adapte a tus necesidades. Todas las opciones incluyen personalización completa.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Digital Option */}
            <div className="bg-white rounded-xl overflow-hidden shadow-soft border border-gray-100 transition-transform hover:-translate-y-1 duration-300">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold font-heading text-gray-900 mb-2">Edición Digital</h3>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-3xl font-bold text-gray-900">14,99€</span>
                  <span className="text-sm text-gray-500 mb-1">por libro</span>
                </div>
                <p className="text-gray-600 text-sm">
                  Descarga inmediata de tu historia personalizada en formato digital.
                </p>
              </div>
              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Descarga inmediata (PDF)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Personalización completa</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Lee en cualquier dispositivo</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Opción de impresión en casa</span>
                  </li>
                </ul>
                <Button 
                  onClick={handleCreateProfile}
                  variant="outline" 
                  className="w-full py-3 rounded-full border border-primary text-primary hover:bg-primary-50 font-medium"
                >
                  Elegir Digital
                </Button>
              </div>
            </div>
            
            {/* Softcover Option */}
            <div className="bg-white rounded-xl overflow-hidden shadow-card border border-primary-200 relative transform scale-105 z-10">
              <div className="absolute top-0 right-0 bg-primary text-white text-xs py-1 px-3 rounded-bl-lg font-medium">
                Más Popular
              </div>
              <div className="p-6 border-b border-gray-100 bg-primary-50">
                <h3 className="text-xl font-bold font-heading text-gray-900 mb-2">Libro Tapa Blanda</h3>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-3xl font-bold text-gray-900">24,99€</span>
                  <span className="text-sm text-gray-500 mb-1">por libro</span>
                </div>
                <p className="text-gray-600 text-sm">
                  Hermosa edición de tapa blanda con versión digital incluida.
                </p>
              </div>
              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Libro impreso tapa blanda</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Copia digital incluida</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Impresión a color premium</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Envío gratuito</span>
                  </li>
                </ul>
                <Button 
                  onClick={handleCreateProfile}
                  className="w-full py-3 rounded-full font-medium"
                >
                  Elegir Tapa Blanda
                </Button>
              </div>
            </div>
            
            {/* Hardcover Option */}
            <div className="bg-white rounded-xl overflow-hidden shadow-soft border border-gray-100 transition-transform hover:-translate-y-1 duration-300">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold font-heading text-gray-900 mb-2">Libro Tapa Dura</h3>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-3xl font-bold text-gray-900">34,99€</span>
                  <span className="text-sm text-gray-500 mb-1">por libro</span>
                </div>
                <p className="text-gray-600 text-sm">
                  Edición premium de tapa dura diseñada para durar años.
                </p>
              </div>
              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Libro duradero de tapa dura</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Copia digital incluida</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Impresión de máxima calidad</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Empaquetado listo para regalo</span>
                  </li>
                </ul>
                <Button 
                  onClick={handleCreateProfile}
                  variant="outline" 
                  className="w-full py-3 rounded-full border border-primary text-primary hover:bg-primary-50 font-medium"
                >
                  Elegir Tapa Dura
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-12 max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-soft">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="shrink-0 text-primary text-2xl">
                <Info className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Descuentos por volumen disponibles</h4>
                <p className="text-gray-600 text-sm">
                  ¿Creando libros para varios niños o como regalos? Contáctanos para precios especiales en pedidos de 3 o más libros.
                </p>
              </div>
              <div className="shrink-0 ml-auto">
                <Button 
                  variant="secondary" 
                  className="whitespace-nowrap rounded-full text-sm"
                >
                  Contáctanos
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 mb-4">Lo Que Dicen Los Padres</h2>
            <p className="text-lg text-gray-600">
              Descubre por qué las familias adoran los libros personalizados de Utale.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex gap-1 text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "La cara de mi hija se iluminó cuando se vio a sí misma como protagonista del libro. ¡Me pide que se lo lea todas las noches! La personalización es increíblemente detallada."
              </p>
              <div className="flex items-center gap-3">
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=60&h=60&q=80" 
                  alt="Sara J." 
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-medium text-gray-900">Sara J.</h4>
                  <p className="text-sm text-gray-500">Madre de Emma, 5</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex gap-1 text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "He pedido tres libros ya para mi hijo, y cada uno mejora a medida que su perfil se vuelve más detallado. ¡La calidad de los libros de tapa dura es excelente!"
              </p>
              <div className="flex items-center gap-3">
                <img 
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=60&h=60&q=80" 
                  alt="Miguel T." 
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-medium text-gray-900">Miguel T.</h4>
                  <p className="text-sm text-gray-500">Padre de Lucas, 7</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex gap-1 text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "Compré un libro para el cumpleaños de mi sobrina y fue el éxito de la fiesta. La interfaz de chat hizo muy fácil crear su perfil y el servicio al cliente fue excepcional."
              </p>
              <div className="flex items-center gap-3">
                <img 
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=60&h=60&q=80" 
                  alt="Jeniffer R." 
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-medium text-gray-900">Jeniffer R.</h4>
                  <p className="text-sm text-gray-500">Tía de Sofía, 6</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">¿Listo para Crear una Historia Mágica?</h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Comienza a construir el perfil de tu hijo hoy y crea un libro personalizado que atesorarán durante años.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleCreateProfile}
                variant="secondary" 
                size="lg" 
                className="px-8 py-4 rounded-full bg-white text-primary hover:bg-gray-100 text-lg font-medium"
              >
                Crea Tu Primer Libro
              </Button>
              <Button 
                onClick={() => bookShowcaseRef.current?.scrollIntoView({ behavior: 'smooth' })}
                variant="outline" 
                size="lg" 
                className="px-8 py-4 rounded-full border border-white bg-transparent hover:bg-primary-900 text-lg font-medium text-white"
              >
                Ver Libros de Muestra
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 mb-4">Preguntas Frecuentes</h2>
            <p className="text-lg text-gray-600">
              Encuentra respuestas a preguntas comunes sobre los libros de Utale.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="border-b border-gray-200">
                <AccordionTrigger className="text-lg font-medium text-gray-900 py-4">
                  ¿Qué nivel de personalización tienen los libros?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pr-12">
                  Nuestros libros están altamente personalizados según la información que proporcionas en el perfil de tu hijo. Esto incluye su nombre, apariencia, intereses, amigos, mascotas y más. A medida que interactúas con nuestro sistema de chat y actualizas su perfil con el tiempo, las historias se adaptan aún más a su personalidad y experiencias únicas.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2" className="border-b border-gray-200">
                <AccordionTrigger className="text-lg font-medium text-gray-900 py-4">
                  ¿Cuánto tiempo tarda crear y recibir un libro?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pr-12">
                  Los libros digitales están disponibles para descarga inmediatamente después de su creación. Para libros impresos, la producción tarda 2-3 días hábiles, y el envío normalmente toma 3-7 días hábiles, dependiendo de tu ubicación. Opciones de envío urgente están disponibles al finalizar la compra.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3" className="border-b border-gray-200">
                <AccordionTrigger className="text-lg font-medium text-gray-900 py-4">
                  ¿Puedo actualizar el perfil de mi hijo con el tiempo?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pr-12">
                  ¡Sí! De hecho, lo recomendamos. El perfil de tu hijo puede actualizarse en cualquier momento a través de nuestra amigable interfaz de chat. A medida que tu hijo crece y sus intereses evolucionan, puedes actualizar su perfil para asegurar que los futuros libros reflejen estos cambios. Cada nuevo libro incorporará la información más reciente de su perfil.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4" className="border-b border-gray-200">
                <AccordionTrigger className="text-lg font-medium text-gray-900 py-4">
                  ¿Para qué rango de edad son adecuados los libros?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pr-12">
                  Nuestros libros están diseñados principalmente para niños de 2 a 10 años, con diferentes temas y niveles de complejidad disponibles para distintos grupos de edad. Cada libro indica el rango de edad recomendado. El lenguaje y las tramas se adaptan según la edad que especifiques en el perfil de tu hijo.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5" className="border-b border-gray-200">
                <AccordionTrigger className="text-lg font-medium text-gray-900 py-4">
                  ¿Están seguros los datos de mi hijo?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pr-12">
                  Sí, nos tomamos la seguridad de los datos muy en serio. Toda la información personal se almacena de forma segura mediante cifrado, y nunca compartimos tus datos con terceros. Nuestra plataforma cumple con las normativas relevantes de protección de datos, y puedes eliminar tu cuenta y los datos asociados en cualquier momento a través de la configuración de tu cuenta.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <div className="mt-8 text-center">
              <Button 
                variant="link" 
                className="text-primary hover:text-primary/90 font-medium flex items-center justify-center gap-2 text-base"
              >
                Ver todas las preguntas <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
