import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { 
  Check, 
  ArrowRight, 
  Loader2, 
  Users, 
  BookText,
  Settings,
  Wand2
} from "lucide-react";

// Define el esquema de validación del formulario
const bookFormSchema = z.object({
  title: z.string().optional(),
  characterIds: z.array(z.string()),
  themeId: z.string(),
  scenario: z.string(),
  era: z.string(),
  adventureType: z.string(),
  tone: z.array(z.string()),
  moralValue: z.string(),
  fantasyLevel: z.number().min(1).max(10),
  genre: z.array(z.string()),
  artStyle: z.string(),
  pageCount: z.number().min(10).max(40),
  storyObjective: z.string().optional(),
  specialInstructions: z.string().optional(),
});

// Tipo inferido para usar en useForm
type BookFormValues = z.infer<typeof bookFormSchema>;

// Función auxiliar para obtener los detalles de la plantilla
function getTemplateDetails(templateId: string) {
  // Plantillas predefinidas
  const templates: Record<string, any> = {
    adventure: {
      scenario: "Un reino mágico",
      era: "Medieval fantástico",
      adventureType: "Búsqueda del tesoro",
      tone: ["Emocionante", "Optimista"],
      moralValue: "Valor y amistad",
      fantasyLevel: 8,
      genre: ["Fantasía", "Aventura"],
      artStyle: "acuarela",
    },
    science: {
      scenario: "Espacio exterior",
      era: "Futuro lejano",
      adventureType: "Exploración espacial",
      tone: ["Educativo", "Inspirador"],
      moralValue: "Curiosidad y conocimiento",
      fantasyLevel: 5,
      genre: ["Ciencia ficción", "Educativo"],
      artStyle: "digital",
    },
    nature: {
      scenario: "Bosque encantado",
      era: "Actual",
      adventureType: "Descubrimiento de la naturaleza",
      tone: ["Tranquilo", "Reflexivo"],
      moralValue: "Respeto por la naturaleza",
      fantasyLevel: 6,
      genre: ["Naturaleza", "Educativo"],
      artStyle: "naturalista",
    },
    family: {
      scenario: "Hogar familiar",
      era: "Actual",
      adventureType: "Aprendizaje de valores",
      tone: ["Emotivo", "Divertido"],
      moralValue: "Familia y cooperación",
      fantasyLevel: 4,
      genre: ["Cotidiano", "Familiar"],
      artStyle: "infantil",
    }
  };
  
  return templates[templateId] || templates.adventure;
}

// Componente de selección de personajes (Modal Paso 1)
interface CharacterSelectionModalProps {
  childProfiles: any[];
  preselectedCharacterId: string | null;
  setSelectedCharacterIds: (ids: string[]) => void;
  selectedCharacterIds: string[];
  onNext: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  characterDetails: {[key: string]: any};
  setCharacterDetails: (details: {[key: string]: any}) => void;
}

