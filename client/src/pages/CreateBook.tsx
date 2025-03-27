import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  ArrowRight, 
  BookOpen, 
  Check, 
  Loader2, 
  Star, 
  Wand2, 
  Sparkles, 
  Palette, 
  Lightbulb, 
  Heart, 
  Edit3,
  PlusCircle,
  PencilLine,
  UserCircle,
  Users
} from "lucide-react";

// Esquema para la creación de libros
const bookFormSchema = z.object({
  characterIds: z.array(z.string()).min(1, "Por favor selecciona al menos un personaje").max(5, "Máximo 5 personajes por libro"),
  themeOption: z.enum(["predeterminado", "personalizado"]), // tema predeterminado o personalizado
  themeId: z.string().optional(),
  customTheme: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    setting: z.string().optional(),
    additionalCharacters: z.string().optional(),
    plotType: z.string().optional(),
    includeMoralLesson: z.boolean().optional(),
    additionalNotes: z.string().optional()
  }).optional(),
});

type BookFormValues = z.infer<typeof bookFormSchema>;

export default function CreateBook() {
  const [_, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreatingBook, setIsCreatingBook] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [bookId, setBookId] = useState<number | null>(null);

  // Redirigir si no ha iniciado sesión
  useEffect(() => {
    if (!user) {
      setLocation("/");
      toast({
        title: "Autenticación requerida",
        description: "Por favor inicia sesión para crear un libro",
        variant: "destructive",
      });
    }
  }, [user, setLocation, toast]);

  // Fetch child profiles
  const { 
    data: childProfiles = [],
    isLoading: profilesLoading,
    error: profilesError
  } = useQuery({
    queryKey: ['/api/users', user?.id, 'profiles'],
    queryFn: () => apiRequest('GET', `/api/users/${user?.id}/profiles`).then(res => res.json()),
    enabled: !!user?.id,
  });

  // Fetch book themes
  const {
    data: bookThemes = [],
    isLoading: themesLoading,
    error: themesError
  } = useQuery({
    queryKey: ['/api/book-themes'],
    queryFn: () => apiRequest('GET', '/api/book-themes').then(res => res.json()),
  });

  // Mutación para la generación y creación del libro
  const generateBook = useMutation({
    mutationFn: async (values: { characterId: number, themeId: number }) => {
      // Paso 1: Generar el contenido del libro con OpenAI
      const generateContentResponse = await apiRequest('POST', '/api/books/generate-content', {
        characterId: values.characterId,
        themeId: values.themeId,
        // Si hubiera una implementación completa, enviaríamos también los personajes adicionales
        // additionalCharacterIds: values.additionalCharacterIds
      });
      
      if (!generateContentResponse.ok) {
        throw new Error('Error al generar el contenido del libro');
      }
      
      const bookContent = await generateContentResponse.json();
      
      // Paso 2: Crear la entrada inicial del libro en la base de datos
      const createBookResponse = await apiRequest('POST', '/api/books', {
        userId: user?.id,
        characterId: values.characterId, // Personaje principal
        themeId: values.themeId,
        title: bookContent.title,
        content: bookContent,
        format: 'digital',
        status: 'generating'
      });
      
      if (!createBookResponse.ok) {
        throw new Error('Error al crear el registro del libro');
      }
      
      const book = await createBookResponse.json();
      
      // Paso 3: Generar imágenes para cada página
      const generateImagesResponse = await apiRequest('POST', '/api/books/generate-images', {
        bookContent
      });
      
      if (!generateImagesResponse.ok) {
        // Incluso si falla la generación de imágenes, continuamos
        // Simplemente tendremos el libro sin imágenes
        await apiRequest('PATCH', `/api/books/${book.id}/status`, { status: 'completed' });
        return book;
      }
      
      const contentWithImages = await generateImagesResponse.json();
      
      // Paso 4: Actualizar el libro con las imágenes
      const updateBookResponse = await apiRequest('PUT', `/api/books/${book.id}`, {
        content: contentWithImages,
        status: 'completed'
      });
      
      // Paso 5: Crear la vista previa del libro
      await apiRequest('POST', `/api/books/${book.id}/preview`, {});
      
      return book;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id, 'books'] });
      setBookId(data.id);
      setGenerationComplete(true);
    },
    onError: (error) => {
      setIsCreatingBook(false);
      toast({
        title: "Error al crear el libro",
        description: "Ha ocurrido un error al generar tu libro. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  });

  // Configuración del formulario de creación de libros
  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      characterIds: [],
      themeOption: "predeterminado",
      themeId: "",
      customTheme: {
        title: "",
        description: "",
        setting: "",
        additionalCharacters: "",
        plotType: "",
        includeMoralLesson: true,
        additionalNotes: ""
      }
    },
  });

  // Manejar el envío del formulario
  const onSubmit = (values: BookFormValues) => {
    setIsCreatingBook(true);
    
    // Verificar que tenemos al menos un personaje seleccionado
    if (!values.characterIds || values.characterIds.length === 0) {
      toast({
        title: "Error",
        description: "Debes seleccionar al menos un personaje para tu historia.",
        variant: "destructive",
      });
      setIsCreatingBook(false);
      return;
    }
    
    const mainCharacterId = parseInt(values.characterIds[0]);
    const additionalCharacterIds = values.characterIds.slice(1).map(id => parseInt(id));
    
    let themeData;
    if (values.themeOption === "predeterminado" && values.themeId) {
      themeData = parseInt(values.themeId);
    } else {
      // Si es un tema personalizado, enviar los datos del tema personalizado
      // Para esta demo, usaremos un tema predeterminado si no se seleccionó ninguno
      themeData = values.themeId ? parseInt(values.themeId) : 1;
    }
    
    generateBook.mutate({
      characterId: mainCharacterId,
      themeId: themeData,
      // En una implementación completa, enviaríamos también:
      // customTheme: values.customTheme,
      // additionalCharacters: additionalCharacterIds
    });
  };

  // Navegar al chat de perfil
  const goToProfileChat = (profileId: string) => {
    setLocation(`/profile-chat/${profileId}`);
  };

  // Navegar a la vista previa del libro
  const goToBookPreview = () => {
    if (bookId) {
      setLocation(`/book-preview/${bookId}`);
    }
  };

  // Volver al tablero principal
  const goToDashboard = () => {
    setLocation('/dashboard');
  };

  if (!user) {
    return null; // Redirigirá debido al useEffect
  }

  const isLoading = profilesLoading || themesLoading;
  const hasError = profilesError || themesError;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Crea un Libro Personalizado</h1>
          <p className="text-gray-600">Selecciona personajes y un tema para crear un libro de cuentos personalizado</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : hasError ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-red-500">Error al cargar los datos. Por favor intenta más tarde.</p>
              <Button onClick={goToDashboard} className="mt-4">Volver al Tablero</Button>
            </CardContent>
          </Card>
        ) : childProfiles.length === 0 ? (
          <Card>
            <CardContent className="pt-6 flex flex-col items-center text-center py-12">
              <div className="bg-primary-50 p-4 rounded-full mb-4">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Aún no tienes personajes</h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Antes de crear un libro, necesitas crear al menos un personaje para tu historia. Puedes crear personajes de diferentes tipos: niños, mascotas, juguetes u otros.
              </p>
              <Button onClick={goToDashboard}>
                Crear un Personaje Primero
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Seleccionar Personajes */}
              <Card>
                <CardHeader>
                  <CardTitle>Paso 1: Selecciona Personajes</CardTitle>
                  <CardDescription>
                    Elige hasta 5 personajes para tu historia
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="characterIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {childProfiles.map((character: any) => (
                              <div key={character.id} className="relative">
                                <Checkbox
                                  id={`character-${character.id}`}
                                  checked={field.value?.includes(character.id.toString())}
                                  onCheckedChange={(checked) => {
                                    const value = character.id.toString();
                                    return checked
                                      ? field.onChange([...(field.value || []), value].slice(0, 5))
                                      : field.onChange((field.value || []).filter((v: string) => v !== value));
                                  }}
                                  className="peer sr-only"
                                />
                                <label
                                  htmlFor={`character-${character.id}`}
                                  className="flex items-start p-4 border rounded-lg cursor-pointer hover:border-primary peer-checked:border-primary peer-checked:bg-primary-50"
                                >
                                  <div className="flex-1">
                                    <div className="font-medium">{character.name}</div>
                                    <div className="text-sm text-gray-500">
                                      {character.type === 'child' 
                                        ? `${character.age} años` 
                                        : character.type === 'pet' 
                                          ? 'Mascota' 
                                          : character.type === 'toy' 
                                            ? 'Juguete' 
                                            : 'Otro'}
                                    </div>
                                    {character.interests && character.interests.length > 0 && (
                                      <div className="mt-2 flex flex-wrap gap-1">
                                        {character.interests.slice(0, 3).map((interest: string, idx: number) => (
                                          <span key={idx} className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">
                                            {interest}
                                          </span>
                                        ))}
                                        {character.interests.length > 3 && (
                                          <span className="text-xs text-gray-500">+{character.interests.length - 3} más</span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div className="w-5 h-5 border rounded flex items-center justify-center peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary">
                                    {field.value?.includes(character.id.toString()) && <Check className="h-4 w-4" />}
                                  </div>
                                </label>
                                {(!character.interests || character.interests.length === 0) && (
                                  <div className="mt-1 ml-4">
                                    <Button
                                      type="button"
                                      variant="link"
                                      size="sm"
                                      className="text-primary p-0 h-auto"
                                      onClick={() => goToProfileChat(character.id.toString())}
                                    >
                                      Añadir más detalles mediante chat
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </FormControl>
                        <div className="mt-2 text-sm text-gray-500">
                          Seleccionados: {field.value?.length || 0}/5 personajes
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Seleccionar Tema del Libro */}
              <Card>
                <CardHeader>
                  <CardTitle>Paso 2: Elige un Tema para el Libro</CardTitle>
                  <CardDescription>
                    Selecciona un tema para tu libro de cuentos personalizado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="themeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                          >
                            {bookThemes.map((theme: any) => (
                              <div key={theme.id} className="relative">
                                <RadioGroupItem
                                  value={theme.id.toString()}
                                  id={`theme-${theme.id}`}
                                  className="peer sr-only"
                                />
                                <label
                                  htmlFor={`theme-${theme.id}`}
                                  className="flex flex-col h-full border rounded-lg overflow-hidden cursor-pointer hover:border-primary peer-checked:border-primary"
                                >
                                  <div className="h-32 bg-primary-50 flex items-center justify-center">
                                    {theme.coverImage ? (
                                      <img
                                        src={theme.coverImage}
                                        alt={theme.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <BookOpen className="h-12 w-12 text-primary/30" />
                                    )}
                                  </div>
                                  <div className="p-4 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <div className="font-medium">{theme.name}</div>
                                        <div className="text-xs text-gray-500">Edades {theme.ageRange}</div>
                                      </div>
                                      <Check className="invisible peer-checked:visible h-5 w-5 text-primary" />
                                    </div>
                                    <p className="mt-2 text-sm text-gray-600">{theme.description}</p>
                                  </div>
                                </label>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-6">
                  <Button type="button" variant="outline" onClick={goToDashboard}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={generateBook.isPending}>
                    {generateBook.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generando...
                      </>
                    ) : (
                      <>Crear Libro</>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        )}
      </div>

      {/* Diálogo de Creación de Libro */}
      <Dialog open={isCreatingBook} onOpenChange={(open) => {
        if (!open && generationComplete) {
          goToBookPreview();
        }
        setIsCreatingBook(open);
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {generationComplete ? "¡Libro Creado Exitosamente!" : "Creando Tu Libro"}
            </DialogTitle>
            <DialogDescription>
              {generationComplete 
                ? "Tu libro personalizado ha sido creado y está listo para visualizar." 
                : "Por favor espera mientras generamos tu libro personalizado..."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 flex flex-col items-center">
            {generationComplete ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-lg font-medium mb-2">Generación de Libro Completada</p>
                <p className="text-gray-600 mb-6">
                  Tu libro personalizado está listo para visualizar. Ahora puedes personalizarlo más o proceder al pago.
                </p>
                <Button onClick={goToBookPreview} className="mt-4">
                  Ver Libro <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
                <p className="text-lg font-medium mb-2">Generando Tu Libro</p>
                <p className="text-gray-600">
                  Estamos creando una historia personalizada basada en los perfiles de los personajes y el tema seleccionado. Esto puede tardar un minuto...
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            {generationComplete && (
              <Button variant="outline" onClick={goToDashboard}>
                Volver al Tablero
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
