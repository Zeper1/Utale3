import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionTierSelector } from "@/components/SubscriptionTierSelector";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  CreditCard,
  Clock,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  DownloadCloud,
  Calendar,
  FileText,
  Package,
  RefreshCcw,
  X,
  AlertTriangle,
} from "lucide-react";
import { useLocation } from "wouter";
import type { SubscriptionTier } from "@shared/schema";

interface SubscriptionDetailsProps {
  daysLeft: number;
  booksRemaining: number;
  totalBooksAvailable: number;
  renewalDate: string;
  onChangePlan: () => void;
  onRenew: () => void;
  onCancel: () => void;
  status: "active" | "canceled" | "expired";
}

const SubscriptionDetails = ({
  daysLeft,
  booksRemaining,
  totalBooksAvailable,
  renewalDate,
  onChangePlan,
  onRenew,
  onCancel,
  status,
}: SubscriptionDetailsProps) => {
  const getStatusColor = () => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "canceled":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "expired":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "active":
        return "Activa";
      case "canceled":
        return "Cancelada";
      case "expired":
        return "Expirada";
      default:
        return "Desconocido";
    }
  };

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Tu suscripción</CardTitle>
          <Badge className={`px-3 py-1 ${getStatusColor()}`}>
            {getStatusText()}
          </Badge>
        </div>
        <CardDescription>
          Gestiona tu plan de suscripción actual
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Próxima renovación</span>
            <h3 className="text-xl font-semibold flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
              {renewalDate}
            </h3>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Días restantes</span>
            <div className="flex flex-col">
              <h3 className="text-xl font-semibold">{daysLeft} días</h3>
              <Progress value={(daysLeft / 28) * 100} className="h-2 mt-1" />
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-1">
          <span className="text-sm text-muted-foreground">Libros disponibles</span>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-muted-foreground" />
              <span>
                {booksRemaining} de {totalBooksAvailable} restantes
              </span>
            </h3>
            <Badge variant="outline" className="bg-primary/5">
              {Math.round((booksRemaining / totalBooksAvailable) * 100)}%
            </Badge>
          </div>
          <Progress value={(booksRemaining / totalBooksAvailable) * 100} className="h-2 mt-1" />
        </div>

        <div className="rounded-lg bg-muted p-4 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Package className="h-5 w-5 mr-2 text-primary" />
              <span className="font-medium">Plan Familiar</span>
            </div>
            <span className="text-sm font-medium">€9.99/semana</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-start">
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
              <span className="text-sm">{totalBooksAvailable} libros por semana</span>
            </div>
            <div className="flex items-start">
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
              <span className="text-sm">Hasta 40 páginas por libro</span>
            </div>
            <div className="flex items-start">
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
              <span className="text-sm">Personalización completa</span>
            </div>
            <div className="flex items-start">
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
              <span className="text-sm">Biblioteca digital ilimitada</span>
            </div>
            <div className="flex items-start">
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
              <span className="text-sm">Descarga en PDF</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        {status === "active" ? (
          <>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={onChangePlan}
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Cambiar plan
            </Button>
            <Button
              variant="destructive"
              className="w-full sm:w-auto"
              onClick={onCancel}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar suscripción
            </Button>
          </>
        ) : (
          <Button className="w-full" onClick={onRenew}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Renovar suscripción
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

interface InvoiceProps {
  id: string;
  date: string;
  amount: string;
  status: "pagado" | "pendiente" | "fallido";
}

const Invoice = ({ id, date, amount, status }: InvoiceProps) => {
  const getStatusBadge = () => {
    switch (status) {
      case "pagado":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Pagado</Badge>;
      case "pendiente":
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Pendiente</Badge>;
      case "fallido":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Fallido</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-between p-3 border-b last:border-0">
      <div className="flex items-center gap-3">
        <FileText className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="font-medium">Factura #{id}</p>
          <p className="text-sm text-muted-foreground">{date}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-medium">{amount}</span>
        {getStatusBadge()}
        <Button variant="ghost" size="sm">
          <DownloadCloud className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

interface NoSubscriptionProps {
  onGetStarted: () => void;
}

const NoSubscription = ({ onGetStarted }: NoSubscriptionProps) => {
  return (
    <Card className="text-center p-6 border-dashed border-2">
      <CardContent className="pt-6">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-primary/10 p-3">
            <CreditCard className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h3 className="text-xl font-bold mb-2">Sin suscripción activa</h3>
        <p className="text-muted-foreground mb-6">
          Actualmente no tienes ninguna suscripción activa. Suscríbete para disfrutar de todas las ventajas de Utale.
        </p>
        <Button onClick={onGetStarted} className="w-full md:w-auto">
          <ArrowRight className="h-4 w-4 mr-2" />
          Comenzar
        </Button>
      </CardContent>
    </Card>
  );
};

const Subscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [showTierSelector, setShowTierSelector] = useState(false);

  const { data: subscription, isLoading } = useQuery({
    queryKey: ["subscription"],
    queryFn: () => Promise.resolve(user?.stripeSubscriptionId ? { active: true } : null),
    enabled: !!user,
  });

  const handleSelectTier = (tier: SubscriptionTier) => {
    setSelectedTier(tier);
  };

  const handleSubscribe = () => {
    if (!selectedTier) {
      toast({
        title: "Error",
        description: "Por favor, selecciona un plan de suscripción",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Procesando",
      description: "Redirigiendo al proceso de pago...",
    });

    // Simulamos redirección a la página de pago
    setTimeout(() => {
      setLocation("/checkout");
    }, 1000);
  };

  const handleCancelSubscription = () => {
    toast({
      title: "Suscripción cancelada",
      description: "Tu suscripción se cancelará al final del período de facturación actual.",
    });
  };

  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold">No has iniciado sesión</h2>
          <p className="mt-2 text-muted-foreground">
            Por favor, inicia sesión para gestionar tu suscripción.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Mi Suscripción
        </h1>
        <p className="text-muted-foreground mt-2">
          Gestiona tu plan de suscripción y facturación
        </p>
      </div>

      {showTierSelector ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Selecciona un plan</h2>
            <Button
              variant="ghost"
              onClick={() => setShowTierSelector(false)}
            >
              Volver
            </Button>
          </div>

          <SubscriptionTierSelector
            onSelectTier={handleSelectTier}
            initialTierId={selectedTier?.id}
          />

          <div className="flex justify-end mt-6">
            <Button onClick={handleSubscribe}>
              Continuar con el pago
            </Button>
          </div>
        </div>
      ) : subscription?.active ? (
        <div className="space-y-8">
          <SubscriptionDetails
            daysLeft={14}
            booksRemaining={3}
            totalBooksAvailable={5}
            renewalDate="10 de Abril, 2025"
            onChangePlan={() => setShowTierSelector(true)}
            onRenew={() => setShowTierSelector(true)}
            onCancel={handleCancelSubscription}
            status="active"
          />

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-lg font-semibold">Método de pago</h3>
              <p className="text-sm text-muted-foreground">
                Tu forma de pago actual
              </p>
            </div>
            <div className="p-6 pt-0">
              <div className="flex items-center space-x-4">
                <div className="rounded-md bg-primary/10 p-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-medium">**** **** **** 4242</p>
                  <p className="text-xs text-muted-foreground">
                    Visa • Expira 12/2026
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Cambiar
                </Button>
              </div>
            </div>
          </div>

          <Tabs defaultValue="history">
            <TabsList className="mb-4">
              <TabsTrigger value="history">
                <Clock className="h-4 w-4 mr-2" />
                Historial
              </TabsTrigger>
              <TabsTrigger value="invoices">
                <FileText className="h-4 w-4 mr-2" />
                Facturas
              </TabsTrigger>
            </TabsList>
            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Historial de pagos</CardTitle>
                  <CardDescription>
                    Historial de pagos recientes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-green-100 p-1.5">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Pago procesado</p>
                          <p className="text-xs text-muted-foreground">
                            14 de Marzo, 2025
                          </p>
                        </div>
                      </div>
                      <span className="font-medium">€9.99</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-green-100 p-1.5">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Pago procesado</p>
                          <p className="text-xs text-muted-foreground">
                            7 de Marzo, 2025
                          </p>
                        </div>
                      </div>
                      <span className="font-medium">€9.99</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-green-100 p-1.5">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Pago procesado</p>
                          <p className="text-xs text-muted-foreground">
                            28 de Febrero, 2025
                          </p>
                        </div>
                      </div>
                      <span className="font-medium">€9.99</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="invoices">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Facturas</CardTitle>
                  <CardDescription>
                    Tus facturas y recibos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="divide-y">
                    <Invoice
                      id="12345"
                      date="14 de Marzo, 2025"
                      amount="€9.99"
                      status="pagado"
                    />
                    <Invoice
                      id="12344"
                      date="7 de Marzo, 2025"
                      amount="€9.99"
                      status="pagado"
                    />
                    <Invoice
                      id="12343"
                      date="28 de Febrero, 2025"
                      amount="€9.99"
                      status="pagado"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">Sobre la cancelación</h4>
                <p className="text-sm">
                  Si cancelas tu suscripción, seguirás teniendo acceso hasta el final del período de facturación actual. No se realizarán reembolsos por períodos parciales.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <NoSubscription onGetStarted={() => setShowTierSelector(true)} />
      )}
    </div>
  );
};

export default Subscription;