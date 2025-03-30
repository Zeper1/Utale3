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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
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
  creationMethod: z.enum(["plantilla", "personalizado"]).default("personalizado"),
  templateId: z.string().optional(),
  storyDetails: z.object({
    title: z.string().optional(),
    scenario: z.string().optional(),
    era: z.string().optional(),
    adventureType: z.string().optional(),
    additionalCharacters: z.string().optional(),
    tone: z.array(z.string()).optional(),
    moralValue: z.string().optional(),
    fantasyLevel: z.number().default(5),
    pageCount: z.number().default(12),
    specialInstructions: z.string().optional(),
    storyStructure: z.string().optional(),
    genre: z.array(z.string()).optional(),
    artStyle: z.string().optional()
  }).optional(),
});

type BookFormValues = z.infer<typeof bookFormSchema>;

// Definir plantillas de historia
const storyTemplates = [
  {
    id: "1",
    name: "Aventura Espacial",
    description: "Una emocionante aventura en el espacio exterior con planetas, naves espaciales y descubrimientos",
    image: "/templates/space.jpg",
    details: {
      scenario: "Espacio exterior, planetas inexplorados",
      era: "Futuro",
      adventureType: "Exploración y descubrimiento",
      tone: ["Emocionante", "Educativo"],
      moralValue: "Curiosidad y valentía",
      fantasyLevel: 8,
      genre: ["Ciencia ficción", "Aventura"],
      artStyle: "Digital colorido con estrellas y galaxias",
    }
  },
  {
    id: "2",
    name: "Mundo Submarino",
    description: "Aventuras bajo el mar con criaturas marinas, tesoros ocultos y misterios oceánicos",
    image: "/templates/ocean.jpg",
    details: {
      scenario: "Océano, arrecifes de coral, ciudades submarinas",
      era: "Presente",
      adventureType: "Exploración y rescate",
      tone: ["Divertido", "Educativo"],
      moralValue: "Cuidado del medio ambiente",
      fantasyLevel: 7,
      genre: ["Aventura", "Ecológico"],
      artStyle: "Acuarela con tonos azules y turquesa",
    }
  },
  {
    id: "3",
    name: "Bosque Encantado",
    description: "Magia y misterio en un bosque lleno de criaturas fantásticas, hadas y secretos ancestrales",
    image: "/templates/forest.jpg",
    details: {
      scenario: "Bosque mágico con árboles milenarios",
      era: "Fantasía atemporal",
      adventureType: "Búsqueda y misterio",
      tone: ["Mágico", "Maravilloso"],
      moralValue: "Amistad y colaboración",
      fantasyLevel: 9,
      genre: ["Fantasía", "Mágico"],
      artStyle: "Ilustración con colores vibrantes y detalles mágicos",
    }
  },
  {
    id: "4",
    name: "Piratas y Tesoros",
    description: "Una aventura en alta mar con piratas, mapas del tesoro, islas misteriosas y desafíos emocionantes",
    image: "/templates/pirates.jpg",
    details: {
      scenario: "Mares desconocidos, islas tropicales",
      era: "Época dorada de la piratería",
      adventureType: "Búsqueda del tesoro",
      tone: ["Emocionante", "Divertido"],
      moralValue: "Trabajo en equipo",
      fantasyLevel: 6,
      genre: ["Aventura", "Histórico"],
      artStyle: "Ilustración estilo mapa antiguo con detalles náuticos",
    }
  },
  {
    id: "5",
    name: "Superhéroes",
    description: "Los personajes descubren sus superpoderes y aprenden a usarlos para ayudar a los demás",
    image: "/templates/superhero.jpg",
    details: {
      scenario: "Ciudad moderna con toques futuristas",
      era: "Presente",
      adventureType: "Descubrimiento de poderes y misión heroica",
      tone: ["Inspirador", "Emocionante"],
      moralValue: "Responsabilidad y ayudar a los demás",
      fantasyLevel: 8,
      genre: ["Superhéroes", "Acción"],
      artStyle: "Estilo cómic vibrante con efectos especiales",
    }
  },
  {
    id: "6",
    name: "Viaje al Pasado",
    description: "Una aventura en el tiempo donde los personajes visitan una época histórica fascinante",
    image: "/templates/time-travel.jpg",
    details: {
      scenario: "Diferentes épocas históricas",
      era: "Variable (viaje en el tiempo)",
      adventureType: "Viaje temporal y misión",
      tone: ["Educativo", "Emocionante"],
      moralValue: "Apreciar la historia y el conocimiento",
      fantasyLevel: 7,
      genre: ["Histórico", "Aventura"],
      artStyle: "Ilustraciones detalladas con precisión histórica",
    }
  },
];