function CharacterSelectionModal({
  childProfiles,
  preselectedCharacterId,
  setSelectedCharacterIds,
  selectedCharacterIds,
  onNext,
  isOpen,
  onOpenChange,
  characterDetails,
  setCharacterDetails
}: CharacterSelectionModalProps) {
  // Lógica del componente de selección de personajes
  
  // Para simplificar el ejemplo, solo mostraremos un diálogo básico
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Selección de Personajes</DialogTitle>
          <DialogDescription>
            Elige hasta 5 personajes para tu historia
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {childProfiles.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No tienes personajes creados. Crea un personaje para comenzar.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-2">
              {childProfiles.map((profile) => (
                <div 
                  key={profile.id} 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedCharacterIds.includes(profile.id.toString()) 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => {
                    const isSelected = selectedCharacterIds.includes(profile.id.toString());
                    let newSelection = [...selectedCharacterIds];
                    
                    if (isSelected) {
                      // Remover de la selección
                      newSelection = newSelection.filter(id => id !== profile.id.toString());
                    } else {
                      // Añadir a la selección (máximo 5)
                      if (newSelection.length < 5) {
                        newSelection.push(profile.id.toString());
                      }
                    }
                    
                    setSelectedCharacterIds(newSelection);
                  }}
                >
                  <p className="font-medium">{profile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {profile.type}, {profile.age} años
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            onClick={onNext} 
            disabled={selectedCharacterIds.length === 0}
          >
            Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Componente de detalles de historia (Modal Paso 2)
interface StoryDetailsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onNext: () => void;
  onPrevious: () => void;
  selectedTemplate: string;
  setSelectedTemplate: (id: string) => void;
  form: any;
}

function StoryDetailsModal({
  isOpen,
  onOpenChange,
  onNext,
  onPrevious,
  selectedTemplate,
  setSelectedTemplate,
  form
}: StoryDetailsModalProps) {
  // Lógica del componente de detalles de historia
  
  // Para simplificar el ejemplo, solo mostraremos un diálogo básico
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detalles de la Historia</DialogTitle>
          <DialogDescription>
            Elige la plantilla y ajusta los detalles de la historia
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="grid grid-cols-2 gap-4 mb-6">
            {["adventure", "science", "nature", "family"].map((templateId) => {
              const templateName = {
                adventure: "Aventura",
                science: "Ciencia",
                nature: "Naturaleza",
                family: "Familia"
              }[templateId];
              
              return (
                <div 
                  key={templateId} 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedTemplate === templateId 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => {
                    setSelectedTemplate(templateId);
                    // Actualizar valores del formulario basados en la plantilla
                    const templateDetails = getTemplateDetails(templateId);
                    Object.entries(templateDetails).forEach(([key, value]) => {
                      form.setValue(key, value);
                    });
                  }}
                >
                  <p className="font-medium">{templateName}</p>
                  <p className="text-sm text-muted-foreground">
                    {templateId === "adventure" && "Búsqueda de tesoros y grandes aventuras"}
                    {templateId === "science" && "Exploración y descubrimientos científicos"}
                    {templateId === "nature" && "Conexión con la naturaleza y animales"}
                    {templateId === "family" && "Historias de valores familiares"}
                  </p>
                </div>
              );
            })}
          </div>
          
          <div className="space-y-2">
            <p className="font-medium">Objetivo de la historia (opcional):</p>
            <textarea 
              className="w-full p-2 border rounded-md" 
              rows={3}
              placeholder="Describe el objetivo principal de la historia..."
              value={form.watch("storyObjective") || ""}
              onChange={(e) => form.setValue("storyObjective", e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onPrevious}>
            Atrás
          </Button>
          <Button onClick={onNext}>
            Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Componente de configuración técnica (Modal Paso 3)
interface TechnicalSettingsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onPrevious: () => void;
  onComplete: () => void;
  form: any;
}

function TechnicalSettingsModal({
  isOpen,
  onOpenChange,
  onPrevious,
  onComplete,
  form
}: TechnicalSettingsModalProps) {
  // Lógica del componente de configuración técnica
  
  // Para simplificar el ejemplo, solo mostraremos un diálogo básico
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Configuración Técnica</DialogTitle>
          <DialogDescription>
            Ajusta los detalles técnicos de tu libro
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          <div>
            <p className="font-medium mb-2">Número de páginas:</p>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const current = form.getValues("pageCount");
                  if (current > 10) {
                    form.setValue("pageCount", current - 5);
                  }
                }}
              >
                -
              </Button>
              <span className="w-10 text-center">{form.watch("pageCount") || 20}</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const current = form.getValues("pageCount");
                  if (current < 40) {
                    form.setValue("pageCount", current + 5);
                  }
                }}
              >
                +
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Mínimo: 10 páginas - Máximo: 40 páginas
            </p>
          </div>
          
          <div>
            <p className="font-medium mb-2">Estilo de Arte:</p>
            <div className="grid grid-cols-3 gap-2">
              {["acuarela", "digital", "infantil", "comic", "realista"].map((style) => (
                <div 
                  key={style} 
                  className={`border rounded-lg p-2 cursor-pointer text-center text-sm ${
                    form.watch("artStyle") === style 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => form.setValue("artStyle", style)}
                >
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="font-medium">Instrucciones especiales (opcional):</p>
            <textarea 
              className="w-full p-2 border rounded-md" 
              rows={3}
              placeholder="¿Alguna indicación especial para la generación del libro?"
              value={form.watch("specialInstructions") || ""}
              onChange={(e) => form.setValue("specialInstructions", e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onPrevious}>
            Atrás
          </Button>
          <Button onClick={onComplete}>
            Generar Libro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Componente principal
export default function CreateBook() {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  
  // Estado para los componentes modales - El primero abierto por defecto
  const [characterSelectionOpen, setCharacterSelectionOpen] = useState(true);
  const [storyDetailsOpen, setStoryDetailsOpen] = useState(false);
  const [technicalSettingsOpen, setTechnicalSettingsOpen] = useState(false);
  const [generatingDialogOpen, setGeneratingDialogOpen] = useState(false);
  
  // Estado para la generación
  const [generationComplete, setGenerationComplete] = useState(false);
  const [generatedBookId, setGeneratedBookId] = useState<number | null>(null);
  
  // Estado para los personajes
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>([]);
  const [characterDetails, setCharacterDetails] = useState<{[key: string]: any}>({});
  
  // Estado para la plantilla
  const [selectedTemplate, setSelectedTemplate] = useState("adventure");
  
  // Determinar si hay un personaje preseleccionado (de la URL)
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedCharacterId = urlParams.get('character');
  
  // Formulario con validación
  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      title: "",
      characterIds: [],
      themeId: "1",
      scenario: "Un reino mágico",
      era: "Medieval fantástico",
      adventureType: "Búsqueda del tesoro",
      tone: ["Emocionante", "Optimista"],
      moralValue: "Valor y amistad",
      fantasyLevel: 8,
      genre: ["Fantasía", "Aventura"],
      artStyle: "acuarela",
      pageCount: 20,
      storyObjective: "",
      specialInstructions: ""
    },
  });
  
  // Cargar los perfiles de personajes
  const { data: childProfilesData = [], isLoading: isLoadingProfiles } = useQuery({
    queryKey: ['/api/characters'],
  });
  
  // Convertir a array tipado
  const childProfiles = childProfilesData as any[];
  
  // Preseleccionar un personaje si viene en la URL
  useEffect(() => {
    if (preselectedCharacterId && !selectedCharacterIds.includes(preselectedCharacterId)) {
      setSelectedCharacterIds(prevIds => [...prevIds, preselectedCharacterId]);
    }
  }, [preselectedCharacterId]);
  
  // Función para navegar entre pasos
  const goToStep = (step: number) => {
    setCharacterSelectionOpen(step === 1);
    setStoryDetailsOpen(step === 2);
    setTechnicalSettingsOpen(step === 3);
    
    // Actualizar los IDs de personajes en el formulario
    if (step === 1) {
      form.setValue('characterIds', selectedCharacterIds);
    }
  };
  
  // Iniciar la generación del libro
  const startBookGeneration = async () => {
    // Enviar el formulario completo
    await form.handleSubmit(onSubmit)();
  };
  
  // Navegar al visor de libros una vez generado
  const goToBookPreview = () => {
    if (generatedBookId) {
      setLocation(`/book-preview?id=${generatedBookId}`);
    }
  };
  
  // Volver al dashboard
  const goToDashboard = () => {
    setLocation('/dashboard');
  };
  
  // Si se cierra el primer modal, volver al dashboard
  const handleFirstModalClose = (open: boolean) => {
    setCharacterSelectionOpen(open);
    if (!open && selectedCharacterIds.length === 0) {
      setLocation('/dashboard');
    }
  };
  
  // Manejar envío del formulario
  const onSubmit = async (values: BookFormValues) => {
    try {
      // Asegurarse de que los characterIds estén actualizados
      values.characterIds = selectedCharacterIds;
      
      // Incluir detalles adicionales de los personajes
      const extendedCharacters = selectedCharacterIds.map(id => {
        const character = childProfiles.find((c: any) => c.id.toString() === id);
        return {
          ...character,
          details: characterDetails[id] || {}
        };
      });
      
      // Cerrar el modal de configuración técnica
      setTechnicalSettingsOpen(false);
      
      // Mostrar el modal de generación
      setGeneratingDialogOpen(true);
      setGenerationComplete(false);
      
      // Crear la solicitud para generar el libro
      const response = await apiRequest("POST", "/api/books", {
        ...values,
        extendedCharacters
      });
      
      if (!response.ok) {
        throw new Error("Error al crear el libro");
      }
      
      const book = await response.json();
      
      // Simular tiempo de generación (en producción, esto sería una solicitud real)
      setTimeout(() => {
        setGenerationComplete(true);
        setGeneratedBookId(book.id);
      }, 3000);
      
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al crear el libro. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
      
      // Cerrar el modal de generación
      setGeneratingDialogOpen(false);
    }
  };
  
  // Si hay carga de perfiles, mostrar un indicador
  if (isLoadingProfiles) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  
  return (
    <>
      {/* Modales del asistente */}
      <CharacterSelectionModal
        childProfiles={childProfiles}
        preselectedCharacterId={preselectedCharacterId}
        setSelectedCharacterIds={setSelectedCharacterIds}
        selectedCharacterIds={selectedCharacterIds}
        onNext={() => goToStep(2)}
        isOpen={characterSelectionOpen}
        onOpenChange={handleFirstModalClose}
        characterDetails={characterDetails}
        setCharacterDetails={setCharacterDetails}
      />
      
      <StoryDetailsModal
        isOpen={storyDetailsOpen}
        onOpenChange={setStoryDetailsOpen}
        onNext={() => goToStep(3)}
        onPrevious={() => goToStep(1)}
        selectedTemplate={selectedTemplate}
        setSelectedTemplate={setSelectedTemplate}
        form={form}
      />
      
      <TechnicalSettingsModal
        isOpen={technicalSettingsOpen}
        onOpenChange={setTechnicalSettingsOpen}
        onPrevious={() => goToStep(2)}
        onComplete={startBookGeneration}
        form={form}
      />

      {/* Modal para la generación de libros */}
      <Dialog open={generatingDialogOpen} onOpenChange={(open) => {
        // Solo permitir cerrar si la generación ha terminado
        if (generationComplete) {
          setGeneratingDialogOpen(open);
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Generando Libro Personalizado</DialogTitle>
            <DialogDescription>
              Estamos creando una historia única basada en los personajes y configuración seleccionada.
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
                  Tu libro personalizado está listo para visualizar.
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
                  Estamos creando una historia personalizada basada en tus personajes y configuración. Esto puede tardar un minuto...
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
      
      {/* No se necesita contenido principal en la página */}
      <div className="hidden">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="hidden">
            <Button type="submit">Enviar</Button>
          </form>
        </Form>
      </div>
    </>
  );
}