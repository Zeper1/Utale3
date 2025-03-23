import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export default function SubscriptionCancel() {
  const [, navigate] = useLocation();

  return (
    <div className="container max-w-3xl mx-auto py-16 text-center">
      <div className="mb-8 flex justify-center">
        <XCircle className="h-24 w-24 text-red-500" />
      </div>
      
      <h1 className="text-3xl font-bold mb-4">Suscripción cancelada</h1>
      
      <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
        Has cancelado el proceso de suscripción. No te preocupes, puedes volver a intentarlo
        cuando quieras.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          onClick={() => navigate("/subscribe")}
          size="lg"
        >
          Volver a intentarlo
        </Button>
        
        <Button 
          onClick={() => navigate("/")}
          variant="outline"
          size="lg"
        >
          Ir a inicio
        </Button>
      </div>
    </div>
  );
}