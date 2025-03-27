import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { Bell, Clock, Book, Gift, CreditCard, CheckCircle2, AlertCircle, Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Componente para mostrar una notificación individual
interface NotificationItemProps {
  title: string;
  message: string;
  time: string;
  icon: React.ReactNode;
  isRead?: boolean;
  type?: "info" | "success" | "warning" | "error";
}

const NotificationItem = ({ title, message, time, icon, isRead = false, type = "info" }: NotificationItemProps) => {
  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-100";
      case "warning":
        return "bg-amber-50 border-amber-100";
      case "error":
        return "bg-red-50 border-red-100";
      default:
        return "bg-blue-50 border-blue-100";
    }
  };

  const getIconBackground = () => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-600";
      case "warning":
        return "bg-amber-100 text-amber-600";
      case "error":
        return "bg-red-100 text-red-600";
      default:
        return "bg-blue-100 text-blue-600";
    }
  };

  return (
    <div className={`p-4 border rounded-lg mb-3 relative ${isRead ? "bg-gray-50 opacity-80" : getTypeStyles()}`}>
      {!isRead && (
        <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-primary animate-pulse"></span>
      )}
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${getIconBackground()}`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <h4 className="font-medium">{title}</h4>
            <span className="text-xs text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {time}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
};

const Notifications = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold">No has iniciado sesión</h2>
          <p className="mt-2 text-muted-foreground">
            Por favor, inicia sesión para ver tus notificaciones.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Notificaciones
        </h1>
        <p className="text-muted-foreground mt-2">
          Mantente al día con las últimas actualizaciones de tus libros y suscripciones
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <Badge className="px-3 py-1 bg-primary text-white">
          <Bell className="h-3 w-3 mr-2" />
          2 nuevas notificaciones
        </Badge>
        <Button variant="outline" size="sm">Marcar todo como leído</Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="unread">No leídas</TabsTrigger>
          <TabsTrigger value="books">Libros</TabsTrigger>
          <TabsTrigger value="subscription">Suscripción</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Notificaciones Recientes</CardTitle>
              <CardDescription>Últimas actualizaciones y mensajes</CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationItem 
                title="¡Nuevo libro generado!" 
                message="Tu libro 'Aventuras en el Bosque Encantado' está listo para ver." 
                time="Hace 2 horas" 
                icon={<Book className="h-4 w-4" />}
                type="success"
              />
              
              <NotificationItem 
                title="Recordatorio de suscripción" 
                message="Tu ciclo de facturación finaliza en 3 días. ¡Es hora de revisar tu plan!" 
                time="Ayer, 15:30" 
                icon={<Calendar className="h-4 w-4" />}
                type="info"
              />
              
              <NotificationItem 
                title="Código de regalo" 
                message="Has recibido un código de regalo para un libro extra este mes." 
                time="Hace 2 días" 
                icon={<Gift className="h-4 w-4" />}
                isRead={true}
              />
              
              <NotificationItem 
                title="Pago procesado" 
                message="Tu pago mensual de suscripción ha sido procesado correctamente." 
                time="Hace 1 semana" 
                icon={<CreditCard className="h-4 w-4" />}
                type="success"
                isRead={true}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Notificaciones del Sistema</CardTitle>
              <CardDescription>Actualizaciones y mensajes del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationItem 
                title="Mantenimiento programado" 
                message="El servicio estará en mantenimiento el sábado 10 de junio de 2:00 a 4:00 AM." 
                time="Hace 3 días" 
                icon={<AlertCircle className="h-4 w-4" />}
                type="warning"
                isRead={true}
              />
              
              <NotificationItem 
                title="Nueva característica disponible" 
                message="¡Ahora puedes crear libros con múltiples perfiles infantiles! Prueba esta nueva función." 
                time="Hace 1 semana" 
                icon={<CheckCircle2 className="h-4 w-4" />}
                type="info"
                isRead={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unread">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">No leídas</CardTitle>
              <CardDescription>Mensajes que aún no has visto</CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationItem 
                title="¡Nuevo libro generado!" 
                message="Tu libro 'Aventuras en el Bosque Encantado' está listo para ver." 
                time="Hace 2 horas" 
                icon={<Book className="h-4 w-4" />}
                type="success"
              />
              
              <NotificationItem 
                title="Recordatorio de suscripción" 
                message="Tu ciclo de facturación finaliza en 3 días. ¡Es hora de revisar tu plan!" 
                time="Ayer, 15:30" 
                icon={<Calendar className="h-4 w-4" />}
                type="info"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="books">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Notificaciones de Libros</CardTitle>
              <CardDescription>Actualizaciones relacionadas con tus libros</CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationItem 
                title="¡Nuevo libro generado!" 
                message="Tu libro 'Aventuras en el Bosque Encantado' está listo para ver." 
                time="Hace 2 horas" 
                icon={<Book className="h-4 w-4" />}
                type="success"
              />
              
              <div className="py-2 text-center text-sm text-muted-foreground">
                <p>No hay más notificaciones de libros</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Suscripción</CardTitle>
              <CardDescription>Actualizaciones de tu suscripción</CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationItem 
                title="Recordatorio de suscripción" 
                message="Tu ciclo de facturación finaliza en 3 días. ¡Es hora de revisar tu plan!" 
                time="Ayer, 15:30" 
                icon={<Calendar className="h-4 w-4" />}
                type="info"
              />
              
              <NotificationItem 
                title="Código de regalo" 
                message="Has recibido un código de regalo para un libro extra este mes." 
                time="Hace 2 días" 
                icon={<Gift className="h-4 w-4" />}
                isRead={true}
              />
              
              <NotificationItem 
                title="Pago procesado" 
                message="Tu pago mensual de suscripción ha sido procesado correctamente." 
                time="Hace 1 semana" 
                icon={<CreditCard className="h-4 w-4" />}
                type="success"
                isRead={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 rounded-lg bg-muted p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Configura tus preferencias de notificaciones en la sección de{" "}
          <a href="/settings" className="font-medium text-primary hover:underline">
            Configuración
          </a>
        </p>
      </div>
    </div>
  );
};

export default Notifications;