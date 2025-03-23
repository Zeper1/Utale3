import { useState } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { SubscriptionTierSelector } from "@/components/SubscriptionTierSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { SubscriptionTier } from "@shared/schema";

export default function Subscribe() {
  const [location, setLocation] = useLocation();
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Simulamos un ID de usuario para la demostración - en la implementación real, esto vendría del contexto de autenticación
  const userId = 1;

  const handleSubscribe = async () => {
    if (!selectedTier) {
      toast({
        title: "Error",
        description: "Por favor, selecciona un plan de suscripción",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessing(true);

      // 1. Crear una intención de pago para la suscripción
      const paymentResponse = await apiRequest("POST", "/api/create-subscription-payment", {
        tierId: selectedTier.id,
        userId,
        returnUrl: `${window.location.origin}/subscription/success`
      });

      const paymentData = await paymentResponse.json();

      // 2. Redirigir al usuario a la página de pago de Stripe
      if (paymentData.url) {
        window.location.href = paymentData.url;
      } else {
        // 3. Alternativa: Crear una suscripción directamente (para demostración/desarrollo)
        const subscriptionResponse = await apiRequest("POST", "/api/subscriptions", {
          userId,
          tierId: selectedTier.id
        });

        if (subscriptionResponse.ok) {
          toast({
            title: "Suscripción creada",
            description: "Tu suscripción ha sido creada con éxito."
          });
          setLocation("/dashboard");
        } else {
          throw new Error("Error al crear la suscripción");
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ha ocurrido un error al procesar tu suscripción. Por favor, inténtalo de nuevo.",
        variant: "destructive"
      });
      console.error("Error al procesar la suscripción:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container max-w-6xl mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Suscríbete a StoryMagic</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Elige el plan perfecto para ti y comienza a crear mágicas historias personalizadas para los más pequeños.
        </p>
      </div>

      <div className="mb-12">
        <SubscriptionTierSelector onSelectTier={setSelectedTier} />
      </div>

      {selectedTier && (
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Resumen de tu suscripción</CardTitle>
            <CardDescription>Revisa los detalles antes de continuar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Plan seleccionado:</span>
                <span className="font-medium">{selectedTier.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Libros por semana:</span>
                <span className="font-medium">{selectedTier.books}</span>
              </div>
              <div className="flex justify-between">
                <span>Páginas por libro:</span>
                <span className="font-medium">{selectedTier.pages}</span>
              </div>
              <div className="flex justify-between">
                <span>Precio semanal:</span>
                <span className="font-bold">
                  {(selectedTier.pricePerWeek / 100).toLocaleString('es-ES', {
                    style: 'currency',
                    currency: 'EUR'
                  })}
                </span>
              </div>
              {selectedTier.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Ahorro:</span>
                  <span className="font-medium">{selectedTier.discount}%</span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleSubscribe} 
              className="w-full" 
              disabled={isProcessing}
            >
              {isProcessing ? "Procesando..." : "Confirmar suscripción"}
            </Button>
          </CardFooter>
        </Card>
      )}

      <div className="mt-16 text-center text-sm text-muted-foreground">
        <p className="mb-2">Al suscribirte, aceptas nuestros Términos y Condiciones y nuestra Política de Privacidad.</p>
        <p>Puedes cancelar tu suscripción en cualquier momento desde tu área de usuario.</p>
      </div>
    </div>
  );
}