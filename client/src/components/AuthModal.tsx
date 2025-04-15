import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

// Define form validation schemas
const loginSchema = z.object({
  email: z.string().email({ message: "Por favor, introduce una dirección de correo válida" }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
  rememberMe: z.boolean().optional(),
});

const signupSchema = z.object({
  firstName: z.string().min(1, { message: "El nombre es obligatorio" }),
  lastName: z.string().min(1, { message: "El apellido es obligatorio" }),
  email: z.string().email({ message: "Por favor, introduce una dirección de correo válida" }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar los términos y condiciones" }),
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  view: "login" | "signup";
  setView: (view: "login" | "signup") => void;
}

const AuthModal = ({ isOpen, onClose, view, setView }: AuthModalProps) => {
  const { toast } = useToast();
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize forms
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      termsAccepted: false as any, // Esto permite iniciar con false aunque el esquema requiera true
    },
  });

  const handleLoginSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      await signIn(data.email, data.password);
      toast({
        title: "Inicio de sesión exitoso",
        description: "¡Bienvenido de nuevo a Utale!",
      });
      onClose();
    } catch (error: any) {
      console.error("Login error:", error);
      
      let errorMessage = "Por favor, verifica tus credenciales e inténtalo de nuevo.";
      
      // Mensajes específicos según el código de error de Firebase
      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            errorMessage = "Correo electrónico o contraseña incorrectos.";
            break;
          case 'auth/too-many-requests':
            errorMessage = "Demasiados intentos fallidos. Por favor, espera unos minutos.";
            break;
          case 'auth/user-disabled':
            errorMessage = "Tu cuenta ha sido deshabilitada. Contacta con soporte.";
            break;
          case 'auth/requires-recent-login':
            errorMessage = "Esta operación requiere una autenticación reciente. Inicia sesión de nuevo.";
            break;
          case 'auth/invalid-email':
            errorMessage = "El formato del correo electrónico no es válido.";
            break;
          case 'auth/network-request-failed':
            errorMessage = "Error de conexión. Verifica tu conexión a internet.";
            break;
          case 'auth/unauthorized-domain':
            errorMessage = "Este dominio no está autorizado para inicios de sesión.";
            break;
        }
      }
      
      toast({
        title: "Error de inicio de sesión",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    try {
      const displayName = `${data.firstName} ${data.lastName}`;
      await signUp(data.email, data.password, displayName);
      toast({
        title: "Cuenta creada",
        description: "¡Bienvenido a Utale!",
      });
      onClose();
    } catch (error: any) {
      console.error("Signup error:", error);
      
      let errorMessage = "Hubo un error al crear tu cuenta. Por favor, inténtalo de nuevo.";
      
      // Mensajes específicos según el código de error de Firebase
      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = "Este correo electrónico ya está en uso. Prueba a iniciar sesión o a recuperar tu contraseña.";
            break;
          case 'auth/invalid-email':
            errorMessage = "El formato del correo electrónico no es válido.";
            break;
          case 'auth/operation-not-allowed':
            errorMessage = "El registro con correo y contraseña no está habilitado. Contacta con soporte.";
            break;
          case 'auth/weak-password':
            errorMessage = "La contraseña es demasiado débil. Usa al menos 6 caracteres.";
            break;
          case 'auth/network-request-failed':
            errorMessage = "Error de conexión. Verifica tu conexión a internet.";
            break;
          case 'auth/too-many-requests':
            errorMessage = "Demasiados intentos. Por favor, espera unos minutos antes de intentarlo de nuevo.";
            break;
        }
      }
      
      toast({
        title: "Error de registro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      toast({
        title: "Inicio de sesión exitoso",
        description: "¡Bienvenido a Utale!",
      });
      onClose();
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      
      let errorMessage = "Hubo un error al iniciar sesión con Google. Por favor, inténtalo de nuevo.";
      
      // Mensajes específicos según el código de error de Firebase
      if (error.code) {
        switch (error.code) {
          case 'auth/popup-closed-by-user':
            errorMessage = "Has cerrado la ventana de inicio de sesión. Inténtalo de nuevo.";
            break;
          case 'auth/cancelled-popup-request':
            errorMessage = "La solicitud de inicio de sesión fue cancelada. Inténtalo de nuevo.";
            break;
          case 'auth/popup-blocked':
            errorMessage = "El navegador ha bloqueado la ventana emergente. Permite ventanas emergentes e inténtalo de nuevo.";
            break;
          case 'auth/account-exists-with-different-credential':
            errorMessage = "Ya existe una cuenta con este correo electrónico pero con diferente método de inicio de sesión.";
            break;
          case 'auth/unauthorized-domain':
            errorMessage = "Este dominio no está autorizado para operaciones de inicio de sesión.";
            break;
          case 'auth/network-request-failed':
            errorMessage = "Error de conexión. Verifica tu conexión a internet.";
            break;
        }
      }
      
      toast({
        title: "Error de inicio con Google",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleView = () => {
    setView(view === "login" ? "signup" : "login");
    loginForm.reset();
    signupForm.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        {view === "login" ? (
          <>
            <DialogTitle className="text-2xl text-center">Bienvenido de nuevo</DialogTitle>
            <DialogDescription className="text-center">
              Inicia sesión en tu cuenta de Utale
            </DialogDescription>
            
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo electrónico</FormLabel>
                      <FormControl>
                        <Input placeholder="tu@correo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex items-center justify-between">
                  <FormField
                    control={loginForm.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm cursor-pointer">Recordarme</FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <Button variant="link" className="p-0 h-auto" onClick={() => toast({ title: "Próximamente", description: "La función de restablecimiento de contraseña estará disponible pronto." })}>
                    ¿Olvidaste la contraseña?
                  </Button>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>
              </form>
            </Form>
            
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-gray-300 absolute w-full"></div>
              <span className="bg-background px-3 text-sm text-muted-foreground relative">o continuar con</span>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <Button variant="outline" onClick={handleGoogleSignIn} type="button">
                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                  <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
                </svg>
                Google
              </Button>
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              ¿No tienes una cuenta?{" "}
              <Button variant="link" className="p-0 h-auto" onClick={toggleView}>
                Regístrate
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogTitle className="text-2xl text-center">Crear una cuenta</DialogTitle>
            <DialogDescription className="text-center">
              Únete a Utale para crear libros personalizados
            </DialogDescription>
            
            <Form {...signupForm}>
              <form onSubmit={signupForm.handleSubmit(handleSignupSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={signupForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={signupForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apellido</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={signupForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo electrónico</FormLabel>
                      <FormControl>
                        <Input placeholder="tu@correo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={signupForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Al menos 6 caracteres" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={signupForm.control}
                  name="termsAccepted"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-2">
                      <FormControl>
                        <Checkbox 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm">
                          Acepto los <Button variant="link" className="p-0 h-auto">Términos de Servicio</Button> y la <Button variant="link" className="p-0 h-auto">Política de Privacidad</Button>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creando cuenta..." : "Crear cuenta"}
                </Button>
              </form>
            </Form>
            
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-gray-300 absolute w-full"></div>
              <span className="bg-background px-3 text-sm text-muted-foreground relative">o regístrate con</span>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <Button variant="outline" onClick={handleGoogleSignIn} type="button">
                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                  <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
                </svg>
                Google
              </Button>
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              ¿Ya tienes una cuenta?{" "}
              <Button variant="link" className="p-0 h-auto" onClick={toggleView}>
                Inicia sesión
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
