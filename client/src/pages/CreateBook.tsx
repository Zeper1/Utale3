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
  Users,
  Minus,
  Plus,
  Crown,
  GraduationCap,
  Clock,
  MapPin,
  Mountain,
  Ship,
  PlaneTakeoff,
  Castle
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
    storyObjective: z.string().optional(),
    tone: z.array(z.string()).optional(),
    moralValue: z.string().optional(),
    fantasyLevel: z.number().optional().default(5),
    pageCount: z.number().optional().default(12),
    specialInstructions: z.string().optional(),
    storyStructure: z.string().optional(),
    genre: z.array(z.string()).optional(),
    artStyle: z.string().optional(),
    educationalFocus: z.string().optional(),
    // Campos para opciones personalizadas
    customEra: z.string().optional(),
    customAdventureType: z.string().optional(),
    customTone: z.string().optional(),
    customMoralValue: z.string().optional(),
    customGenre: z.string().optional(),
    customArtStyle: z.string().optional(),
    customEducationalFocus: z.string().optional()
  }).optional(),
});

type BookFormValues = z.infer<typeof bookFormSchema>;

// Definir tipo para los detalles de las plantillas
interface TemplateDetails {
  scenario: string;
  era: string;
  adventureType: string;
  tone: string[];
  moralValue: string;
  fantasyLevel: number;
  genre: string[];
  artStyle: string;
  pageCount?: number;
  storyObjective?: string;
  specialInstructions?: string;
}

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
      pageCount: 12,
      storyObjective: "Explorar nuevos planetas y aprender sobre astronomía",
      specialInstructions: "Incluir planetas con formas divertidas y naves espaciales coloridas"
    } as TemplateDetails
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
      pageCount: 15,
      storyObjective: "Descubrir la belleza del océano y aprender a proteger la vida marina",
      specialInstructions: "Incluir escenas con vida marina colorida y una ciudad de coral"
    } as TemplateDetails
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
      pageCount: 12,
      storyObjective: "Descubrir la magia de la naturaleza y la importancia de cuidar el bosque",
      specialInstructions: "Incluir elementos mágicos como luces brillantes y polvo de hadas"
    } as TemplateDetails
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
      pageCount: 15,
      storyObjective: "Embarcarse en una gran aventura marina y aprender sobre el valor de la amistad",
      specialInstructions: "Incluir un mapa del tesoro y elementos náuticos coloridos"
    } as TemplateDetails
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
      pageCount: 15,
      storyObjective: "Descubrir superpoderes especiales y aprender a usarlos para el bien común",
      specialInstructions: "Incluir escenas de acción coloridas y efectos de poderes especiales"
    } as TemplateDetails
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
      pageCount: 20,
      additionalCharacters: "Un guía del tiempo, personajes históricos famosos",
      specialInstructions: "Incluir datos históricos interesantes adaptados para niños"
    } as TemplateDetails
  },
];

// Géneros de historias
const storyGenres = [
  "Aventura", "Fantasía", "Educativo", "Misterio", "Ciencia ficción", 
  "Amistad", "Humor", "Naturaleza", "Superhéroes", "Vida cotidiana",
  "Histórico", "Mágico", "Deportes", "Viaje", "Musical", "Otro"
];

// Tonos emocionales para la historia
const storyTones = [
  "Divertido", "Emocionante", "Educativo", "Inspirador", "Tranquilo", 
  "Misterioso", "Aventurero", "Mágico", "Reflexivo", "Humorístico", "Otro"
];

// Valores y enseñanzas (simplificado)
const moralValues = [
  "Amistad", "Valentía", "Honestidad", "Respeto", "Perseverancia", 
  "Responsabilidad", "Empatía", "Trabajo en equipo", "Otro"
];

// Épocas históricas o temporales (simplificado)
const eras = [
  "Presente", "Futuro", "Pasado", "Prehistoria", 
  "Medieval", "Renacimiento", "Fantasía atemporal", "Otro"
];

// Tipos de aventuras (simplificado)
const adventureTypes = [
  "Exploración", "Rescate", "Búsqueda del tesoro", "Resolución de misterio",
  "Superación de desafíos", "Aventura en la naturaleza", "Viaje fantástico", 
  "Aventura educativa", "Otro"
];

// Áreas educativas específicas
const educationalAreas = [
  "Matemáticas básicas", "Suma y resta", "Multiplicación y división", 
  "Fracciones", "Geometría", "Ciencias naturales", "El cuerpo humano",
  "Los animales", "Las plantas", "El sistema solar", "El clima y estaciones",
  "Historia", "Geografía", "Idiomas extranjeros", "Vocabulario", 
  "Gramática", "Educación emocional", "Habilidades sociales", "Arte y música",
  "Otro"
];

// Estilos artísticos
const artStyles = [
  "Acuarela infantil", "Digital colorido", "Lápiz de colores", "Estilo manga/anime suave", 
  "Pintura pastel", "Collage colorido", "Ilustración clásica de cuentos", 
  "Minimalista y moderno", "Estilo libro pop-up", "Dibujos como hechos por niños",
  "Otro"
];

