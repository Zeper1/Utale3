import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
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
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Users, 
  BookText, 
  Settings, 
  Wand2, 
  Star, 
  UserCircle, 
  PlusCircle,
  Save,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2
} from "lucide-react";

// Define el esquema de validación para el formulario
const bookFormSchema = z.object({
  title: z.string().optional(),
  characterIds: z.array(z.string()).min(1, "Debes seleccionar al menos un personaje"),
  themeId: z.string().optional(),
  scenario: z.string().min(3, "El escenario es demasiado corto"),
  era: z.string().optional(),
  adventureType: z.string().optional(),
  tone: z.array(z.string()).optional(),
  moralValue: z.string().optional(),
  fantasyLevel: z.number().min(1).max(10).default(5),
  genre: z.array(z.string()).optional(),
  artStyle: z.string().optional(),
  pageCount: z.number().int().min(10).max(40).default(20),
  storyObjective: z.string().optional(),
  specialInstructions: z.string().optional(),
});

type BookFormValues = z.infer<typeof bookFormSchema>;

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

// Interfaces para los componentes de Modal
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
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  // Encontrar el personaje seleccionado para mostrar los detalles
  const selectedCharacter = selectedCharacterId 
    ? childProfiles.find(char => char.id.toString() === selectedCharacterId) 
    : null;

  // Seleccionar personaje preseleccionado si existe
  useEffect(() => {
    if (preselectedCharacterId && !selectedCharacterIds.includes(preselectedCharacterId)) {
      setSelectedCharacterIds([preselectedCharacterId]);
    }
  }, [preselectedCharacterId, selectedCharacterIds, setSelectedCharacterIds]);

  // Función para abrir el modal de detalles
  const openCharacterDetailsModal = (characterId: string) => {
    setSelectedCharacterId(characterId);
    
    // Inicializar detalles del personaje si no existen
    if (!characterDetails[characterId]) {
      setCharacterDetails({
        ...characterDetails,
        [characterId]: {
          role: "protagonist", // por defecto
          additionalTraits: "",
          specialAbilities: "",
          storySpecificDetails: ""
        }
      });
    }
    
    setIsDetailsModalOpen(true);
  };

  // Guardar detalles del personaje
  const saveCharacterDetails = (characterId: string, details: any) => {
    setCharacterDetails({
      ...characterDetails,
      [characterId]: details
    });
    setIsDetailsModalOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Selecciona tus personajes</DialogTitle>
          <DialogDescription>
            Elige hasta 5 personajes para incluir en tu historia. El primero será el protagonista principal.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-6">
          {childProfiles.map((character) => {
            const isSelected = selectedCharacterIds.includes(character.id.toString());
            const isMainCharacter = isSelected && selectedCharacterIds[0] === character.id.toString();
            
            return (
              <Card 
                key={character.id} 
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isSelected ? 'border-2 border-primary' : 'border border-gray-200'
                }`}
                onClick={() => {
                  const characterId = character.id.toString();
                  let newSelection;
                  
                  if (isSelected) {
                    // Quitar de la selección
                    newSelection = selectedCharacterIds.filter(id => id !== characterId);
                  } else {
                    // Añadir a la selección (máximo 5)
                    if (selectedCharacterIds.length < 5) {
                      newSelection = [...selectedCharacterIds, characterId];
                    } else {
                      // Mostrar mensaje de error
                      return;
                    }
                  }
                  
                  setSelectedCharacterIds(newSelection);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {character.avatarUrl ? (
                        <img 
                          src={character.avatarUrl} 
                          alt={character.name} 
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                          <UserCircle className="h-10 w-10 text-primary/60" />
                        </div>
                      )}
                      
                      {isMainCharacter && (
                        <div className="absolute -top-1 -right-1 bg-primary text-white rounded-full p-0.5">
                          <Star className="h-3 w-3 fill-current" />
                        </div>
                      )}
                      
                      {isSelected && !isMainCharacter && (
                        <div className="absolute -top-1 -right-1 bg-primary text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">
                          {selectedCharacterIds.indexOf(character.id.toString()) + 1}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-medium">{character.name}</h3>
                      <p className="text-xs text-gray-500">
                        {character.type === 'child' 
                          ? `${character.age} años` 
                          : character.type}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-3 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      openCharacterDetailsModal(character.id.toString());
                    }}
                  >
                    <PlusCircle className="h-3 w-3 mr-1" />
                    Añadir detalles
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <DialogFooter className="flex justify-between">
          <div className="text-sm text-gray-600">
            {selectedCharacterIds.length === 0 ? (
              <span className="text-amber-600">Selecciona al menos 1 personaje</span>
            ) : selectedCharacterIds.length === 5 ? (
              <span className="text-green-600">Máximo de personajes seleccionado</span>
            ) : (
              <span>Personajes: {selectedCharacterIds.length}/5</span>
            )}
          </div>
          
          <Button 
            onClick={onNext}
            disabled={selectedCharacterIds.length === 0}
          >
            Siguiente
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
      
      {/* Modal para detalles específicos del personaje */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalles para {selectedCharacter?.name}</DialogTitle>
            <DialogDescription>
              Añade detalles específicos para este personaje en la historia
            </DialogDescription>
          </DialogHeader>
          
          {selectedCharacter && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-primary/5 rounded-lg">
                {selectedCharacter.avatarUrl ? (
                  <img 
                    src={selectedCharacter.avatarUrl} 
                    alt={selectedCharacter.name} 
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <UserCircle className="h-10 w-10 text-primary/60" />
                  </div>
                )}
                
                <div>
                  <h3 className="text-lg font-medium">{selectedCharacter.name}</h3>
                  <p className="text-sm text-gray-500">
                    {selectedCharacter.type === 'child' 
                      ? `${selectedCharacter.age} años` 
                      : selectedCharacter.type}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Rol en la historia</label>
                  <Select 
                    value={characterDetails[selectedCharacter.id]?.role || "protagonist"} 
                    onValueChange={(value) => setCharacterDetails({
                      ...characterDetails,
                      [selectedCharacter.id]: {
                        ...characterDetails[selectedCharacter.id],
                        role: value
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="protagonist">Protagonista</SelectItem>
                      <SelectItem value="sidekick">Ayudante</SelectItem>
                      <SelectItem value="mentor">Mentor</SelectItem>
                      <SelectItem value="antagonist">Antagonista</SelectItem>
                      <SelectItem value="supporting">Personaje secundario</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Rasgos adicionales</label>
                  <Textarea 
                    placeholder="Describe rasgos de personalidad adicionales para este personaje..."
                    value={characterDetails[selectedCharacter.id]?.additionalTraits || ""}
                    onChange={(e) => setCharacterDetails({
                      ...characterDetails,
                      [selectedCharacter.id]: {
                        ...characterDetails[selectedCharacter.id],
                        additionalTraits: e.target.value
                      }
                    })}
                  />
                  <p className="text-xs text-gray-500 mt-1">Estos se añadirán a los rasgos ya existentes del personaje</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Habilidades especiales</label>
                  <Textarea 
                    placeholder="¿Tiene este personaje alguna habilidad especial en la historia?"
                    value={characterDetails[selectedCharacter.id]?.specialAbilities || ""}
                    onChange={(e) => setCharacterDetails({
                      ...characterDetails,
                      [selectedCharacter.id]: {
                        ...characterDetails[selectedCharacter.id],
                        specialAbilities: e.target.value
                      }
                    })}
                  />
                  <p className="text-xs text-gray-500 mt-1">Habilidades o poderes que tendrá solo en esta historia</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Detalles específicos para esta historia</label>
                  <Textarea 
                    placeholder="Describe cualquier otro detalle que desees incluir sobre cómo debe aparecer este personaje en esta historia específica..."
                    className="min-h-[100px]"
                    value={characterDetails[selectedCharacter.id]?.storySpecificDetails || ""}
                    onChange={(e) => setCharacterDetails({
                      ...characterDetails,
                      [selectedCharacter.id]: {
                        ...characterDetails[selectedCharacter.id],
                        storySpecificDetails: e.target.value
                      }
                    })}
                  />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDetailsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={() => saveCharacterDetails(
                selectedCharacter.id.toString(), 
                characterDetails[selectedCharacter.id]
              )}
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar detalles
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

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
  // Plantillas predefinidas
  const templates = [
    {
      id: "adventure",
      title: "Aventura Fantástica",
      description: "Una emocionante aventura en un mundo de fantasía con desafíos y misterios.",
      details: {
        scenario: "Un reino mágico",
        era: "Medieval fantástico",
        adventureType: "Búsqueda del tesoro",
        tone: ["Emocionante", "Optimista"],
        moralValue: "Valor y amistad",
        fantasyLevel: 8,
        genre: ["Fantasía", "Aventura"],
        artStyle: "Acuarela colorida"
      }
    },
    {
      id: "scifi",
      title: "Aventura Espacial",
      description: "Una misión por el espacio exterior con planetas desconocidos y tecnología avanzada.",
      details: {
        scenario: "Nave espacial y planetas desconocidos",
        era: "Futuro lejano",
        adventureType: "Exploración espacial",
        tone: ["Intrigante", "Asombroso"],
        moralValue: "Curiosidad y cooperación",
        fantasyLevel: 6,
        genre: ["Ciencia Ficción", "Aventura"],
        artStyle: "Digital futurista"
      }
    },
    {
      id: "underwater",
      title: "Aventura Submarina",
      description: "Un viaje por los océanos descubriendo criaturas marinas y lugares secretos.",
      details: {
        scenario: "Fondo del océano",
        era: "Contemporáneo",
        adventureType: "Exploración submarina",
        tone: ["Misterioso", "Educativo"],
        moralValue: "Cuidado del medio ambiente",
        fantasyLevel: 5,
        genre: ["Aventura", "Educativo"],
        artStyle: "Acuarela marina"
      }
    },
    {
      id: "custom",
      title: "Personalizada",
      description: "Crea una historia completamente personalizada con tus propios detalles.",
      details: {
        scenario: "",
        era: "",
        adventureType: "",
        tone: [],
        moralValue: "",
        fantasyLevel: 5,
        genre: [],
        artStyle: ""
      }
    }
  ];

  // Obtener detalles de la plantilla seleccionada
  const selectedTemplateDetails = templates.find(t => t.id === selectedTemplate)?.details || templates[0].details;
  
  // Efecto para actualizar el formulario cuando se selecciona una plantilla
  useEffect(() => {
    if (selectedTemplate !== "custom") {
      // Actualizar los campos del formulario con los valores de la plantilla
      const details = templates.find(t => t.id === selectedTemplate)?.details;
      if (details) {
        Object.entries(details).forEach(([key, value]) => {
          form.setValue(key as keyof BookFormValues, value);
        });
      }
    }
  }, [selectedTemplate, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Detalles de la Historia</DialogTitle>
          <DialogDescription>
            Selecciona una plantilla o personaliza los detalles de tu historia
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="templates" className="mt-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="templates">Plantillas</TabsTrigger>
            <TabsTrigger value="custom">Personalizado</TabsTrigger>
          </TabsList>
          
          <TabsContent value="templates" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <Card 
                  key={template.id} 
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedTemplate === template.id 
                      ? 'border-2 border-primary ring-2 ring-primary/20' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{template.title}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  
                  {template.id !== "custom" && (
                    <CardContent className="text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                          <span className="font-medium">Escenario:</span>
                          <span className="text-gray-600">{template.details.scenario}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">Época:</span>
                          <span className="text-gray-600">{template.details.era}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">Valor moral:</span>
                          <span className="text-gray-600">{template.details.moralValue}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">Nivel fantasía:</span>
                          <span className="text-gray-600">{template.details.fantasyLevel}/10</span>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
            
            {selectedTemplate !== "custom" && (
              <div className="bg-primary/5 p-4 rounded-lg mt-6">
                <h3 className="font-medium mb-2">Resumen de la plantilla seleccionada</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm"><span className="font-medium">Escenario:</span> {selectedTemplateDetails.scenario}</p>
                    <p className="text-sm"><span className="font-medium">Época:</span> {selectedTemplateDetails.era}</p>
                    <p className="text-sm"><span className="font-medium">Tipo de aventura:</span> {selectedTemplateDetails.adventureType}</p>
                    <p className="text-sm">
                      <span className="font-medium">Tono:</span> {selectedTemplateDetails.tone.join(", ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm"><span className="font-medium">Valor moral:</span> {selectedTemplateDetails.moralValue}</p>
                    <p className="text-sm"><span className="font-medium">Nivel de fantasía:</span> {selectedTemplateDetails.fantasyLevel}/10</p>
                    <p className="text-sm">
                      <span className="font-medium">Géneros:</span> {selectedTemplateDetails.genre.join(", ")}
                    </p>
                    <p className="text-sm"><span className="font-medium">Estilo artístico:</span> {selectedTemplateDetails.artStyle}</p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="custom" className="space-y-6 mt-4">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="scenario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Escenario</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Describe el lugar donde ocurrirá la historia" 
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="era"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Época</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Medieval, actual, futurista, etc." 
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="adventureType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de aventura</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Búsqueda, misterio, viaje, etc." 
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="moralValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor moral o lección</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="¿Qué lección enseñará la historia?" 
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fantasyLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nivel de fantasía</FormLabel>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Realista</span>
                        <span className="text-sm text-gray-500">Muy fantástico</span>
                      </div>
                      <FormControl>
                        <Slider
                          min={1}
                          max={10}
                          step={1}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                      </FormControl>
                      <div className="text-center">
                        <span className="text-sm font-medium">{field.value}/10</span>
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="artStyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estilo artístico</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un estilo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="acuarela">Acuarela colorida</SelectItem>
                          <SelectItem value="cartoon">Caricatura infantil</SelectItem>
                          <SelectItem value="3d">3D estilizado</SelectItem>
                          <SelectItem value="pixelart">Pixel Art</SelectItem>
                          <SelectItem value="realista">Ilustración realista</SelectItem>
                          <SelectItem value="japonés">Estilo manga/anime</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="storyObjective"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Objetivo de la historia</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="¿Qué quiere conseguir el protagonista?" 
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="specialInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instrucciones especiales</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Instrucciones adicionales para la generación de la historia..." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex justify-between mt-6">
          <Button 
            variant="outline" 
            onClick={onPrevious}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>
          
          <Button onClick={onNext}>
            Siguiente
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
  // Opciones de estilo de fuente con ejemplos
  const fontStyles = [
    { id: "casual", name: "Casual", sample: "ABCabc123", description: "Estilo relajado y amigable" },
    { id: "elegant", name: "Elegante", sample: "ABCabc123", description: "Estilo refinado y sofisticado" },
    { id: "handwritten", name: "Manuscrita", sample: "ABCabc123", description: "Parece escrito a mano" },
    { id: "playful", name: "Juguetona", sample: "ABCabc123", description: "Divertida y para los más pequeños" },
  ];
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Configuración Técnica</DialogTitle>
          <DialogDescription>
            Ajusta los aspectos técnicos de tu libro
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 my-4">
          <FormField
            control={form.control}
            name="pageCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de páginas</FormLabel>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">10 páginas</span>
                    <span className="text-sm text-gray-500">40 páginas</span>
                  </div>
                  <FormControl>
                    <Slider
                      min={10}
                      max={40}
                      step={1}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                    />
                  </FormControl>
                  <div className="text-center">
                    <span className="text-sm font-medium">{field.value} páginas</span>
                  </div>
                </div>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título del libro (opcional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Deja en blanco para que la IA genere un título" 
                    {...field} 
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <Separator className="my-6" />
          
          <div>
            <h3 className="text-lg font-medium mb-4">Estilo de fuente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fontStyles.map((style) => (
                <Card 
                  key={style.id} 
                  className={`cursor-pointer transition-all duration-200 ${
                    form.watch("fontStyle") === style.id 
                      ? 'border-2 border-primary ring-2 ring-primary/20' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => form.setValue("fontStyle", style.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center p-3">
                      <div className={`text-2xl mb-2 font-${style.id}`}>
                        {style.sample}
                      </div>
                      <h4 className="font-medium">{style.name}</h4>
                      <p className="text-xs text-gray-600 text-center mt-1">{style.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div>
            <h3 className="text-lg font-medium mb-4">Resumen y Confirmación</h3>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Personajes seleccionados:</h4>
                    <p className="text-sm text-gray-600">{form.watch("characterIds")?.length || 0} personajes</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Detalles de historia:</h4>
                    <p className="text-sm text-gray-600">Escenario: {form.watch("scenario") || "(No especificado)"}</p>
                    <p className="text-sm text-gray-600">Valor moral: {form.watch("moralValue") || "(No especificado)"}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Configuración técnica:</h4>
                    <p className="text-sm text-gray-600">{form.watch("pageCount") || 20} páginas</p>
                    <p className="text-sm text-gray-600">Estilo artístico: {form.watch("artStyle") || "(Por defecto)"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between mt-6">
          <Button 
            variant="outline" 
            onClick={onPrevious}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>
          
          <Button 
            onClick={onComplete}
          >
            <Wand2 className="mr-2 h-4 w-4" />
            Generar Libro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function CreateBook() {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  
  // Estado para los componentes modales
  const [characterSelectionOpen, setCharacterSelectionOpen] = useState(false);
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
  const urlParams = new URLSearchParams(location.search || '');
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
  
  // Navegar entre los pasos del asistente
  const goToStep = (step: number) => {
    setCharacterSelectionOpen(step === 1);
    setStoryDetailsOpen(step === 2);
    setTechnicalSettingsOpen(step === 3);
    
    // Actualizar los IDs de personajes en el formulario
    if (step === 1) {
      form.setValue('characterIds', selectedCharacterIds);
    }
  };
  
  // Comenzar el proceso de creación
  const startCreation = () => {
    goToStep(1);
  };
  
  // Iniciar la generación del libro
  const startBookGeneration = async () => {
    // Enviar el formulario completo
    await form.handleSubmit(onSubmit)();
  };
  
  // Navegar al visor de libros una vez generado
  const goToBookPreview = () => {
    if (generatedBookId) {
      setLocation(`/book-preview/${generatedBookId}`);
    }
  };
  
  // Volver al dashboard
  const goToDashboard = () => {
    setLocation('/dashboard');
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
  
  return (
    <div className="container max-w-5xl py-10">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">Crear Libro Personalizado</h1>
          <p className="text-gray-500 mt-2">
            Elige personajes y configura los detalles para crear una historia única
          </p>
        </div>
        
        {isLoadingProfiles ? (
          <Card className="p-8">
            <div className="flex justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          </Card>
        ) : (
          <div className="space-y-8">
            <Card className="overflow-hidden border-2 border-primary/10 shadow-lg">
              <CardContent className="p-0">
                <div className="grid grid-cols-3 divide-x">
                  <Button 
                    variant="ghost" 
                    onClick={() => goToStep(1)} 
                    className="py-6 rounded-none flex flex-col items-center gap-2 hover:bg-primary/5"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-primary">Paso 1</p>
                      <p className="text-sm text-muted-foreground">Personajes</p>
                    </div>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    onClick={() => goToStep(2)} 
                    className="py-6 rounded-none flex flex-col items-center gap-2 hover:bg-primary/5"
                    disabled={selectedCharacterIds.length === 0}
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <BookText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-primary">Paso 2</p>
                      <p className="text-sm text-muted-foreground">Historia</p>
                    </div>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    onClick={() => goToStep(3)} 
                    className="py-6 rounded-none flex flex-col items-center gap-2 hover:bg-primary/5"
                    disabled={selectedCharacterIds.length === 0}
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Settings className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-primary">Paso 3</p>
                      <p className="text-sm text-muted-foreground">Configuración</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <div className="text-center">
              <p className="text-lg font-medium mb-4">¡Comienza a crear tu historia personalizada!</p>
              <p className="text-muted-foreground mb-8">
                Sigue los tres sencillos pasos para generar un libro único con tus personajes favoritos.
              </p>
              
              <Button 
                size="lg" 
                onClick={startCreation}
                className="mx-auto px-8 py-6 text-lg"
              >
                <Wand2 className="mr-2 h-5 w-5" />
                Comenzar Creación
              </Button>
            </div>
            
            {/* Formulario oculto para manejar la validación */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="hidden">
                <Button type="submit">Enviar</Button>
              </form>
            </Form>
          </div>
        )}
      </div>
      
      {/* Modales del asistente */}
      <CharacterSelectionModal
        childProfiles={childProfiles}
        preselectedCharacterId={preselectedCharacterId}
        setSelectedCharacterIds={setSelectedCharacterIds}
        selectedCharacterIds={selectedCharacterIds}
        onNext={() => goToStep(2)}
        isOpen={characterSelectionOpen}
        onOpenChange={setCharacterSelectionOpen}
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
    </div>
  );
}