// Géneros de historias
const storyGenres = [
  "Aventura", "Fantasía", "Educativo", "Misterio", "Ciencia ficción", 
  "Amistad", "Humor", "Naturaleza", "Superhéroes", "Vida cotidiana",
  "Histórico", "Mágico", "Deportes", "Viaje", "Musical"
];

// Tonos emocionales para la historia
const storyTones = [
  "Divertido", "Emocionante", "Educativo", "Inspirador", "Tranquilo", 
  "Misterioso", "Aventurero", "Mágico", "Reflexivo", "Humorístico"
];

// Valores y enseñanzas
const moralValues = [
  "Amistad", "Valentía", "Honestidad", "Respeto", "Perseverancia", 
  "Generosidad", "Responsabilidad", "Empatía", "Trabajo en equipo", 
  "Inclusión", "Creatividad", "Curiosidad", "Gratitud", "Paciencia"
];

// Estilos artísticos
const artStyles = [
  "Acuarela infantil", "Digital colorido", "Lápiz de colores", "Estilo manga/anime suave", 
  "Pintura pastel", "Collage colorido", "Ilustración clásica de cuentos", 
  "Minimalista y moderno", "Estilo libro pop-up", "Dibujos como hechos por niños"
];

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
    mutationFn: async (values: { 
      characterIds: number[], 
      storyDetails: any
    }) => {
      // Mostrar mensaje de generación en proceso
      toast({
        title: "Generando historia",
        description: "Estamos creando tu historia personalizada. Este proceso puede tomar unos minutos...",
      });
      
      // Paso 1: Generar el contenido del libro con OpenAI
      const generateContentResponse = await apiRequest('POST', '/api/books/generate-content', {
        characterIds: values.characterIds,
        storyDetails: values.storyDetails
      });
      
      if (!generateContentResponse.ok) {
        throw new Error('Error al generar el contenido del libro');
      }
      
      const bookContent = await generateContentResponse.json();
      
      // Paso 2: Crear la entrada inicial del libro en la base de datos
      const createBookResponse = await apiRequest('POST', '/api/books', {
        userId: user?.id,
        title: bookContent.title || values.storyDetails.title || "Historia personalizada",
        content: bookContent,
        format: 'digital',
        status: 'generating'
      });
      
      if (!createBookResponse.ok) {
        throw new Error('Error al crear el registro del libro');
      }
      
      const book = await createBookResponse.json();
      
      // Paso 2.5: Crear las relaciones libro-personajes
      for (const characterId of values.characterIds) {
        const role = characterId === values.characterIds[0] ? 'protagonist' : 'secondary';
        await apiRequest('POST', '/api/book-characters', {
          bookId: book.id,
          characterId,
          role
        });
      }
      
      // Paso 3: Generar imágenes para cada página
      const generateImagesResponse = await apiRequest('POST', '/api/books/generate-images', {
        bookContent,
        artStyle: values.storyDetails.artStyle
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
      toast({
        title: "¡Libro creado con éxito!",
        description: "Tu libro personalizado está listo para ser visualizado.",
      });
    },
    onError: (error) => {
      console.error("Error creating book:", error);
      setIsCreatingBook(false);
      toast({
        title: "Error al crear el libro",
        description: "Ha ocurrido un error al generar tu libro. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  });

  // Estado para el método de creación (plantilla o personalizado)
  const [activeTab, setActiveTab] = useState("personalizado");
  
  // Configuración del formulario de creación de libros
  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      characterIds: [],
      creationMethod: "personalizado",
      templateId: "",
      storyDetails: {
        title: "",
        scenario: "",
        era: "",
        adventureType: "",
        additionalCharacters: "",
        tone: [],
        moralValue: "",
        fantasyLevel: 5,
        pageCount: 12,
        specialInstructions: "",
        storyStructure: "",
        genre: [],
        artStyle: "Acuarela infantil",
      }
    },
  });

  // Efecto para actualizar el método de creación cuando cambia la pestaña
  useEffect(() => {
    form.setValue("creationMethod", activeTab as "plantilla" | "personalizado");
  }, [activeTab, form]);

  // Efecto para actualizar los detalles de la historia cuando se selecciona una plantilla
  useEffect(() => {
    const templateId = form.watch("templateId");
    if (templateId) {
      const template = storyTemplates.find(t => t.id === templateId);
      if (template) {
        // Asegurarnos de que storyDetails no sea undefined y tenga pageCount
        const currentDetails = form.getValues("storyDetails") || {
          fantasyLevel: 5,
          pageCount: 12
        };
        
        form.setValue("storyDetails", {
          ...currentDetails,
          scenario: template.details.scenario,
          era: template.details.era,
          adventureType: template.details.adventureType,
          tone: template.details.tone,
          moralValue: template.details.moralValue,
          fantasyLevel: template.details.fantasyLevel,
          genre: template.details.genre,
          artStyle: template.details.artStyle,
          pageCount: 12 // Valor por defecto
        });
      }
    }
  }, [form.watch("templateId"), form]);

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
    
    // Convertir los IDs de string a number
    const characterIds = values.characterIds.map(id => parseInt(id));
    
    // Determinar los detalles de la historia
    let storyDetails = values.storyDetails;
    
    // Si se está usando una plantilla, obtener los detalles de la plantilla
    if (values.creationMethod === "plantilla" && values.templateId) {
      const template = storyTemplates.find(t => t.id === values.templateId);
      if (template) {
        // Asegurarnos de tener los campos requeridos
        const baseDetails = storyDetails || {
          fantasyLevel: 5,
          pageCount: 12
        };
        
        storyDetails = {
          ...baseDetails,
          ...template.details,
          // Aseguramos que pageCount siempre tenga un valor
          pageCount: template.details.pageCount || 12,
          // Aseguramos que fantasyLevel siempre tenga un valor
          fantasyLevel: template.details.fantasyLevel || 5,
          // Para el título, usar el proporcionado o el nombre de la plantilla
          title: values.storyDetails?.title || template.name
        };
      }
    }
    
    // Asegurarnos que storyDetails nunca sea undefined
    if (!storyDetails) {
      storyDetails = {
        fantasyLevel: 5,
        pageCount: 12
      };
    }
    
    // Mostrar mensaje informativo sobre los personajes seleccionados
    const protagonistName = childProfiles.find((p: any) => p.id.toString() === values.characterIds[0])?.name;
    const numSecondaryCharacters = values.characterIds.length - 1;
    
    toast({
      title: "Creando historia personalizada",
      description: `Protagonista: ${protagonistName}${numSecondaryCharacters > 0 ? ` y ${numSecondaryCharacters} personaje${numSecondaryCharacters > 1 ? 's' : ''} secundario${numSecondaryCharacters > 1 ? 's' : ''}` : ''}`,
    });
    
    // Generar el libro con todos los personajes seleccionados
    generateBook.mutate({
      characterIds: characterIds,
      storyDetails: storyDetails
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

              {/* Definir Detalles de la Historia */}
              <Card>
                <CardHeader>
                  <CardTitle>Paso 2: Define tu Historia</CardTitle>
                  <CardDescription>
                    Elige cómo quieres crear tu historia
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab as any} className="w-full">
                      <TabsList className="w-full mb-4">
                        <TabsTrigger value="plantilla" className="flex-1">Usar Plantilla</TabsTrigger>
                        <TabsTrigger value="personalizado" className="flex-1">Personalizar Historia</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="plantilla">
                        <FormField
                          control={form.control}
                          name="templateId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Elige una plantilla</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  className="grid grid-cols-1 gap-4"
                                >
                                  {storyTemplates.map((template) => (
                                    <div key={template.id} className="relative">
                                      <RadioGroupItem
                                        value={template.id}
                                        id={`template-${template.id}`}
                                        className="peer sr-only"
                                      />
                                      <label
                                        htmlFor={`template-${template.id}`}
                                        className="flex p-4 border rounded-lg cursor-pointer hover:border-primary peer-checked:border-primary peer-checked:bg-primary-50"
                                      >
                                        <div className="flex-1">
                                          <div className="font-medium">{template.name}</div>
                                          <div className="text-sm text-gray-600 mt-1">{template.description}</div>
                                        </div>
                                        <Check className="invisible peer-checked:visible h-5 w-5 text-primary" />
                                      </label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormDescription>
                                Las plantillas son sólo puntos de partida. Puedes personalizarlas después.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                      
                      <TabsContent value="personalizado">
                        <div className="space-y-6">
                          <FormField
                            control={form.control}
                            name="storyDetails.title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Título de la historia</FormLabel>
                                <FormControl>
                                  <Input placeholder="Título de tu historia (opcional)" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Puede generarse automáticamente si lo dejas en blanco
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="storyDetails.scenario"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Escenario</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="¿Dónde sucede la historia? Ej: Bosque encantado, Nave espacial, Escuela..." 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="storyDetails.era"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Época</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Época actual, medieval, futurista..." 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="storyDetails.adventureType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tipo de aventura</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Rescate, búsqueda, exploración..." 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={form.control}
                            name="storyDetails.additionalCharacters"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Personajes adicionales</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Describe otros personajes que quieras incluir en la historia" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="storyDetails.tone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tono de la historia</FormLabel>
                                  <FormControl>
                                    <Select 
                                      value={field.value?.join(",")} 
                                      onValueChange={(value) => field.onChange(value ? value.split(",") : [])}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecciona uno o varios" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="divertido">Divertido</SelectItem>
                                        <SelectItem value="emocionante">Emocionante</SelectItem>
                                        <SelectItem value="educativo">Educativo</SelectItem>
                                        <SelectItem value="inspirador">Inspirador</SelectItem>
                                        <SelectItem value="misterioso">Misterioso</SelectItem>
                                        <SelectItem value="aventurero">Aventurero</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="storyDetails.moralValue"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Enseñanza o valor</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Amistad, perseverancia, respeto..." 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={form.control}
                            name="storyDetails.genre"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Género</FormLabel>
                                <FormControl>
                                  <Select 
                                    value={field.value?.join(",")} 
                                    onValueChange={(value) => field.onChange(value ? value.split(",") : [])}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecciona uno o varios" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="aventura">Aventura</SelectItem>
                                      <SelectItem value="fantasia">Fantasía</SelectItem>
                                      <SelectItem value="ciencia-ficcion">Ciencia Ficción</SelectItem>
                                      <SelectItem value="misterio">Misterio</SelectItem>
                                      <SelectItem value="educativo">Educativo</SelectItem>
                                      <SelectItem value="cotidiano">Vida cotidiana</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="storyDetails.fantasyLevel"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nivel de fantasía (1-10)</FormLabel>
                                  <FormControl>
                                    <Slider
                                      min={1}
                                      max={10}
                                      step={1}
                                      value={[field.value]}
                                      onValueChange={(values) => field.onChange(values[0])}
                                      className="py-4"
                                    />
                                  </FormControl>
                                  <div className="flex justify-between text-xs text-gray-500">
                                    <span>Realista</span>
                                    <span>Muy fantástico</span>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="storyDetails.pageCount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Número de páginas</FormLabel>
                                  <FormControl>
                                    <Select 
                                      value={field.value.toString()} 
                                      onValueChange={(value) => field.onChange(parseInt(value))}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecciona el número de páginas" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="10">10 páginas</SelectItem>
                                        <SelectItem value="12">12 páginas</SelectItem>
                                        <SelectItem value="15">15 páginas</SelectItem>
                                        <SelectItem value="20">20 páginas</SelectItem>
                                        <SelectItem value="25">25 páginas</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={form.control}
                            name="storyDetails.artStyle"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Estilo de ilustración</FormLabel>
                                <FormControl>
                                  <Select 
                                    value={field.value} 
                                    onValueChange={field.onChange}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecciona un estilo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Acuarela infantil">Acuarela infantil</SelectItem>
                                      <SelectItem value="Comic para niños">Comic para niños</SelectItem>
                                      <SelectItem value="Dibujos animados 3D">Dibujos animados 3D</SelectItem>
                                      <SelectItem value="Estilo Pixar">Estilo Pixar</SelectItem>
                                      <SelectItem value="Ilustración clásica">Ilustración clásica</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="storyDetails.specialInstructions"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Instrucciones especiales</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Cualquier detalle adicional que te gustaría incluir en la historia..." 
                                    {...field} 
                                    className="min-h-[100px]"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
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
                      <>Crear Historia</>
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