export default function CreateBook() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreatingBook, setIsCreatingBook] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [bookId, setBookId] = useState<number | null>(null);
  
  // Verificar si hay un characterId en la URL (llega desde la ficha de personaje)
  const params = new URLSearchParams(location.split('?')[1]);
  const preselectedCharacterId = params.get('characterId');

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
  
  // Estados para opciones "Otro" en los selects
  const [customEra, setCustomEra] = useState("");
  const [customAdventureType, setCustomAdventureType] = useState("");
  const [customMoralValue, setCustomMoralValue] = useState("");
  const [customTone, setCustomTone] = useState("");
  const [customGenre, setCustomGenre] = useState("");
  const [customArtStyle, setCustomArtStyle] = useState("");
  
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
        storyObjective: "",
        tone: [],
        moralValue: "",
        fantasyLevel: 5,
        pageCount: 12,
        specialInstructions: "",
        storyStructure: "",
        genre: [],
        artStyle: "Acuarela infantil",
        educationalFocus: "ninguno",
        // Valores para campos personalizados
        customEra: "",
        customAdventureType: "",
        customTone: "",
        customMoralValue: "",
        customGenre: "",
        customArtStyle: "",
        customEducationalFocus: ""
      }
    },
  });

  // Efecto para actualizar el método de creación cuando cambia la pestaña
  useEffect(() => {
    form.setValue("creationMethod", activeTab as "plantilla" | "personalizado");
  }, [activeTab, form]);

  // Efecto para preseleccionar el personaje cuando se llega desde una ficha
  useEffect(() => {
    if (preselectedCharacterId && childProfiles.length > 0) {
      // Buscar el personaje en la lista de perfiles
      const characterExists = childProfiles.some((character: any) => 
        character.id.toString() === preselectedCharacterId
      );
      
      // Si el personaje existe, preseleccionarlo
      if (characterExists) {
        form.setValue("characterIds", [preselectedCharacterId]);
      }
    }
  }, [preselectedCharacterId, childProfiles, form]);
  
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
        
        // Preparamos datos completos para asegurarnos de que se incluyen todos los campos necesarios
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
          // Aseguramos que pageCount siempre tenga un valor correcto
          pageCount: template.details.pageCount || currentDetails.pageCount || 12,
          // Aseguramos que se incluyen campos adicionales si existen en la plantilla
          storyObjective: template.details.storyObjective || currentDetails.storyObjective || "",
          specialInstructions: template.details.specialInstructions || currentDetails.specialInstructions || ""
        });
        
        // Cambiamos a la pestaña de personalización para mostrar los detalles aplicados
        setActiveTab("personalizado");
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
              {/* Seleccionar Personajes - Nuevo diseño */}
              <Card className="border-2 border-primary/20 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                  <CardTitle className="flex items-center text-2xl font-bold text-primary-700">
                    <Users className="mr-2 h-6 w-6 text-primary" />
                    Paso 1: Elige los protagonistas
                  </CardTitle>
                  <CardDescription className="text-base">
                    Selecciona hasta 5 personajes que aparecerán en tu historia
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <FormField
                    control={form.control}
                    name="characterIds"
                    render={({ field }) => (
                      <FormItem>
                        <div className="bg-primary/5 py-3 px-4 rounded-md mb-6 flex items-center">
                          <div className="mr-3 p-2 bg-primary text-white rounded-full">
                            <Star className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-primary-700">El primer personaje que selecciones será el protagonista principal</p>
                            <p className="text-sm text-gray-600">Los demás serán personajes secundarios en la historia</p>
                          </div>
                        </div>
                        
                        <FormLabel className="text-lg font-bold text-primary-700 mb-3 block">
                          Tus personajes ({field.value?.length || 0}/5 seleccionados)
                        </FormLabel>
                        
                        <FormControl>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {childProfiles.map((character: any, index: number) => {
                              const isSelected = field.value?.includes(character.id.toString());
                              const isMainCharacter = isSelected && field.value?.[0] === character.id.toString();
                              
                              return (
                                <div key={character.id} className="relative">
                                  <input 
                                    type="checkbox"
                                    id={`character-${character.id}`}
                                    checked={isSelected}
                                    onChange={(e) => {
                                      const value = character.id.toString();
                                      const isChecked = e.target.checked;
                                      
                                      if (isChecked) {
                                        // Añadir personaje (máximo 5)
                                        if ((field.value || []).length < 5) {
                                          field.onChange([...(field.value || []), value]);
                                        } else {
                                          toast({
                                            title: "Máximo alcanzado",
                                            description: "Solo puedes seleccionar hasta 5 personajes para una historia",
                                            variant: "default",
                                          });
                                        }
                                      } else {
                                        // Quitar personaje
                                        field.onChange((field.value || []).filter((v: string) => v !== value));
                                      }
                                    }}
                                    className="sr-only peer"
                                  />
                                  <label 
                                    htmlFor={`character-${character.id}`}
                                    className={`block cursor-pointer transition-all duration-200 border-2 rounded-xl overflow-hidden ${
                                      isSelected 
                                        ? "border-primary shadow-md transform scale-[1.02]" 
                                        : "border-primary/10 hover:border-primary/30"
                                    }`}
                                  >
                                    {/* Imagen o avatar */}
                                    <div className={`h-32 flex items-center justify-center ${
                                      isSelected 
                                        ? "bg-gradient-to-r from-primary/20 to-primary/10" 
                                        : "bg-gradient-to-r from-gray-100 to-gray-50"
                                    }`}>
                                      {character.avatarUrl ? (
                                        <img 
                                          src={character.avatarUrl} 
                                          alt={character.name} 
                                          className="h-24 w-24 object-cover rounded-full border-4 border-white"
                                        />
                                      ) : (
                                        <div className={`h-24 w-24 rounded-full border-4 border-white flex items-center justify-center bg-primary/10 ${
                                          isSelected ? "bg-primary/20" : ""
                                        }`}>
                                          <UserCircle className={`h-16 w-16 ${isSelected ? "text-primary" : "text-gray-400"}`} />
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Info del personaje */}
                                    <div className="p-3 text-center">
                                      <h3 className="font-bold text-base truncate">{character.name}</h3>
                                      <p className="text-xs text-gray-500">
                                        {character.type === 'child' 
                                          ? `${character.age} años` 
                                          : character.type === 'pet' 
                                            ? 'Mascota' 
                                            : character.type === 'toy' 
                                              ? 'Juguete' 
                                              : 'Otro'}
                                      </p>
                                      
                                      {/* Intereses (como tags) */}
                                      {character.interests && character.interests.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1 justify-center">
                                          {character.interests.slice(0, 2).map((interest: string, idx: number) => (
                                            <span key={idx} className={`px-2 py-0.5 rounded-full text-xs ${
                                              isSelected ? "bg-primary/10 text-primary-700" : "bg-gray-100 text-gray-600"
                                            }`}>
                                              {interest}
                                            </span>
                                          ))}
                                          {character.interests.length > 2 && (
                                            <span className="text-xs text-gray-500">+{character.interests.length - 2}</span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Botón para añadir detalles */}
                                    {(!character.interests || character.interests.length === 0) && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs w-full rounded-none border-t text-primary"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          goToProfileChat(character.id.toString());
                                        }}
                                      >
                                        <PlusCircle className="h-3 w-3 mr-1" />
                                        Añadir detalles
                                      </Button>
                                    )}
                                  </label>
                                  
                                  {/* Indicador de protagonista */}
                                  {isMainCharacter && (
                                    <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full p-1 shadow-md z-10">
                                      <Star className="h-4 w-4 fill-current" />
                                    </div>
                                  )}
                                  
                                  {/* Indicador de orden */}
                                  {isSelected && !isMainCharacter && (
                                    <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-md z-10">
                                      {field.value?.indexOf(character.id.toString()) + 1}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </FormControl>
                        
                        {/* Contador y mensaje */}
                        <div className="flex justify-between mt-4">
                          <div className="text-sm text-gray-600">
                            {field.value?.length === 0 ? (
                              <span className="text-amber-600 font-medium">Selecciona al menos 1 personaje</span>
                            ) : field.value?.length === 5 ? (
                              <span className="text-green-600 font-medium">Máximo de personajes seleccionado</span>
                            ) : (
                              <span>Puedes añadir {5 - (field.value?.length || 0)} más</span>
                            )}
                          </div>
                          
                          <div className="flex items-center">
                            <div className="flex -space-x-3 mr-2">
                              {field.value?.slice(0, 3).map((id, idx) => {
                                const char = childProfiles.find((c: any) => c.id.toString() === id);
                                return (
                                  <div 
                                    key={id} 
                                    className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-primary/20"
                                    title={char?.name}
                                  >
                                    {char?.avatarUrl ? (
                                      <img src={char.avatarUrl} alt={char.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <UserCircle className="w-full h-full text-primary/50" />
                                    )}
                                  </div>
                                );
                              })}
                              {field.value && field.value.length > 3 && (
                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                                  +{field.value.length - 3}
                                </div>
                              )}
                            </div>
                            <span className="text-sm font-medium">
                              {field.value?.length || 0}/5
                            </span>
                          </div>
                        </div>
                        
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Definir Detalles de la Historia - Nuevo diseño */}
              <Card className="border-2 border-primary/20 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                  <CardTitle className="flex items-center text-2xl font-bold text-primary-700">
                    <Wand2 className="mr-2 h-6 w-6 text-primary" />
                    Paso 2: ¡Diseña tu Aventura!
                  </CardTitle>
                  <CardDescription className="text-base">
                    Escoge cómo quieres crear la historia para tus personajes
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-6">
                  <div className="space-y-8">
                    {/* Modo de creación: Selección visual y atractiva */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button 
                        type="button"
                        variant={activeTab === "plantilla" ? "default" : "outline"}
                        className={`h-auto py-6 flex flex-col items-center justify-center gap-3 transition-all ${
                          activeTab === "plantilla" 
                            ? "border-2 border-primary shadow-md" 
                            : "hover:bg-primary/5"
                        }`}
                        onClick={() => setActiveTab("plantilla")}
                      >
                        <Sparkles className={`h-10 w-10 ${activeTab === "plantilla" ? "text-primary-foreground" : "text-primary"}`} />
                        <div className="text-center">
                          <h3 className="font-bold text-lg">Usar Plantilla Mágica</h3>
                          <p className={`text-sm ${activeTab === "plantilla" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                            Elige una aventura ya preparada y personalízala
                          </p>
                        </div>
                      </Button>
                      
                      <Button 
                        type="button"
                        variant={activeTab === "personalizado" ? "default" : "outline"}
                        className={`h-auto py-6 flex flex-col items-center justify-center gap-3 transition-all ${
                          activeTab === "personalizado" 
                            ? "border-2 border-primary shadow-md" 
                            : "hover:bg-primary/5"
                        }`}
                        onClick={() => setActiveTab("personalizado")}
                      >
                        <PencilLine className={`h-10 w-10 ${activeTab === "personalizado" ? "text-primary-foreground" : "text-primary"}`} />
                        <div className="text-center">
                          <h3 className="font-bold text-lg">Crear desde Cero</h3>
                          <p className={`text-sm ${activeTab === "personalizado" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                            Diseña tu propia historia con total libertad
                          </p>
                        </div>
                      </Button>
                    </div>
                    
                    <div className="relative py-2">
                      {activeTab === "plantilla" && (
                        <div className="absolute -top-4 right-0 bg-primary text-white text-xs font-bold px-2 py-1 rounded">
                          ¡Recomendado para empezar!
                        </div>
                      )}
                      <div className="border-t border-b py-3 px-4 bg-primary/5 rounded-md">
                        <h4 className="font-medium flex items-center">
                          <Lightbulb className="h-5 w-5 text-yellow-500 mr-2" />
                          {activeTab === "plantilla" 
                            ? "Las plantillas incluyen escenarios, personajes y estructura ya definidos. ¡Perfectas para empezar rápido!"
                            : "Crea una historia totalmente personalizada con tus propias ideas. ¡Deja volar tu imaginación!"
                          }
                        </h4>
                      </div>
                    </div>
                    
                    {/* Contenido basado en la selección */}
                    {activeTab === "plantilla" ? (
                      <div className="space-y-6 animate-in fade-in-50">
                        <FormField
                          control={form.control}
                          name="templateId"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="text-lg font-bold text-primary-700">
                                Elige una aventura
                              </FormLabel>
                              <FormControl>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                  {storyTemplates.map((template) => (
                                    <div 
                                      key={template.id} 
                                      className={`relative rounded-xl border-2 transition-all overflow-hidden hover:shadow-md ${
                                        field.value === template.id 
                                          ? "border-primary shadow-md" 
                                          : "border-border hover:border-primary/50"
                                      }`}
                                    >
                                      <input 
                                        type="radio"
                                        id={`template-${template.id}`}
                                        name="templateId"
                                        value={template.id}
                                        checked={field.value === template.id}
                                        onChange={() => field.onChange(template.id)}
                                        className="peer sr-only"
                                      />
                                      <label
                                        htmlFor={`template-${template.id}`}
                                        className="cursor-pointer block"
                                      >
                                        {/* Header image/icon representation */}
                                        <div className="h-40 bg-gradient-to-br from-primary/30 to-primary/10 flex flex-col items-center justify-center p-4">
                                          <div className="text-center">
                                            {template.id === "1" && <div className="w-24 h-24 bg-indigo-100 rounded-full mb-2 mx-auto flex items-center justify-center"><Sparkles className="h-10 w-10 text-indigo-500" /></div>}
                                            {template.id === "2" && <div className="w-24 h-24 bg-blue-100 rounded-full mb-2 mx-auto flex items-center justify-center"><div className="text-3xl">🌊</div></div>}
                                            {template.id === "3" && <div className="w-24 h-24 bg-green-100 rounded-full mb-2 mx-auto flex items-center justify-center"><div className="text-3xl">🌳</div></div>}
                                            {template.id === "4" && <div className="w-24 h-24 bg-amber-100 rounded-full mb-2 mx-auto flex items-center justify-center"><div className="text-3xl">🏴‍☠️</div></div>}
                                            {template.id === "5" && <div className="w-24 h-24 bg-red-100 rounded-full mb-2 mx-auto flex items-center justify-center"><div className="text-3xl">🦸</div></div>}
                                            {template.id === "6" && <div className="w-24 h-24 bg-purple-100 rounded-full mb-2 mx-auto flex items-center justify-center"><div className="text-3xl">⏰</div></div>}
                                          </div>
                                        </div>
                                        
                                        {/* Template info */}
                                        <div className="p-4">
                                          <div className="font-bold text-lg mb-1">{template.name}</div>
                                          <p className="text-sm text-gray-600">{template.description}</p>
                                          
                                          {/* Template tags */}
                                          <div className="flex flex-wrap gap-1 mt-3">
                                            {template.details.genre.map((g: string, i: number) => (
                                              <span key={i} className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                                                {g}
                                              </span>
                                            ))}
                                            {template.details.tone.slice(0, 1).map((t: string, i: number) => (
                                              <span key={i} className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs">
                                                {t}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                        
                                        {/* Selected indicator */}
                                        {field.value === template.id && (
                                          <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                                            <Check className="h-4 w-4" />
                                          </div>
                                        )}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {/* Vista previa si hay selección */}
                        {form.watch("templateId") && (
                          <div className="mt-8 p-4 bg-primary/5 rounded-xl border border-primary/20">
                            <h3 className="text-lg font-bold text-primary-700 mb-3 flex items-center">
                              <BookOpen className="mr-2 h-5 w-5" />
                              Vista previa de tu aventura
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium text-sm text-gray-500 mb-1">Escenario</h4>
                                <p className="text-sm">{storyTemplates.find(t => t.id === form.watch("templateId"))?.details.scenario}</p>
                              </div>
                              <div>
                                <h4 className="font-medium text-sm text-gray-500 mb-1">Época</h4>
                                <p className="text-sm">{storyTemplates.find(t => t.id === form.watch("templateId"))?.details.era}</p>
                              </div>
                              <div>
                                <h4 className="font-medium text-sm text-gray-500 mb-1">Tipo de aventura</h4>
                                <p className="text-sm">{storyTemplates.find(t => t.id === form.watch("templateId"))?.details.adventureType}</p>
                              </div>
                              <div>
                                <h4 className="font-medium text-sm text-gray-500 mb-1">Enseñanza</h4>
                                <p className="text-sm">{storyTemplates.find(t => t.id === form.watch("templateId"))?.details.moralValue}</p>
                              </div>
                            </div>
                            
                            <div className="mt-4 text-center">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setActiveTab("personalizado")}
                                className="text-xs"
                              >
                                <PencilLine className="h-3 w-3 mr-1" /> 
                                Personalizar más detalles
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-6 animate-in fade-in-50">
                        <div className="bg-gradient-to-r from-primary/20 to-transparent p-4 rounded-lg mb-6">
                          <h3 className="font-bold text-lg mb-2 text-primary-700">Personaliza tu historia</h3>
                          <p className="text-sm">Dinos cómo quieres que sea tu aventura y crearemos algo único para tus personajes</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                          <div className="col-span-2">
                            <FormField
                              control={form.control}
                              name="storyDetails.title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="font-medium flex items-center">
                                    <BookOpen className="h-4 w-4 mr-2 text-primary" />
                                    Título de la historia
                                  </FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Título de tu historia (opcional)" 
                                      {...field}
                                      className="border-primary/20 focus:border-primary"
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Puede generarse automáticamente si lo dejas en blanco
                                  </FormDescription>
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="col-span-2">
                            <FormField
                              control={form.control}
                              name="storyDetails.scenario"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="font-medium flex items-center">
                                    <div className="mr-2 text-lg">🏝️</div>
                                    Escenario
                                  </FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="¿Dónde sucede la historia? Ej: Bosque encantado, Nave espacial, Escuela..." 
                                      {...field}
                                      className="min-h-[80px] border-primary/20 focus:border-primary"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={form.control}
                            name="storyDetails.era"
                            render={({ field }) => {
                              const [showOtherEra, setShowOtherEra] = useState(field.value === "Otro");
                              const [otherEraValue, setOtherEraValue] = useState("");
                              
                              useEffect(() => {
                                if (field.value && field.value !== "Otro" && !eras.includes(field.value)) {
                                  setOtherEraValue(field.value);
                                  setShowOtherEra(true);
                                }
                              }, [field.value]);
                              
                              return (
                                <FormItem>
                                  <FormLabel className="font-medium flex items-center">
                                    <div className="mr-2 text-lg">⏳</div>
                                    Época
                                  </FormLabel>
                                  <FormControl>
                                    <Select
                                      value={showOtherEra ? "Otro" : field.value}
                                      onValueChange={(value) => {
                                        if (value === "Otro") {
                                          setShowOtherEra(true);
                                          field.onChange("Otro");
                                        } else {
                                          setShowOtherEra(false);
                                          field.onChange(value);
                                        }
                                      }}
                                    >
                                      <SelectTrigger className="border-primary/20 focus:border-primary">
                                        <SelectValue placeholder="Selecciona una época" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {eras.map((era) => (
                                          <SelectItem key={era} value={era}>
                                            {era}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  
                                  {showOtherEra && (
                                    <Input
                                      placeholder="Especifica una época personalizada..."
                                      value={otherEraValue}
                                      onChange={(e) => {
                                        setOtherEraValue(e.target.value);
                                        field.onChange(e.target.value || "Otro");
                                      }}
                                      className="mt-2 border-primary/20 focus:border-primary"
                                    />
                                  )}
                                </FormItem>
                              );
                            }}
                          />
                          
                          <FormField
                            control={form.control}
                            name="storyDetails.adventureType"
                            render={({ field }) => {
                              const [showOtherAdventure, setShowOtherAdventure] = useState(field.value === "Otro");
                              const [otherAdventureValue, setOtherAdventureValue] = useState("");
                              
                              useEffect(() => {
                                if (field.value && field.value !== "Otro" && !adventureTypes.includes(field.value)) {
                                  setOtherAdventureValue(field.value);
                                  setShowOtherAdventure(true);
                                }
                              }, [field.value]);
                              
                              return (
                                <FormItem>
                                  <FormLabel className="font-medium flex items-center">
                                    <div className="mr-2 text-lg">🧩</div>
                                    Tipo de aventura
                                  </FormLabel>
                                  <FormControl>
                                    <Select
                                      value={showOtherAdventure ? "Otro" : field.value}
                                      onValueChange={(value) => {
                                        if (value === "Otro") {
                                          setShowOtherAdventure(true);
                                          field.onChange("Otro");
                                        } else {
                                          setShowOtherAdventure(false);
                                          field.onChange(value);
                                        }
                                      }}
                                    >
                                      <SelectTrigger className="border-primary/20 focus:border-primary">
                                        <SelectValue placeholder="Selecciona un tipo de aventura" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {adventureTypes.map((type) => (
                                          <SelectItem key={type} value={type}>
                                            {type}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  
                                  {showOtherAdventure && (
                                    <Input
                                      placeholder="Especifica un tipo de aventura personalizado..."
                                      value={otherAdventureValue}
                                      onChange={(e) => {
                                        setOtherAdventureValue(e.target.value);
                                        field.onChange(e.target.value || "Otro");
                                      }}
                                      className="mt-2 border-primary/20 focus:border-primary"
                                    />
                                  )}
                                </FormItem>
                              );
                            }}
                          />
                          
                          <div className="col-span-2">
                            <FormField
                              control={form.control}
                              name="storyDetails.storyObjective"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="font-medium flex items-center">
                                    <Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />
                                    Objetivo de la historia
                                  </FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="¿Qué quieres conseguir con esta historia? (ej: enseñar valores, entretener, explicar un concepto...)" 
                                      {...field}
                                      className="min-h-[80px] border-primary/20 focus:border-primary"
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Describe brevemente tu objetivo para esta historia y cómo quieres que impacte a los lectores.
                                  </FormDescription>
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={form.control}
                            name="storyDetails.tone"
                            render={({ field }) => {
                              const [showCustomTone, setShowCustomTone] = useState(false);
                              const [customToneContent, setCustomToneContent] = useState("");
                              
                              useEffect(() => {
                                // Comprobar si "otro" está en los valores seleccionados
                                if (field.value && field.value.includes("otro")) {
                                  setShowCustomTone(true);
                                } else {
                                  setShowCustomTone(false);
                                }
                              }, [field.value]);
                              
                              return (
                                <FormItem>
                                  <FormLabel className="font-medium flex items-center">
                                    <div className="mr-2 text-lg">😊</div>
                                    Tono de la historia
                                  </FormLabel>
                                  <FormControl>
                                    <Select 
                                      value={field.value?.join(",")} 
                                      onValueChange={(value) => field.onChange(value ? value.split(",") : [])}
                                    >
                                      <SelectTrigger className="border-primary/20 focus:border-primary">
                                        <SelectValue placeholder="Selecciona uno o varios" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="divertido">Divertido</SelectItem>
                                        <SelectItem value="emocionante">Emocionante</SelectItem>
                                        <SelectItem value="educativo">Educativo</SelectItem>
                                        <SelectItem value="inspirador">Inspirador</SelectItem>
                                        <SelectItem value="misterioso">Misterioso</SelectItem>
                                        <SelectItem value="aventurero">Aventurero</SelectItem>
                                        <SelectItem value="otro">Otro</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  
                                  {showCustomTone && (
                                    <Input
                                      placeholder="Especifica un tono personalizado..."
                                      value={customToneContent}
                                      onChange={(e) => {
                                        const newValue = e.target.value;
                                        setCustomToneContent(newValue);
                                        form.setValue("storyDetails.customTone", newValue);
                                      }}
                                      className="mt-2 border-primary/20 focus:border-primary"
                                    />
                                  )}
                                </FormItem>
                              );
                            }}
                          />
                          
                          <FormField
                            control={form.control}
                            name="storyDetails.moralValue"
                            render={({ field }) => {
                              const [showOtherValue, setShowOtherValue] = useState(field.value === "Otro");
                              const [otherValueContent, setOtherValueContent] = useState("");
                              
                              useEffect(() => {
                                if (field.value && field.value !== "Otro" && !moralValues.includes(field.value)) {
                                  setOtherValueContent(field.value);
                                  setShowOtherValue(true);
                                }
                              }, [field.value]);
                              
                              return (
                                <FormItem>
                                  <FormLabel className="font-medium flex items-center">
                                    <Heart className="h-4 w-4 mr-2 text-red-500" />
                                    Enseñanza o valor
                                  </FormLabel>
                                  <FormControl>
                                    <Select
                                      value={showOtherValue ? "Otro" : field.value}
                                      onValueChange={(value) => {
                                        if (value === "Otro") {
                                          setShowOtherValue(true);
                                          field.onChange("Otro");
                                        } else {
                                          setShowOtherValue(false);
                                          field.onChange(value);
                                        }
                                      }}
                                    >
                                      <SelectTrigger className="border-primary/20 focus:border-primary">
                                        <SelectValue placeholder="Selecciona un valor o enseñanza" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {moralValues.map((value) => (
                                          <SelectItem key={value} value={value}>
                                            {value}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  
                                  {showOtherValue && (
                                    <Input
                                      placeholder="Especifica un valor o enseñanza personalizada..."
                                      value={otherValueContent}
                                      onChange={(e) => {
                                        setOtherValueContent(e.target.value);
                                        field.onChange(e.target.value || "Otro");
                                      }}
                                      className="mt-2 border-primary/20 focus:border-primary"
                                    />
                                  )}
                                </FormItem>
                              );
                            }}
                          />
                          
                          <FormField
                            control={form.control}
                            name="storyDetails.genre"
                            render={({ field }) => {
                              const [showCustomGenre, setShowCustomGenre] = useState(false);
                              const [customGenreContent, setCustomGenreContent] = useState("");
                              
                              useEffect(() => {
                                // Comprobar si "otro" está en los valores seleccionados
                                if (field.value && field.value.includes("otro")) {
                                  setShowCustomGenre(true);
                                } else {
                                  setShowCustomGenre(false);
                                }
                              }, [field.value]);
                              
                              return (
                                <FormItem>
                                  <FormLabel className="font-medium flex items-center">
                                    <BookOpen className="h-4 w-4 mr-2 text-primary" />
                                    Género
                                  </FormLabel>
                                  <FormControl>
                                    <Select 
                                      value={field.value?.join(",")} 
                                      onValueChange={(value) => field.onChange(value ? value.split(",") : [])}
                                    >
                                      <SelectTrigger className="border-primary/20 focus:border-primary">
                                        <SelectValue placeholder="Selecciona uno o varios" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="aventura">Aventura</SelectItem>
                                        <SelectItem value="fantasia">Fantasía</SelectItem>
                                        <SelectItem value="ciencia-ficcion">Ciencia Ficción</SelectItem>
                                        <SelectItem value="misterio">Misterio</SelectItem>
                                        <SelectItem value="educativo">Educativo</SelectItem>
                                        <SelectItem value="cotidiano">Vida cotidiana</SelectItem>
                                        <SelectItem value="otro">Otro</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  
                                  {showCustomGenre && (
                                    <Input
                                      placeholder="Especifica un género personalizado..."
                                      value={customGenreContent}
                                      onChange={(e) => {
                                        const newValue = e.target.value;
                                        setCustomGenreContent(newValue);
                                        form.setValue("storyDetails.customGenre", newValue);
                                      }}
                                      className="mt-2 border-primary/20 focus:border-primary"
                                    />
                                  )}
                                </FormItem>
                              );
                            }}
                          />
                          
                          <FormField
                            control={form.control}
                            name="storyDetails.artStyle"
                            render={({ field }) => {
                              const [showCustomArtStyle, setShowCustomArtStyle] = useState(false);
                              const [customArtStyleContent, setCustomArtStyleContent] = useState("");
                              
                              useEffect(() => {
                                // Comprobar si se ha seleccionado "Otro"
                                if (field.value === "Otro") {
                                  setShowCustomArtStyle(true);
                                } else {
                                  setShowCustomArtStyle(false);
                                }
                              }, [field.value]);
                              
                              return (
                                <FormItem>
                                  <FormLabel className="font-medium flex items-center">
                                    <Palette className="h-4 w-4 mr-2 text-primary" />
                                    Estilo de ilustración
                                  </FormLabel>
                                  <FormControl>
                                    <Select 
                                      value={field.value} 
                                      onValueChange={(value) => {
                                        field.onChange(value);
                                      }}
                                    >
                                      <SelectTrigger className="border-primary/20 focus:border-primary">
                                        <SelectValue placeholder="Selecciona un estilo" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Acuarela infantil">Acuarela infantil</SelectItem>
                                        <SelectItem value="Comic para niños">Comic para niños</SelectItem>
                                        <SelectItem value="Dibujos animados 3D">Dibujos animados 3D</SelectItem>
                                        <SelectItem value="Estilo Pixar">Estilo Pixar</SelectItem>
                                        <SelectItem value="Ilustración clásica">Ilustración clásica</SelectItem>
                                        <SelectItem value="Otro">Otro</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  
                                  {showCustomArtStyle && (
                                    <Input
                                      placeholder="Especifica un estilo de ilustración personalizado..."
                                      value={customArtStyleContent}
                                      onChange={(e) => {
                                        const newValue = e.target.value;
                                        setCustomArtStyleContent(newValue);
                                        form.setValue("storyDetails.customArtStyle", newValue);
                                      }}
                                      className="mt-2 border-primary/20 focus:border-primary"
                                    />
                                  )}
                                </FormItem>
                              );
                            }}
                          />
                          
                          <div className="flex items-center space-x-4">
                            <FormField
                              control={form.control}
                              name="storyDetails.pageCount"
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormLabel className="font-medium flex items-center">
                                    <div className="mr-2 text-lg">📄</div>
                                    Número de páginas
                                  </FormLabel>
                                  <div className="flex flex-row items-center gap-2">
                                    <Button 
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="h-8 w-8 p-0 rounded-full"
                                      onClick={() => {
                                        const newValue = Math.max(5, (field.value || 10) - 1);
                                        field.onChange(newValue);
                                      }}
                                      disabled={(field.value || 10) <= 5}
                                    >
                                      <Minus className="h-4 w-4" />
                                    </Button>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        className="h-9 w-20 border-primary/20 focus:border-primary text-center"
                                        min={5}
                                        max={40}
                                        value={field.value === undefined ? "" : field.value}
                                        onChange={(e) => {
                                          const inputValue = e.target.value;
                                          
                                          // Si está vacío, permitir mantener el campo vacío para ingresar nuevo valor
                                          if (inputValue === "") {
                                            field.onChange(undefined);
                                            return;
                                          }
                                          
                                          // Intentar convertir a número
                                          const val = parseInt(inputValue);
                                          
                                          // Si es un número válido
                                          if (!isNaN(val)) {
                                            if (val < 5) {
                                              // No mostrar error aún, permitir que termine de escribir
                                              field.onChange(val);
                                            } else if (val > 40) {
                                              // No mostrar error aún, permitir que termine de escribir
                                              field.onChange(val);
                                            } else {
                                              // Valor válido
                                              field.onChange(val);
                                            }
                                          }
                                        }}
                                        onBlur={(e) => {
                                          // Al perder el foco, validar y corregir el valor si es necesario
                                          const val = parseInt(e.target.value);
                                          
                                          if (isNaN(val) || field.value === undefined) {
                                            // Si no es un número válido, asignar un valor por defecto
                                            field.onChange(10);
                                          } else if (val < 5) {
                                            // Si es menor que el mínimo
                                            field.onChange(5);
                                          } else if (val > 40) {
                                            // Si es mayor que el máximo
                                            field.onChange(40);
                                          }
                                        }}
                                      />
                                    </FormControl>
                                    <Button 
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="h-8 w-8 p-0 rounded-full"
                                      onClick={() => {
                                        const newValue = Math.min(40, (field.value || 10) + 1);
                                        field.onChange(newValue);
                                      }}
                                      disabled={(field.value || 10) >= 40}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    (Mínimo 5, máximo 40 páginas)
                                  </div>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="storyDetails.fantasyLevel"
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormLabel className="font-medium flex items-center">
                                    <Sparkles className="h-4 w-4 mr-2 text-primary" />
                                    Nivel de fantasía
                                  </FormLabel>
                                  <div className="flex items-center space-x-2">
                                    <FormControl>
                                      <Slider
                                        min={1}
                                        max={10}
                                        step={1}
                                        value={[field.value]}
                                        onValueChange={(values) => field.onChange(values[0])}
                                        className="py-2"
                                      />
                                    </FormControl>
                                    <span className="text-sm font-bold bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center">
                                      {field.value}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-xs text-gray-500">
                                    <span>Realista</span>
                                    <span>Mágico</span>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="col-span-2">
                            <FormField
                              control={form.control}
                              name="storyDetails.educationalFocus"
                              render={({ field }) => {
                                const [showCustomEducation, setShowCustomEducation] = useState(false);
                                const [customEducationContent, setCustomEducationContent] = useState("");
                                
                                useEffect(() => {
                                  // Comprobar si se ha seleccionado "otros"
                                  if (field.value === "otros") {
                                    setShowCustomEducation(true);
                                  } else {
                                    setShowCustomEducation(false);
                                  }
                                }, [field.value]);
                                
                                return (
                                  <FormItem>
                                    <FormLabel className="font-medium flex items-center">
                                      <GraduationCap className="h-4 w-4 mr-2 text-blue-500" />
                                      Enfoque educativo (opcional)
                                    </FormLabel>
                                    <FormControl>
                                      <Select 
                                        value={field.value} 
                                        onValueChange={field.onChange}
                                      >
                                        <SelectTrigger className="border-primary/20 focus:border-primary">
                                          <SelectValue placeholder="¿Quieres incluir algún elemento educativo?" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="ninguno">Ninguno</SelectItem>
                                          <SelectItem value="matematicas">Matemáticas básicas</SelectItem>
                                          <SelectItem value="ciencias">Ciencias y naturaleza</SelectItem>
                                          <SelectItem value="lenguaje">Lenguaje y vocabulario</SelectItem>
                                          <SelectItem value="historia">Historia</SelectItem>
                                          <SelectItem value="geografia">Geografía</SelectItem>
                                          <SelectItem value="tecnologia">Tecnología</SelectItem>
                                          <SelectItem value="musica">Música</SelectItem>
                                          <SelectItem value="arte">Arte</SelectItem>
                                          <SelectItem value="ecosistema">Medio ambiente</SelectItem>
                                          <SelectItem value="otros">Otros (especificar)</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </FormControl>
                                    
                                    {showCustomEducation && (
                                      <Input
                                        placeholder="Especifica un enfoque educativo personalizado..."
                                        value={customEducationContent}
                                        onChange={(e) => {
                                          const newValue = e.target.value;
                                          setCustomEducationContent(newValue);
                                          form.setValue("storyDetails.customEducationalFocus", newValue);
                                        }}
                                        className="mt-2 border-primary/20 focus:border-primary"
                                      />
                                    )}
                                    
                                    <FormDescription>
                                      Selecciona si quieres que la historia incluya algún elemento educativo específico.
                                    </FormDescription>
                                  </FormItem>
                                );
                              }}
                            />
                          </div>
                          
                          <div className="col-span-2">
                            <FormField
                              control={form.control}
                              name="storyDetails.specialInstructions"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="font-medium flex items-center">
                                    <Lightbulb className="h-4 w-4 mr-2 text-amber-500" />
                                    Instrucciones especiales
                                  </FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="¿Tienes alguna idea especial que quieras incluir? Dinos todo lo que se te ocurra..." 
                                      {...field}
                                      className="min-h-[100px] border-primary/20 focus:border-primary"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between border-t pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={goToDashboard}
                    className="border-primary/20 hover:border-primary/50"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={generateBook.isPending}
                    className="text-base px-8 py-2 h-auto bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                  >
                    {generateBook.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creando tu historia...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        ¡Crear Historia!
                      </>
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
