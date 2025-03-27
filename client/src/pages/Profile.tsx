import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, UserCircle, Pencil, Check, X } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const profileSchema = z.object({
  displayName: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres",
  }),
  email: z.string().email({
    message: "Introduce un correo electrónico válido",
  }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const getUserInitials = () => {
    if (!user) return "U";
    if (user.displayName) {
      return user.displayName
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || user?.username || "",
      email: user?.email || "",
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      if (!user) return;

      await apiRequest("PATCH", `/api/users/${user.id}`, data);

      toast({
        title: "Perfil actualizado",
        description: "Tus cambios han sido guardados correctamente.",
        variant: "default",
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil. Inténtalo nuevamente.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold">No has iniciado sesión</h2>
          <p className="mt-2 text-muted-foreground">
            Por favor, inicia sesión para ver tu perfil.
          </p>
        </div>
      </div>
    );
  }

  const cancelEdit = () => {
    form.reset({
      displayName: user?.displayName || user?.username || "",
      email: user?.email || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Mi Perfil
        </h1>
        <p className="text-muted-foreground mt-2">
          Administra tu información personal
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card className="border-none shadow-md bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="pt-6 flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4 border-4 border-white shadow-lg">
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-2xl">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-bold mb-1">
                {user.displayName || user.username}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">{user.email}</p>
              <Badge variant="outline" className="px-3 py-1">
                {user.stripeSubscriptionId ? "Suscriptor" : "Usuario Gratuito"}
              </Badge>
            </CardContent>
          </Card>

          <div className="mt-6">
            <h3 className="font-medium text-lg mb-3">Información Rápida</h3>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <UserCircle className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Usuario desde</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-accent"
                    >
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium">Correo verificado</p>
                      <p className="text-sm text-muted-foreground">Sí</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Información Personal</CardTitle>
                  <CardDescription>
                    Actualiza tus datos personales
                  </CardDescription>
                </div>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={cancelEdit}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={form.handleSubmit(onSubmit)}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Guardar
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre completo</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Tu nombre"
                              className="pl-10"
                              disabled={!isEditing}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo electrónico</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="tu@email.com"
                              className="pl-10"
                              disabled={!isEditing}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Este es el correo donde recibirás todas las
                          notificaciones de tus libros.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Preferencias</CardTitle>
              <CardDescription>
                Configura tus preferencias de notificaciones y privacidad
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Notificaciones por correo</h4>
                  <p className="text-sm text-muted-foreground">
                    Recibe alertas sobre nuevos libros y actualizaciones
                  </p>
                </div>
                <Badge variant="outline" className="bg-primary/10">
                  Activado
                </Badge>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Boletín semanal</h4>
                  <p className="text-sm text-muted-foreground">
                    Recibe un resumen de las actividades semanales
                  </p>
                </div>
                <Badge variant="outline" className="bg-primary/10">
                  Activado
                </Badge>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Gestionar notificaciones
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;