import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Footer = () => {
  const { toast } = useToast();
  
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    
    if (email) {
      toast({
        title: "Suscripción exitosa",
        description: "¡Gracias por suscribirte a nuestro boletín!",
      });
      form.reset();
    }
  };
  
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="text-primary-400 text-2xl">
                <BookOpen />
              </div>
              <h2 className="text-xl font-bold font-heading text-white">Utale</h2>
            </div>
            <p className="text-gray-400 mb-6">
              Creando historias personalizadas que capturan la imaginación de tu hijo y crean recuerdos duraderos.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors" aria-label="Pinterest">
                <i className="fab fa-pinterest-p"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-3">
              <li><Link href="/como-funciona" className="text-gray-400 hover:text-primary transition-colors">Cómo Funciona</Link></li>
              <li><Link href="/catalogo" className="text-gray-400 hover:text-primary transition-colors">Catálogo de Libros</Link></li>
              <li><Link href="/precios" className="text-gray-400 hover:text-primary transition-colors">Precios</Link></li>
              <li><Link href="/tarjetas-regalo" className="text-gray-400 hover:text-primary transition-colors">Tarjetas Regalo</Link></li>
              <li><Link href="/testimonios" className="text-gray-400 hover:text-primary transition-colors">Testimonios</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-4">Soporte</h3>
            <ul className="space-y-3">
              <li><Link href="/faqs" className="text-gray-400 hover:text-primary transition-colors">Preguntas Frecuentes</Link></li>
              <li><Link href="/contacto" className="text-gray-400 hover:text-primary transition-colors">Contáctanos</Link></li>
              <li><Link href="/envios" className="text-gray-400 hover:text-primary transition-colors">Política de Envíos</Link></li>
              <li><Link href="/devoluciones" className="text-gray-400 hover:text-primary transition-colors">Política de Devoluciones</Link></li>
              <li><Link href="/ayuda" className="text-gray-400 hover:text-primary transition-colors">Centro de Ayuda</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-4">Boletín</h3>
            <p className="text-gray-400 mb-4">
              Suscríbete para recibir actualizaciones, acceso a ofertas exclusivas y más.
            </p>
            <form className="mb-4" onSubmit={handleSubscribe}>
              <div className="flex">
                <Input 
                  type="email" 
                  name="email"
                  placeholder="Tu dirección de correo" 
                  className="rounded-l-lg bg-gray-800 border-gray-700 text-white"
                  required
                />
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-r-lg"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
            <p className="text-xs text-gray-500">
              Al suscribirte aceptas nuestra Política de Privacidad y das tu consentimiento para recibir actualizaciones de nuestra empresa.
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Utale. Todos los derechos reservados.
            </p>
            <div className="flex gap-6">
              <Link href="/privacidad" className="text-gray-500 hover:text-primary text-sm transition-colors">Política de Privacidad</Link>
              <Link href="/terminos" className="text-gray-500 hover:text-primary text-sm transition-colors">Términos de Servicio</Link>
              <Link href="/cookies" className="text-gray-500 hover:text-primary text-sm transition-colors">Política de Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
