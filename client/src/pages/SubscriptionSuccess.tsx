import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function SubscriptionSuccess() {
  const [, navigate] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Obtener el ID de sesión de los parámetros de la URL
    const params = new URLSearchParams(window.location.search);
    const session = params.get("session_id");
    setSessionId(session);

    // En una implementación real, aquí podríamos verificar el estado de la sesión con Stripe
  }, []);

  return (
    <div className="container max-w-3xl mx-auto py-16 text-center">
      <div className="mb-8 flex justify-center">
        <CheckCircle2 className="h-24 w-24 text-green-500" />
      </div>
      
      <h1 className="text-4xl font-bold mb-4">¡Suscripción completada con éxito!</h1>
      
      <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
        Gracias por suscribirte a StoryMagic. Ya puedes empezar a crear historias
        mágicas para los más pequeños.
      </p>

      {sessionId && (
        <div className="bg-muted p-4 rounded-md mb-8 mx-auto max-w-lg">
          <p className="text-sm text-muted-foreground">
            ID de referencia: <span className="font-mono">{sessionId}</span>
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          onClick={() => navigate("/dashboard")}
          size="lg"
        >
          Ir al panel de control
        </Button>
        
        <Button 
          onClick={() => navigate("/create-book")}
          variant="outline"
          size="lg"
        >
          Crear mi primer libro
        </Button>
      </div>
    </div>
  );
}