import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Mail, MessageSquare, Phone, MapPin, Clock } from "lucide-react";

const formSchema = z.object({
  nombre: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Por favor introduce un email válido.",
  }),
  asunto: z.string().min(2, {
    message: "El asunto debe tener al menos 2 caracteres.",
  }),
  tipo: z.string({
    required_error: "Por favor selecciona un tipo de consulta.",
  }),
  mensaje: z.string().min(10, {
    message: "El mensaje debe tener al menos 10 caracteres.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const Contacto = () => {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      email: "",
      asunto: "",
      tipo: "",
      mensaje: "",
    },
  });

  function onSubmit(data: FormValues) {
    toast({
      title: "Mensaje enviado",
      description: "Hemos recibido tu mensaje. Nos pondremos en contacto contigo lo antes posible.",
    });
    form.reset();
  }

  return (
    <div className="container py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
          Contáctanos
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Estamos aquí para ayudarte. Rellena el formulario y nuestro equipo te responderá lo antes posible.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Envíanos un mensaje</CardTitle>
              <CardDescription>
                Completa el formulario a continuación y te responderemos en menos de 24 horas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="nombre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Tu nombre" {...field} />
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
                            <Input placeholder="tu@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="tipo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de consulta</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona un tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="soporte_tecnico">Soporte técnico</SelectItem>
                              <SelectItem value="facturacion">Facturación</SelectItem>
                              <SelectItem value="contenido">Contenido del libro</SelectItem>
                              <SelectItem value="sugerencia">Sugerencia</SelectItem>
                              <SelectItem value="otro">Otro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="asunto"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Asunto</FormLabel>
                          <FormControl>
                            <Input placeholder="Asunto de tu mensaje" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="mensaje"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mensaje</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Escribe aquí tu mensaje..."
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full md:w-auto">
                    Enviar mensaje
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle>Información de contacto</CardTitle>
              <CardDescription>
                Otras maneras de ponerte en contacto con nosotros.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start space-x-4">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Correo electrónico</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    <a href="mailto:info@utale.es" className="hover:text-primary transition-colors">
                      info@utale.es
                    </a>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Para consultas generales
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Soporte</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    <a href="mailto:soporte@utale.es" className="hover:text-primary transition-colors">
                      soporte@utale.es
                    </a>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Para problemas técnicos
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Phone className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Teléfono</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    <a href="tel:+34900123456" className="hover:text-primary transition-colors">
                      +34 900 123 456
                    </a>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Lunes a Viernes, 9:00 - 18:00
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Ubicación</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Calle Imaginación, 123<br />
                    28001 Madrid, España
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Horario de atención</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Lunes a Viernes: 9:00 - 18:00<br />
                    Sábados: 10:00 - 14:00<br />
                    Domingos: Cerrado
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Síguenos</CardTitle>
              <CardDescription>
                Mantente al día con nuestras últimas novedades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-around">
                <a href="#" className="group">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <i className="fab fa-facebook-f text-primary"></i>
                  </div>
                </a>
                <a href="#" className="group">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <i className="fab fa-twitter text-primary"></i>
                  </div>
                </a>
                <a href="#" className="group">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <i className="fab fa-instagram text-primary"></i>
                  </div>
                </a>
                <a href="#" className="group">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <i className="fab fa-linkedin-in text-primary"></i>
                  </div>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contacto;