import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  BellRing,
  Shield,
  Eye,
  DownloadCloud,
  PaintBucket,
  Moon,
  Sun,
  Languages,
  RefreshCcw,
  Lock,
  Trash2,
  Mail,
  BadgeAlert,
  Volume2,
  BookOpen,
  Palette,
} from "lucide-react";

interface SettingsSwitchProps {
  title: string;
  description: string;
  checked?: boolean;
  onChange?: () => void;
  disabled?: boolean;
}

const SettingsSwitch = ({ title, description, checked = false, onChange, disabled = false }: SettingsSwitchProps) => {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="space-y-0.5">
        <div className="font-medium">{title}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
};

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold">No has iniciado sesión</h2>
          <p className="mt-2 text-muted-foreground">
            Por favor, inicia sesión para ver tu configuración.
          </p>
        </div>
      </div>
    );
  }

  const handleSettingChange = (setting: string) => {
    toast({
      title: "Configuración actualizada",
      description: `Se ha actualizado la configuración de ${setting}`,
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Confirmación requerida",
      description: "Para eliminar tu cuenta, por favor contacta con soporte.",
      variant: "destructive",
    });
  };

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Configuración
        </h1>
        <p className="text-muted-foreground mt-2">
          Personaliza tu experiencia en Utale
        </p>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="notifications">
              <BellRing className="h-4 w-4 mr-2" />
              Notificaciones
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="h-4 w-4 mr-2" />
              Privacidad
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <PaintBucket className="h-4 w-4 mr-2" />
              Apariencia
            </TabsTrigger>
            <TabsTrigger value="account">
              <Lock className="h-4 w-4 mr-2" />
              Cuenta
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>
                Configura cómo y cuándo quieres recibir notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                <SettingsSwitch
                  title="Notificaciones por correo"
                  description="Recibe alertas sobre nuevos libros y actualizaciones"
                  checked={true}
                  onChange={() => handleSettingChange("notificaciones por correo")}
                />
                <SettingsSwitch
                  title="Boletín semanal"
                  description="Recibe un resumen de las actividades semanales"
                  checked={true}
                  onChange={() => handleSettingChange("boletín semanal")}
                />
                <SettingsSwitch
                  title="Ofertas y promociones"
                  description="Recibe información sobre ofertas especiales y descuentos"
                  checked={false}
                  onChange={() => handleSettingChange("ofertas y promociones")}
                />

                <Separator className="my-4" />

                <h3 className="text-sm font-medium text-muted-foreground">Tipos de notificaciones</h3>
                <SettingsSwitch
                  title="Libros generados"
                  description="Cuando un nuevo libro está listo para ver"
                  checked={true}
                  onChange={() => handleSettingChange("libros generados")}
                />
                <SettingsSwitch
                  title="Actualizaciones de suscripción"
                  description="Cambios y recordatorios de tu suscripción"
                  checked={true}
                  onChange={() => handleSettingChange("actualizaciones de suscripción")}
                />
                <SettingsSwitch
                  title="Mensajes del sistema"
                  description="Información importante sobre el funcionamiento del servicio"
                  checked={true}
                  onChange={() => handleSettingChange("mensajes del sistema")}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacidad y seguridad</CardTitle>
              <CardDescription>
                Administra tus datos y opciones de privacidad
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SettingsSwitch
                title="Compartir información con socios"
                description="Permite que compartamos información con socios seleccionados"
                checked={false}
                onChange={() => handleSettingChange("compartir información")}
              />
              <SettingsSwitch
                title="Análisis de uso"
                description="Ayúdanos a mejorar enviando datos anónimos de uso"
                checked={true}
                onChange={() => handleSettingChange("análisis de uso")}
              />
              <SettingsSwitch
                title="Historial de actividad"
                description="Guardar historial de libros generados y acciones"
                checked={true}
                onChange={() => handleSettingChange("historial de actividad")}
              />

              <Separator className="my-4" />

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Tus datos</h3>
                <div className="rounded-md bg-muted p-4">
                  <p className="text-sm">
                    Puedes solicitar una copia de tus datos o eliminar tu cuenta
                    por completo. La eliminación es permanente y no se puede
                    deshacer.
                  </p>
                  <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" size="sm">
                      <DownloadCloud className="h-4 w-4 mr-2" />
                      Solicitar datos
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteAccount}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar cuenta
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Apariencia</CardTitle>
              <CardDescription>
                Personaliza la apariencia de la aplicación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Tema</h3>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" className="justify-start" size="sm">
                    <Sun className="h-4 w-4 mr-2" />
                    Claro
                  </Button>
                  <Button variant="outline" className="justify-start" size="sm">
                    <Moon className="h-4 w-4 mr-2" />
                    Oscuro
                  </Button>
                  <Button
                    variant="default"
                    className="justify-start"
                    size="sm"
                  >
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Sistema
                  </Button>
                </div>
              </div>

              <Separator className="my-4" />

              <h3 className="text-sm font-medium text-muted-foreground">Estilos de los libros</h3>
              <SettingsSwitch
                title="Fuentes extra grandes"
                description="Aumenta el tamaño del texto en los libros para una lectura más fácil"
                checked={false}
                onChange={() => handleSettingChange("fuentes extra grandes")}
              />
              <SettingsSwitch
                title="Efectos visuales"
                description="Habilita animaciones y efectos visuales en los libros"
                checked={true}
                onChange={() => handleSettingChange("efectos visuales")}
              />

              <Separator className="my-4" />

              <h3 className="text-sm font-medium text-muted-foreground">Idioma</h3>
              <div className="rounded-md border p-4 mt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Languages className="h-5 w-5 mr-2 text-muted-foreground" />
                    <span>Español</span>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Cambiar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Cuenta</CardTitle>
              <CardDescription>
                Administra tu cuenta y configuración de seguridad
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Métodos de inicio de sesión
                </h3>
                <div className="rounded-md border p-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 mr-3 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Correo electrónico verificado
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Cambiar
                  </Button>
                </div>

                <Button variant="outline" className="w-full">
                  Cambiar contraseña
                </Button>
              </div>

              <Separator className="my-2" />

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Suscripción y pagos
                </h3>
                <div className="rounded-md border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-medium">Plan actual</p>
                    <Badge variant="outline" className="bg-primary/10">
                      {user.stripeSubscriptionId ? "Activo" : "Gratuito"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {user.stripeSubscriptionId
                      ? "Tienes una suscripción activa"
                      : "No tienes una suscripción activa"}
                  </p>
                  <Button variant="outline" size="sm">
                    Gestionar suscripción
                  </Button>
                </div>
              </div>

              <Separator className="my-2" />

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Zona de peligro
                </h3>
                <div className="rounded-md border border-destructive/20 p-4 bg-destructive/5">
                  <div className="flex items-start mb-4">
                    <BadgeAlert className="h-5 w-5 text-destructive mr-2" />
                    <div>
                      <p className="font-medium text-destructive mb-1">
                        Eliminar cuenta
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Una vez elimines tu cuenta, no hay vuelta atrás. Ten cuidado.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteAccount}
                  >
                    Eliminar cuenta
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;