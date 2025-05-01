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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Check, 
  ArrowRight, 
  ArrowLeft,
  Loader2, 
  Users, 
  BookText,
  BookOpen,
  Settings,
  Wand2,
  Info,
  ImagePlus
} from "lucide-react";

// Función auxiliar para obtener los datos del formulario desde el contexto de validación
function getFormDataFromContext(ctx: z.RefinementCtx): Record<string, unknown> | null {
  try {
    // Intentar extraer datos del contexto
    // Esta es una solución alternativa ya que ctx.parent no está tipado correctamente
    const data = (ctx as any).data;
    if (data) return data;
    
    return null;
  } catch (e) {
    console.warn("Error al obtener datos del formulario:", e);
    return null;
  }
}

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

// Definición de los roles de personajes
type CharacterRole = 'protagonist' | 'secondary' | 'antagonist' | 'mentor' | 'ally';

// Interfaces para manejar la información del personaje en la historia
interface CharacterStoryDetails {
  role: CharacterRole;
  specificTraits?: string[];
  storyBackground?: string;
  specialAbilities?: string[];
  customDescription?: string;
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
  characterDetails: {[key: string]: CharacterStoryDetails};
  setCharacterDetails: (details: {[key: string]: CharacterStoryDetails}) => void;
}

// Componente para configurar detalles específicos del personaje
interface CharacterDetailsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  characterId: string;
  character: any;
  storyDetails: CharacterStoryDetails;
  onUpdate: (characterId: string, details: CharacterStoryDetails) => void;
}

function CharacterDetailsModal({
  isOpen,
  onOpenChange,
  characterId,
  character,
  storyDetails,
  onUpdate
}: CharacterDetailsModalProps) {
  // Estados para los campos editables usando useEffect para actualizarlos cuando cambia el personaje seleccionado
  const [role, setRole] = useState<CharacterRole>('protagonist');
  const [traits, setTraits] = useState<string>('');
  const [background, setBackground] = useState<string>('');
  const [abilities, setAbilities] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  
  // Actualizar los estados cuando cambia el personaje o se abre el modal
  useEffect(() => {
    if (isOpen && storyDetails) {
      setRole(storyDetails.role || 'protagonist');
      setTraits(storyDetails.specificTraits?.join(', ') || '');
      setBackground(storyDetails.storyBackground || '');
      setAbilities(storyDetails.specialAbilities?.join(', ') || '');
      setDescription(storyDetails.customDescription || '');
    }
  }, [isOpen, characterId, storyDetails]);
  
  // Roles disponibles para un personaje
  const availableRoles: {value: CharacterRole, label: string, description: string, icon: React.ReactNode}[] = [
    { 
      value: 'protagonist', 
      label: 'Protagonista', 
      description: 'El personaje principal de la historia',
      icon: <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center"><span className="text-yellow-600 text-xs font-bold">P</span></div>
    },
    { 
      value: 'secondary', 
      label: 'Secundario', 
      description: 'Un personaje que acompaña al protagonista',
      icon: <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center"><span className="text-blue-600 text-xs font-bold">S</span></div>
    },
    { 
      value: 'antagonist', 
      label: 'Antagonista', 
      description: 'El adversario o villano de la historia',
      icon: <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center"><span className="text-red-600 text-xs font-bold">A</span></div>
    },
    { 
      value: 'mentor', 
      label: 'Mentor', 
      description: 'Guía y aconseja al protagonista',
      icon: <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center"><span className="text-purple-600 text-xs font-bold">M</span></div>
    },
    { 
      value: 'ally', 
      label: 'Aliado', 
      description: 'Ayuda al protagonista en su aventura',
      icon: <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center"><span className="text-green-600 text-xs font-bold">Al</span></div>
    }
  ];
  
  // Guardar los cambios
  const handleSave = () => {
    const updatedDetails: CharacterStoryDetails = {
      role,
      specificTraits: traits.split(',').map(t => t.trim()).filter(Boolean),
      storyBackground: background,
      specialAbilities: abilities.split(',').map(a => a.trim()).filter(Boolean),
      customDescription: description
    };
    
    onUpdate(characterId, updatedDetails);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            Detalles de {character?.name || 'Personaje'} para esta historia
          </DialogTitle>
          <DialogDescription>
            Personaliza cómo aparecerá este personaje en tu historia
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          {/* Sección de rol del personaje */}
          <div className="space-y-3">
            <h3 className="text-base font-medium">Rol en la historia</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {availableRoles.map((roleOption) => (
                <div 
                  key={roleOption.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    role === roleOption.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/30'
                  }`}
                  onClick={() => setRole(roleOption.value)}
                >
                  {roleOption.icon}
                  <div>
                    <p className="font-medium text-sm">{roleOption.label}</p>
                    <p className="text-xs text-muted-foreground">{roleOption.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Sección de rasgos específicos */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Rasgos específicos</label>
              <span className="text-xs text-muted-foreground">Separa con comas</span>
            </div>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Ej: Valiente, Curioso, Divertido"
              value={traits}
              onChange={(e) => setTraits(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Añade rasgos que este personaje mostrará específicamente en esta historia</p>
          </div>
          
          {/* Sección de trasfondo */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Trasfondo para esta historia</label>
            <textarea
              className="w-full px-3 py-2 border rounded-md"
              rows={2}
              placeholder="Describe el pasado o motivación del personaje en esta historia..."
              value={background}
              onChange={(e) => setBackground(e.target.value)}
            />
          </div>
          
          {/* Sección de habilidades especiales */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Habilidades especiales</label>
              <span className="text-xs text-muted-foreground">Separa con comas</span>
            </div>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Ej: Cantar, Magia, Cocinar"
              value={abilities}
              onChange={(e) => setAbilities(e.target.value)}
            />
          </div>
          
          {/* Sección de descripción personalizada */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Descripción personalizada (opcional)</label>
            <textarea
              className="w-full px-3 py-2 border rounded-md"
              rows={3}
              placeholder="Añade cualquier detalle adicional sobre este personaje para esta historia específica..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Guardar Detalles
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Modal para crear un nuevo personaje
interface CreateCharacterModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCharacterCreated: (newCharacter?: any) => void;
}

// Schema para crear personajes con validaciones por tipo
const createCharacterSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres",
  }),
  type: z.string(),
  age: z.union([z.number(), z.string(), z.null()]).optional(),
  gender: z.string().optional(),
  physicalDescription: z.string().optional(),
  personality: z.string().optional(),
  likes: z.string().optional(),
  dislikes: z.string().optional(),
  interests: z.string().optional(),
  avatarUrl: z.string().optional(),
});

type CreateCharacterFormValues = z.infer<typeof createCharacterSchema>;

function CreateCharacterModal({
  isOpen,
  onOpenChange,
  onCharacterCreated
}: CreateCharacterModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [characterType, setCharacterType] = useState<string>('child');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Formulario con validación
  const form = useForm<CreateCharacterFormValues>({
    resolver: zodResolver(createCharacterSchema),
    defaultValues: {
      name: "",
      type: "child",
      age: null,
      gender: "",
      physicalDescription: "",
      personality: "",
      likes: "",
      dislikes: "",
      interests: "",
      avatarUrl: "",
    },
  });
  
  // Cambiar el tipo de personaje
  const handleCharacterTypeChange = (value: string, onChange: (value: string) => void) => {
    setCharacterType(value);
    onChange(value);
    
    // Resetear algunos campos específicos cuando cambia el tipo
    if (value !== 'child') {
      form.setValue('gender', '');
    }
  };
  
  // Manejar cambio de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Limpiar el formulario
  const resetForm = () => {
    form.reset({
      name: "",
      type: "child",
      age: null,
      gender: "",
      physicalDescription: "",
      personality: "",
      likes: "",
      dislikes: "",
      interests: "",
      avatarUrl: "",
    });
    setCharacterType('child');
    setImageFile(null);
    setImagePreview(null);
    setIsSubmitting(false);
  };
  
  // Crear un nuevo personaje
  const onSubmit = async (data: CreateCharacterFormValues) => {
    try {
      setIsSubmitting(true);
      
      // TODO: Si hay imagen, subirla a Cloudinary y obtener la URL
      
      // Enviar la solicitud de creación (usando el endpoint correcto)
      const response = await apiRequest('POST', '/api/profiles', {
        ...data,
        userId: 1 // TODO: Obtener el userId del contexto de autenticación
      });
      
      if (!response.ok) {
        throw new Error("Error al crear el personaje");
      }
      
      // Obtener el personaje recién creado de la respuesta
      const newCharacter = await response.json();
      
      // Notificar éxito
      toast({
        title: "Personaje creado",
        description: `Se ha creado el personaje "${data.name}" correctamente.`,
      });
      
      // Limpiar y cerrar
      resetForm();
      onOpenChange(false);
      
      // Notificar al componente padre para que actualice la lista y pasar el nuevo personaje
      onCharacterCreated(newCharacter);
      
    } catch (error) {
      console.error("Error al crear personaje:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al crear el personaje. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && onOpenChange(open)}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            Crear Nuevo Personaje
          </DialogTitle>
          <DialogDescription>
            Completa la información para crear un nuevo personaje
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Nombre del personaje" 
                          {...field} 
                          autoFocus
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de personaje</FormLabel>
                      <Select 
                        onValueChange={(value) => handleCharacterTypeChange(value, field.onChange)} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="child">Niño/a</SelectItem>
                          <SelectItem value="adult">Adulto</SelectItem>
                          <SelectItem value="pet">Mascota</SelectItem>
                          <SelectItem value="teddy">Juguete/Peluche</SelectItem>
                          <SelectItem value="fantasy">Personaje fantástico</SelectItem>
                          <SelectItem value="other">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {characterType === 'child' || characterType === 'adult' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Edad</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Edad" 
                              min={0} 
                              max={150}
                              onChange={(e) => {
                                const value = e.target.value === '' ? null : parseInt(e.target.value);
                                field.onChange(value);
                              }}
                              value={field.value === null ? '' : field.value}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Género</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="masculino">Masculino</SelectItem>
                              <SelectItem value="femenino">Femenino</SelectItem>
                              <SelectItem value="otro">Otro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ) : null}
                
                <FormField
                  control={form.control}
                  name="physicalDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción física (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={
                            characterType === 'child' ? "Describe la apariencia física del niño/a" : 
                            characterType === 'adult' ? "Describe la apariencia física del adulto" : 
                            characterType === 'pet' ? "Describe cómo es físicamente la mascota" :
                            characterType === 'teddy' ? "Describe cómo se ve este juguete/peluche" :
                            characterType === 'fantasy' ? "Describe la apariencia de este ser fantástico" :
                            "Describe la apariencia física del personaje"
                          }
                          className="resize-none min-h-[80px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="personality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Personalidad (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={
                            characterType === 'child' ? "¿Cómo es su personalidad? Tímido, aventurero, curioso..." : 
                            characterType === 'adult' ? "¿Cómo es su personalidad? Divertido, serio, aventurero..." : 
                            characterType === 'pet' ? "¿Cómo se comporta esta mascota? Juguetona, tranquila..." :
                            characterType === 'teddy' ? "¿Qué personalidad tiene este juguete/peluche?" :
                            characterType === 'fantasy' ? "¿Cómo es la personalidad de este ser fantástico?" :
                            "Describe la personalidad del personaje"
                          }
                          className="resize-none min-h-[80px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="likes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Le gusta (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={
                            characterType === 'child' ? "¿Qué le gusta hacer? Jugar, dibujar, deportes..." : 
                            characterType === 'adult' ? "¿Qué le gusta hacer? Hobbies, intereses..." : 
                            characterType === 'pet' ? "Cosas que le gustan a la mascota..." :
                            characterType === 'teddy' ? "¿Qué le gusta a este juguete/peluche?" :
                            characterType === 'fantasy' ? "¿Qué le gusta a este ser fantástico?" :
                            "¿Qué le gusta al personaje?"
                          }
                          className="resize-none min-h-[80px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dislikes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>No le gusta (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={
                            characterType === 'child' ? "¿Qué no le gusta? Miedos, situaciones, comidas..." : 
                            characterType === 'adult' ? "¿Qué no le gusta? Situaciones, comidas..." : 
                            characterType === 'pet' ? "Cosas que no le gustan a la mascota..." :
                            characterType === 'teddy' ? "¿Qué no le gusta a este juguete/peluche?" :
                            characterType === 'fantasy' ? "¿Qué no le gusta a este ser fantástico?" :
                            "¿Qué no le gusta al personaje?"
                          }
                          className="resize-none min-h-[80px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="interests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intereses/Favoritos (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={
                          characterType === 'child' ? "Juguetes favoritos, colores preferidos, comidas que le gustan..." : 
                          characterType === 'adult' ? "Hobbies, pasatiempos, lugares favoritos..." : 
                          characterType === 'pet' ? "Juguetes favoritos, actividades..." :
                          characterType === 'teddy' ? "Lugares favoritos, actividades..." :
                          characterType === 'fantasy' ? "¿Qué le interesa a este ser fantástico?" :
                          "Intereses y cosas favoritas del personaje"
                        }
                        className="resize-none min-h-[80px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-4">
                <FormLabel>Imagen (Opcional)</FormLabel>
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden"
                  >
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImagePlus className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Sube una imagen que represente al personaje
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex justify-between pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)} 
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear Personaje'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
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
  // Estados para los modales adicionales
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState<boolean>(false);
  const [selectedCharacterForDetails, setSelectedCharacterForDetails] = useState<string | null>(null);
  
  // Función para actualizar los detalles de un personaje
  const updateCharacterDetails = (characterId: string, details: CharacterStoryDetails) => {
    setCharacterDetails({
      ...characterDetails,
      [characterId]: details
    });
  };
  
  // Query para obtener personajes
  const { data: characters, refetch: refetchProfiles } = useQuery({
    queryKey: ['/api/characters'],
    enabled: isOpen
  });
  
  // Hook para mostrar notificaciones
  const { toast } = useToast();
  
  // Función para refrescar la lista de personajes después de crear uno nuevo
  const handleCharacterCreated = async (newCharacter?: any) => {
    console.log("Actualizando lista de personajes después de creación", newCharacter);
    
    try {
      // Si tenemos el nuevo personaje directamente del modal, lo procesamos primero
      if (newCharacter && newCharacter.id) {
        console.log("Usando el personaje recién creado:", newCharacter);
        const characterId = newCharacter.id.toString();
        
        // Verificar si ya está en la selección
        if (!selectedCharacterIds.includes(characterId)) {
          console.log("Añadiendo personaje a la selección:", characterId);
          
          // Añadir a la selección inmediatamente
          setSelectedCharacterIds(prevIds => [...prevIds, characterId]);
          
          // Asignar automáticamente rol de protagonista si no hay otro protagonista
          const hasProtagonist = Object.values(characterDetails).some(
            detail => detail && detail.role === 'protagonist'
          );
          
          if (!hasProtagonist) {
            console.log("Asignando rol de protagonista al nuevo personaje");
            setCharacterDetails(prevDetails => ({
              ...prevDetails,
              [characterId]: {
                role: 'protagonist',
                specificTraits: ['Valiente', 'Curioso'],
                storyBackground: '',
                specialAbilities: [],
                customDescription: ''
              }
            }));
          } else {
            console.log("Ya existe un protagonista, asignando rol secundario");
            setCharacterDetails(prevDetails => ({
              ...prevDetails,
              [characterId]: {
                role: 'secondary',
                specificTraits: ['Amigable', 'Leal'],
                storyBackground: '',
                specialAbilities: [],
                customDescription: ''
              }
            }));
          }
          
          toast({
            title: "Personaje añadido",
            description: `Se ha añadido "${newCharacter.name}" a tu selección.`,
          });
        } else {
          console.log("El personaje ya está seleccionado:", characterId);
        }
        
        // Antes de salir, asegurarnos de que el personaje esté en la lista local
        if (!childProfiles.some(profile => profile.id === newCharacter.id)) {
          console.log("Actualizando la lista local con el nuevo personaje");
          // Actualizar directamente los childProfiles locales para la renderización inmediata
          childProfiles.push(newCharacter);
        }
        
        // Refrescar la lista completa de personajes para mantener actualizada la UI
        // pero no esperamos a que termine para continuar
        refetchProfiles();
        return;
      }
      
      // Refrescar la lista completa de personajes para mantener actualizada la UI
      await refetchProfiles();
      
      // Flujo alternativo (de respaldo) si no se recibió el personaje
      console.log("No se recibió el personaje, buscando el último creado");
      const response = await apiRequest('GET', '/api/users/1/characters');
      
      if (response.ok) {
        const characters = await response.json();
        console.log("Personajes obtenidos:", characters.length);
        
        if (characters && characters.length > 0) {
          // Conseguir el personaje más reciente (el último de la lista)
          const latestCharacter = characters[characters.length - 1];
          console.log("Último personaje creado:", latestCharacter);
          
          if (latestCharacter && latestCharacter.id) {
            const characterId = latestCharacter.id.toString();
            
            // Seleccionar automáticamente el personaje recién creado
            setSelectedCharacterIds(prevIds => {
              // Si ya está seleccionado, no hacemos nada
              if (prevIds.includes(characterId)) {
                return prevIds;
              }
              
              console.log("Añadiendo personaje a la selección:", characterId);
              // Agregarlo a la selección
              return [...prevIds, characterId];
            });
            
            // Asignar automáticamente rol de protagonista si no hay otro protagonista
            const hasProtagonist = Object.values(characterDetails).some(
              detail => detail && detail.role === 'protagonist'
            );
            
            if (!hasProtagonist) {
              console.log("Asignando rol de protagonista al nuevo personaje");
              setCharacterDetails(prevDetails => ({
                ...prevDetails,
                [characterId]: {
                  role: 'protagonist',
                  specificTraits: ['Valiente', 'Curioso'],
                  storyBackground: '',
                  specialAbilities: [],
                  customDescription: ''
                }
              }));
            } else {
              console.log("Ya existe un protagonista, asignando rol secundario");
              setCharacterDetails(prevDetails => ({
                ...prevDetails,
                [characterId]: {
                  role: 'secondary',
                  specificTraits: ['Amigable', 'Leal'],
                  storyBackground: '',
                  specialAbilities: [],
                  customDescription: ''
                }
              }));
            }
            
            toast({
              title: "Personaje añadido",
              description: `Se ha añadido "${latestCharacter.name}" a tu selección.`,
            });
          }
        }
      } else {
        console.warn("No se pudieron obtener los personajes actualizados");
        toast({
          title: "Personaje creado",
          description: "El personaje ha sido creado, pero no se pudo añadir automáticamente. Por favor, selecciónalo manualmente.",
        });
      }
    } catch (error) {
      console.error("Error al obtener los personajes:", error);
      toast({
        title: "Personaje creado",
        description: "El personaje ha sido creado, pero hubo un problema al seleccionarlo automáticamente.",
      });
    }
  };
  
  // Obtener el personaje seleccionado para editar detalles
  const selectedCharacter = selectedCharacterForDetails 
    ? childProfiles.find(c => c.id.toString() === selectedCharacterForDetails) 
    : null;
  
  // Función para abrir el modal de detalles de un personaje
  const openDetailsModal = (characterId: string) => {
    setSelectedCharacterForDetails(characterId);
    setDetailsModalOpen(true);
  };
  
  // Función para renderizar el icono de rol
  const getRoleIcon = (characterId: string) => {
    const details = characterDetails[characterId];
    if (!details || !details.role) return null;
    
    const roleIcons: Record<CharacterRole, React.ReactNode> = {
      'protagonist': <div className="w-5 h-5 bg-yellow-500/20 rounded-full flex items-center justify-center"><span className="text-yellow-600 text-xs font-bold">P</span></div>,
      'secondary': <div className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center"><span className="text-blue-600 text-xs font-bold">S</span></div>,
      'antagonist': <div className="w-5 h-5 bg-red-500/20 rounded-full flex items-center justify-center"><span className="text-red-600 text-xs font-bold">A</span></div>,
      'mentor': <div className="w-5 h-5 bg-purple-500/20 rounded-full flex items-center justify-center"><span className="text-purple-600 text-xs font-bold">M</span></div>,
      'ally': <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center"><span className="text-green-600 text-xs font-bold">Al</span></div>
    };
    
    return roleIcons[details.role];
  };
  
  // Función para obtener el label del rol
  const getRoleLabel = (characterId: string) => {
    const details = characterDetails[characterId];
    if (!details || !details.role) return '';
    
    const roleLabels: Record<CharacterRole, string> = {
      'protagonist': 'Protagonista',
      'secondary': 'Secundario',
      'antagonist': 'Antagonista',
      'mentor': 'Mentor',
      'ally': 'Aliado'
    };
    
    return roleLabels[details.role];
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Selección de Personajes
            </DialogTitle>
            <DialogDescription>
              Elige entre 1 y 5 personajes para tu historia y asígnales roles
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {childProfiles.length === 0 ? (
              <div className="text-center space-y-4 py-8">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Users className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-lg font-medium">No tienes personajes creados</h3>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  Para crear un libro personalizado, primero necesitas crear al menos un personaje. Puedes añadir niños, adultos, mascotas e incluso personajes de fantasía.
                </p>
                <Button 
                  onClick={() => setCreateModalOpen(true)} 
                  className="mx-auto"
                  size="lg"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Crear Mi Primer Personaje
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {selectedCharacterIds.length === 0 
                      ? 'Selecciona al menos un personaje para continuar' 
                      : `Has seleccionado ${selectedCharacterIds.length} ${selectedCharacterIds.length === 1 ? 'personaje' : 'personajes'}`
                    }
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCreateModalOpen(true)}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Añadir Personaje
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-2">
                  {childProfiles.map((profile) => {
                    const isSelected = selectedCharacterIds.includes(profile.id.toString());
                    const hasRole = isSelected && characterDetails[profile.id.toString()]?.role;
                    
                    return (
                      <div 
                        key={profile.id} 
                        className={`border rounded-lg transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm" 
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div 
                          className="p-4 cursor-pointer"
                          onClick={() => {
                            const profileId = profile.id.toString();
                            const newSelection = [...selectedCharacterIds];
                            
                            if (isSelected) {
                              // Remover de la selección
                              const index = newSelection.indexOf(profileId);
                              if (index !== -1) {
                                newSelection.splice(index, 1);
                              }
                            } else {
                              // Añadir a la selección (máximo 5)
                              if (newSelection.length < 5) {
                                newSelection.push(profileId);
                              }
                            }
                            
                            setSelectedCharacterIds(newSelection);
                          }}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                isSelected ? 'bg-primary text-white' : 'bg-muted'
                              }`}>
                                {profile.type === 'child' && <div className="text-sm font-bold">{profile.name.charAt(0)}</div>}
                                {profile.type === 'adult' && <div className="text-sm font-bold">{profile.name.charAt(0)}</div>}
                                {profile.type === 'pet' && <div className="text-sm font-bold">🐾</div>}
                                {profile.type === 'teddy' && <div className="text-sm font-bold">🧸</div>}
                                {profile.type === 'fantasy' && <div className="text-sm font-bold">✨</div>}
                                {profile.type === 'other' && <div className="text-sm font-bold">{profile.name.charAt(0)}</div>}
                              </div>
                              <div>
                                <p className="font-medium">{profile.name}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  {getRoleIcon(profile.id.toString())}
                                  {hasRole ? getRoleLabel(profile.id.toString()) : (
                                    <>
                                      {profile.type === 'child' && 'Niño/a'}
                                      {profile.type === 'adult' && 'Adulto'}
                                      {profile.type === 'pet' && 'Mascota'}
                                      {profile.type === 'teddy' && 'Peluche'}
                                      {profile.type === 'fantasy' && 'Fantasía'}
                                      {profile.type === 'other' && 'Otro'}
                                      {profile.age && `, ${profile.age} años`}
                                    </>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {isSelected && 
                            characterDetails[profile.id.toString()] && 
                            characterDetails[profile.id.toString()]?.specificTraits && 
                            Array.isArray(characterDetails[profile.id.toString()]?.specificTraits) && 
                            characterDetails[profile.id.toString()]?.specificTraits.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {characterDetails[profile.id.toString()]?.specificTraits?.slice(0, 3).map((trait, idx) => (
                                  <span key={idx} className="inline-block px-2 py-0.5 bg-primary/10 text-primary-foreground rounded-full text-xs">
                                    {trait}
                                  </span>
                                ))}
                                {(characterDetails[profile.id.toString()]?.specificTraits?.length || 0) > 3 && (
                                  <span className="inline-block px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs">
                                    +{(characterDetails[profile.id.toString()]?.specificTraits?.length || 0) - 3}
                                  </span>
                                )}
                              </div>
                          )}
                        </div>
                        
                        {isSelected && (
                          <div className="border-t p-2 flex justify-end">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => openDetailsModal(profile.id.toString())}
                            >
                              <Settings className="h-3.5 w-3.5 mr-1" />
                              {hasRole ? 'Editar rol' : 'Configurar rol'}
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {selectedCharacterIds.length > 0 && (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-2">Personajes seleccionados:</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCharacterIds.map((id) => {
                        const character = childProfiles.find(c => c.id.toString() === id);
                        if (!character) return null;
                        
                        return (
                          <div 
                            key={id}
                            className="inline-flex items-center gap-1 bg-background border px-3 py-1 rounded-full text-sm"
                          >
                            {getRoleIcon(id)}
                            <span>{character.name}</span>
                            <button 
                              className="ml-1 text-muted-foreground hover:text-foreground"
                              onClick={() => {
                                setSelectedCharacterIds(selectedCharacterIds.filter(cid => cid !== id));
                              }}
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            
            <Button 
              onClick={onNext} 
              disabled={selectedCharacterIds.length === 0}
            >
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal para crear un nuevo personaje */}
      <CreateCharacterModal
        isOpen={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCharacterCreated={handleCharacterCreated}
      />
      
      {/* Modal para detalles específicos del personaje */}
      {selectedCharacter && (
        <CharacterDetailsModal
          isOpen={detailsModalOpen}
          onOpenChange={setDetailsModalOpen}
          characterId={selectedCharacterForDetails!}
          character={selectedCharacter}
          storyDetails={characterDetails[selectedCharacterForDetails!] || { role: 'protagonist' }}
          onUpdate={updateCharacterDetails}
        />
      )}
    </>
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
  const selectedTemplateDetails = getTemplateDetails(selectedTemplate);
  
  // Definición de plantillas disponibles
  const templates = [
    { 
      id: "custom", 
      title: "Personalizado", 
      description: "Crea una historia completamente personalizada desde cero",
      details: {}
    },
    { 
      id: "adventure", 
      title: "Aventura fantástica", 
      description: "Una emocionante aventura en un reino mágico",
      details: getTemplateDetails("adventure")
    },
    { 
      id: "science", 
      title: "Exploración espacial", 
      description: "Un viaje educativo por el espacio exterior",
      details: getTemplateDetails("science")
    },
    { 
      id: "nature", 
      title: "Naturaleza encantada", 
      description: "Descubrimiento y respeto por la naturaleza",
      details: getTemplateDetails("nature")
    },
    { 
      id: "family", 
      title: "Valores familiares", 
      description: "Una historia sobre cooperación y lazos familiares",
      details: getTemplateDetails("family")
    }
  ];
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Detalles de la Historia
          </DialogTitle>
          <DialogDescription>
            Personaliza tu historia o selecciona una plantilla predefinida
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
        <Tabs defaultValue="custom" className="mt-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="custom">Personalizado</TabsTrigger>
            <TabsTrigger value="templates">Plantillas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="custom" className="space-y-6 mt-4">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título del libro</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Introduce un título para el libro" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="scenario"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Escenario</FormLabel>
                      <div className="space-y-2">
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un escenario" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Reino mágico">Reino mágico</SelectItem>
                            <SelectItem value="Ciudad moderna">Ciudad moderna</SelectItem>
                            <SelectItem value="Bosque encantado">Bosque encantado</SelectItem>
                            <SelectItem value="Espacio exterior">Espacio exterior</SelectItem>
                            <SelectItem value="Océano profundo">Océano profundo</SelectItem>
                            <SelectItem value="Montañas">Montañas</SelectItem>
                            <SelectItem value="Isla desierta">Isla desierta</SelectItem>
                            <SelectItem value="Mundo prehistórico">Mundo prehistórico</SelectItem>
                            <SelectItem value="otro">Otro escenario...</SelectItem>
                          </SelectContent>
                        </Select>

                        {field.value === "otro" && (
                          <Input 
                            placeholder="Describe el lugar donde ocurrirá la historia" 
                            value={field.value === "otro" ? "" : field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="mt-2"
                          />
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="era"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Época</FormLabel>
                      <div className="space-y-2">
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una época" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Medieval fantástico">Medieval fantástico</SelectItem>
                            <SelectItem value="Actualidad">Actualidad</SelectItem>
                            <SelectItem value="Futuro cercano">Futuro cercano</SelectItem>
                            <SelectItem value="Futuro lejano">Futuro lejano</SelectItem>
                            <SelectItem value="Prehistoria">Prehistoria</SelectItem>
                            <SelectItem value="Época victoriana">Época victoriana</SelectItem>
                            <SelectItem value="Antiguo Egipto">Antiguo Egipto</SelectItem>
                            <SelectItem value="Época pirata">Época pirata</SelectItem>
                            <SelectItem value="otro">Otra época...</SelectItem>
                          </SelectContent>
                        </Select>

                        {field.value === "otro" && (
                          <Input 
                            placeholder="Describe la época de la historia" 
                            value={field.value === "otro" ? "" : field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="mt-2"
                          />
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="adventureType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de aventura</FormLabel>
                      <div className="space-y-2">
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un tipo de aventura" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Búsqueda del tesoro">Búsqueda del tesoro</SelectItem>
                            <SelectItem value="Rescate">Rescate</SelectItem>
                            <SelectItem value="Exploración">Exploración</SelectItem>
                            <SelectItem value="Resolver un misterio">Resolver un misterio</SelectItem>
                            <SelectItem value="Aprendizaje">Aprendizaje</SelectItem>
                            <SelectItem value="Superar desafíos">Superar desafíos</SelectItem>
                            <SelectItem value="Viaje interior">Viaje interior</SelectItem>
                            <SelectItem value="Ayudar a otros">Ayudar a otros</SelectItem>
                            <SelectItem value="otro">Otro tipo...</SelectItem>
                          </SelectContent>
                        </Select>

                        {field.value === "otro" && (
                          <Input 
                            placeholder="Describe el tipo de aventura" 
                            value={field.value === "otro" ? "" : field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="mt-2"
                          />
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="moralValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor moral o lección</FormLabel>
                      <div className="space-y-2">
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un valor moral para la historia" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Amistad">Amistad</SelectItem>
                            <SelectItem value="Generosidad">Generosidad</SelectItem>
                            <SelectItem value="Respeto">Respeto</SelectItem>
                            <SelectItem value="Honestidad">Honestidad</SelectItem>
                            <SelectItem value="Perseverancia">Perseverancia</SelectItem>
                            <SelectItem value="Cooperación">Cooperación</SelectItem>
                            <SelectItem value="Responsabilidad">Responsabilidad</SelectItem>
                            <SelectItem value="Humildad">Humildad</SelectItem>
                            <SelectItem value="Valentía">Valentía</SelectItem>
                            <SelectItem value="Tolerancia">Tolerancia</SelectItem>
                            <SelectItem value="Respeto por la naturaleza">Respeto por la naturaleza</SelectItem>
                            <SelectItem value="Empatía">Empatía</SelectItem>
                            <SelectItem value="otro">Otro valor...</SelectItem>
                          </SelectContent>
                        </Select>

                        {field.value === "otro" && (
                          <Input 
                            placeholder="Describe el valor moral o lección de la historia" 
                            value={field.value === "otro" ? "" : field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="mt-2"
                          />
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="fantasyLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nivel de fantasía</FormLabel>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Realista</span>
                        <span className="text-sm text-muted-foreground">Muy fantástico</span>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tone"
                render={({ field }) => {
                  // Para manejar la opción personalizada
                  const [customTone, setCustomTone] = useState("");
                  const [showCustomField, setShowCustomField] = useState(false);
                  
                  // Determinar si ya tiene 3 seleccionados
                  const hasMaxSelections = field.value?.length >= 3;
                  
                  return (
                    <FormItem>
                      <FormLabel>Tono de la historia</FormLabel>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {["Emocionante", "Optimista", "Divertido", "Educativo", "Dramático", "Misterioso", "Humorístico", "Inspirador", "Otro"].map((tone) => (
                          <div 
                            key={tone}
                            className={`px-3 py-2 border rounded-md text-sm text-center cursor-pointer ${
                              tone === "Otro" && showCustomField
                                ? "bg-primary/10 border-primary"
                                : tone !== "Otro" && field.value?.includes(tone)
                                  ? "bg-primary/10 border-primary" 
                                  : "hover:bg-muted"
                            } ${
                              hasMaxSelections && !field.value?.includes(tone) && tone !== "Otro"
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            onClick={() => {
                              if (tone === "Otro") {
                                setShowCustomField(!showCustomField);
                                return;
                              }
                              
                              const currentTones = field.value || [];
                              
                              // Si ya está seleccionado, quitarlo
                              if (currentTones.includes(tone)) {
                                field.onChange(currentTones.filter((t: string) => t !== tone));
                                return;
                              }
                              
                              // Si no está seleccionado y ya hay 3, no hacer nada
                              if (currentTones.length >= 3) {
                                return;
                              }
                              
                              // Añadirlo a la selección
                              field.onChange([...currentTones, tone]);
                            }}
                          >
                            {tone}
                          </div>
                        ))}
                      </div>
                      
                      {showCustomField && (
                        <div className="mt-2">
                          <div className="mb-2">
                            <p className="text-sm text-muted-foreground mb-1">Tonos personalizados añadidos:</p>
                            <div className="flex flex-wrap gap-1">
                              {field.value?.filter(tone => 
                                !["Emocionante", "Optimista", "Divertido", "Educativo", "Dramático", "Misterioso", "Humorístico", "Inspirador", "Otro"].includes(tone)
                              ).map((customTone, idx) => (
                                <div key={idx} className="bg-primary/10 border border-primary/30 rounded-md text-sm px-2 py-1 flex items-center gap-1">
                                  {customTone}
                                  <button
                                    type="button"
                                    className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center"
                                    onClick={() => {
                                      const currentTones = field.value || [];
                                      field.onChange(currentTones.filter(t => t !== customTone));
                                    }}
                                  >
                                    <span className="text-[10px] text-primary">×</span>
                                  </button>
                                </div>
                              ))}
                              {field.value?.filter(tone => 
                                !["Emocionante", "Optimista", "Divertido", "Educativo", "Dramático", "Misterioso", "Humorístico", "Inspirador", "Otro"].includes(tone)
                              ).length === 0 && (
                                <span className="text-xs text-muted-foreground">Ninguno añadido todavía</span>
                              )}
                            </div>
                          </div>
                          
                          <Input 
                            placeholder="Escribe tu propio tono..."
                            value={customTone}
                            onChange={(e) => setCustomTone(e.target.value)}
                            className="mb-2"
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              if (!customTone.trim()) return;
                              
                              const currentTones = field.value || [];
                              
                              // Si ya hay 3 elementos, mostrar un toast y no hacer nada
                              if (currentTones.length >= 3) {
                                toast({
                                  title: "Máximo alcanzado",
                                  description: "Solo puedes seleccionar hasta 3 tonos. Elimina alguno para añadir otro.",
                                  variant: "destructive",
                                });
                                return;
                              }
                              
                              // Añadirlo a la selección
                              field.onChange([...currentTones, customTone]);
                              setCustomTone("");
                              toast({
                                title: "Tono añadido",
                                description: `Se ha añadido "${customTone}" a la selección.`,
                              });
                            }}
                            disabled={!customTone.trim()}
                          >
                            Añadir
                          </Button>
                        </div>
                      )}
                      
                      <FormDescription>
                        Selecciona hasta 3 tonos para tu historia
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              
              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => {
                  // Para manejar la opción personalizada
                  const [customGenre, setCustomGenre] = useState("");
                  const [showCustomField, setShowCustomField] = useState(false);
                  
                  // Determinar si ya tiene 3 seleccionados
                  const hasMaxSelections = field.value?.length >= 3;
                  
                  return (
                    <FormItem>
                      <FormLabel>Géneros principales</FormLabel>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {["Fantasía", "Aventura", "Ciencia", "Educativo", "Familiar", "Amistad", "Naturaleza", "Superación", "Otro"].map((genre) => (
                          <div 
                            key={genre}
                            className={`px-3 py-2 border rounded-md text-sm text-center cursor-pointer ${
                              genre === "Otro" && showCustomField
                                ? "bg-primary/10 border-primary"
                                : genre !== "Otro" && field.value?.includes(genre)
                                  ? "bg-primary/10 border-primary" 
                                  : "hover:bg-muted"
                            } ${
                              hasMaxSelections && !field.value?.includes(genre) && genre !== "Otro"
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            onClick={() => {
                              if (genre === "Otro") {
                                setShowCustomField(!showCustomField);
                                return;
                              }
                              
                              const currentGenres = field.value || [];
                              
                              // Si ya está seleccionado, quitarlo
                              if (currentGenres.includes(genre)) {
                                field.onChange(currentGenres.filter((g: string) => g !== genre));
                                return;
                              }
                              
                              // Si no está seleccionado y ya hay 3, no hacer nada
                              if (currentGenres.length >= 3) {
                                return;
                              }
                              
                              // Añadirlo a la selección
                              field.onChange([...currentGenres, genre]);
                            }}
                          >
                            {genre}
                          </div>
                        ))}
                      </div>
                      
                      {showCustomField && (
                        <div className="mt-2">
                          <div className="mb-2">
                            <p className="text-sm text-muted-foreground mb-1">Géneros personalizados añadidos:</p>
                            <div className="flex flex-wrap gap-1">
                              {field.value?.filter(genre => 
                                !["Fantasía", "Aventura", "Ciencia", "Educativo", "Familiar", "Amistad", "Naturaleza", "Superación", "Otro"].includes(genre)
                              ).map((customGenre, idx) => (
                                <div key={idx} className="bg-primary/10 border border-primary/30 rounded-md text-sm px-2 py-1 flex items-center gap-1">
                                  {customGenre}
                                  <button
                                    type="button"
                                    className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center"
                                    onClick={() => {
                                      const currentGenres = field.value || [];
                                      field.onChange(currentGenres.filter(g => g !== customGenre));
                                    }}
                                  >
                                    <span className="text-[10px] text-primary">×</span>
                                  </button>
                                </div>
                              ))}
                              {field.value?.filter(genre => 
                                !["Fantasía", "Aventura", "Ciencia", "Educativo", "Familiar", "Amistad", "Naturaleza", "Superación", "Otro"].includes(genre)
                              ).length === 0 && (
                                <span className="text-xs text-muted-foreground">Ninguno añadido todavía</span>
                              )}
                            </div>
                          </div>
                          
                          <Input 
                            placeholder="Escribe tu propio género..."
                            value={customGenre}
                            onChange={(e) => setCustomGenre(e.target.value)}
                            className="mb-2"
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              if (!customGenre.trim()) return;
                              
                              const currentGenres = field.value || [];
                              
                              // Si ya hay 3 elementos, mostrar un toast y no hacer nada
                              if (currentGenres.length >= 3) {
                                toast({
                                  title: "Máximo alcanzado",
                                  description: "Solo puedes seleccionar hasta 3 géneros. Elimina alguno para añadir otro.",
                                  variant: "destructive",
                                });
                                return;
                              }
                              
                              // Añadirlo a la selección
                              field.onChange([...currentGenres, customGenre]);
                              setCustomGenre("");
                              toast({
                                title: "Género añadido",
                                description: `Se ha añadido "${customGenre}" a la selección.`,
                              });
                            }}
                            disabled={!customGenre.trim()}
                          >
                            Añadir
                          </Button>
                        </div>
                      )}
                      
                      <FormDescription>
                        Selecciona hasta 3 géneros para tu historia
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              
              <FormField
                control={form.control}
                name="storyObjective"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objetivo de la historia</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe el objetivo principal o mensaje de la historia..." 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="templates" className="space-y-4 mt-4">
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Plantillas predefinidas</h3>
                  <p className="text-sm text-blue-600">
                    Selecciona una plantilla para empezar rápidamente. Después de seleccionarla podrás personalizar todos los detalles.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <Card 
                  key={template.id} 
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedTemplate === template.id 
                      ? 'border-2 border-primary ring-2 ring-primary/20' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => {
                    setSelectedTemplate(template.id);
                    // Actualizar valores del formulario basados en la plantilla
                    const templateDetails = getTemplateDetails(template.id);
                    Object.entries(templateDetails).forEach(([key, value]) => {
                      form.setValue(key, value);
                    });
                  }}
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
                          <span className="text-muted-foreground">{template.details.scenario}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">Época:</span>
                          <span className="text-muted-foreground">{template.details.era}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">Valor moral:</span>
                          <span className="text-muted-foreground">{template.details.moralValue}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">Nivel fantasía:</span>
                          <span className="text-muted-foreground">{template.details.fantasyLevel}/10</span>
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
                      <span className="font-medium">Tono:</span> {selectedTemplateDetails.tone?.join(", ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm"><span className="font-medium">Valor moral:</span> {selectedTemplateDetails.moralValue}</p>
                    <p className="text-sm"><span className="font-medium">Nivel de fantasía:</span> {selectedTemplateDetails.fantasyLevel}/10</p>
                    <p className="text-sm">
                      <span className="font-medium">Géneros:</span> {selectedTemplateDetails.genre?.join(", ")}
                    </p>
                    <p className="text-sm"><span className="font-medium">Estilo artístico:</span> {selectedTemplateDetails.artStyle}</p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
        </Form>
        
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
  // Opciones de estilo de fuente con ejemplos
  const fontStyles = [
    { id: "casual", name: "Casual", sample: "Había una vez", description: "Estilo relajado y amigable", className: "font-sans" },
    { id: "elegant", name: "Elegante", sample: "Había una vez", description: "Estilo refinado y sofisticado", className: "font-serif" },
    { id: "handwritten", name: "Manuscrita", sample: "Había una vez", description: "Parece escrito a mano", className: "italic" },
    { id: "playful", name: "Juguetona", sample: "Había una vez", description: "Divertida y para los más pequeños", className: "font-bold" },
  ];
  
  // Opciones de estilo de ilustración
  const illustrationStyles = [
    { id: "acuarela", name: "Acuarela colorida", description: "Ilustraciones con efecto acuarela vibrante" },
    { id: "digital", name: "Digital moderno", description: "Estilo digital contemporáneo" },
    { id: "infantil", name: "Infantil", description: "Estilo sencillo y colorido para niños" },
    { id: "comic", name: "Comic/Cartoon", description: "Estilo de cómic o dibujo animado" },
    { id: "realista", name: "Ilustración realista", description: "Dibujos detallados y realistas" },
    { id: "japonés", name: "Manga/Anime", description: "Estilo japonés" },
  ];
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Configuración Técnica
          </DialogTitle>
          <DialogDescription>
            Ajusta los aspectos técnicos y estéticos de tu libro
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <div className="space-y-6 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Número de páginas</label>
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
              <div className="w-20 text-center border rounded-md py-1 font-medium">
                {form.watch("pageCount") || 20}
              </div>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium mb-2 block">Estilo de Arte</label>
                <div className="grid grid-cols-2 gap-2">
                  {illustrationStyles.map((style) => (
                    <div 
                      key={style.id} 
                      className={`border rounded-lg p-3 cursor-pointer text-sm transition-all ${
                        form.watch("artStyle") === style.id 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/30"
                      }`}
                      onClick={() => form.setValue("artStyle", style.id)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium">{style.name}</p>
                        {form.watch("artStyle") === style.id && (
                          <div className="h-4 w-4 bg-primary/20 rounded-full flex items-center justify-center">
                            <Check className="h-3 w-3 text-primary" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{style.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-muted/20 rounded-md p-3">
                <div className="flex items-center gap-2 mb-2">
                  <BookText className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium">Vista previa conceptual</p>
                </div>
                <div className="w-full h-24 bg-primary/5 rounded-md flex items-center justify-center">
                  <p className="text-xs text-muted-foreground">
                    {illustrationStyles.find(s => s.id === form.watch("artStyle"))?.description || 
                    "Selecciona un estilo para ver la descripción"}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium mb-2 block">Estilo de texto</label>
                <div className="grid grid-cols-2 gap-2">
                  {fontStyles.map(font => (
                    <div 
                      key={font.id}
                      className={`border rounded-md p-3 cursor-pointer transition-all ${
                        form.watch("fontStyle") === font.id ? 
                        "border-primary bg-primary/5" : 
                        "hover:border-primary/30"
                      }`}
                      onClick={() => form.setValue("fontStyle", font.id)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm">{font.name}</p>
                        {form.watch("fontStyle") === font.id && (
                          <div className="h-4 w-4 bg-primary/20 rounded-full flex items-center justify-center">
                            <Check className="h-3 w-3 text-primary" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{font.description}</p>
                      <div className={`bg-background p-1 rounded text-sm text-center ${font.className}`}>
                        {font.sample}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Formato del libro</label>
                <div className="grid grid-cols-2 gap-2">
                  <div 
                    className={`border rounded-md p-3 cursor-pointer transition-all ${
                      form.watch("format") === "digital" ? 
                      "border-primary bg-primary/5" : 
                      "hover:border-primary/30"
                    }`}
                    onClick={() => form.setValue("format", "digital")}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium">Digital</p>
                      {form.watch("format") === "digital" && (
                        <div className="h-4 w-4 bg-primary/20 rounded-full flex items-center justify-center">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">PDF visualizable en cualquier dispositivo</p>
                  </div>
                  
                  <div 
                    className={`border rounded-md p-3 transition-all opacity-60 bg-muted/40`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        <p className="font-medium">Impreso</p>
                        <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded-full">Próximamente</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Solicitar impresión física a domicilio</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Instrucciones especiales (opcional)</label>
            <textarea 
              className="w-full p-3 border rounded-md min-h-[100px] text-sm" 
              placeholder="Añade cualquier instrucción especial para la generación del libro, como elementos específicos que quieras incluir, temas que evitar, o aspectos del estilo visual..."
              value={form.watch("specialInstructions") || ""}
              onChange={(e) => form.setValue("specialInstructions", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Estas instrucciones serán consideradas durante la generación del contenido e ilustraciones.
            </p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">Sobre el proceso de generación</h3>
                <p className="text-sm text-blue-600">
                  La generación del libro completo puede tardar entre 3-5 minutos dependiendo de la longitud y complejidad. Recibirás una notificación cuando esté listo.
                </p>
              </div>
            </div>
          </div>
        </div>
        </Form>
        
        <DialogFooter className="flex justify-between mt-6">
          <Button 
            variant="outline" 
            onClick={onPrevious}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>
          
          <Button onClick={onComplete}>
            <Wand2 className="mr-2 h-4 w-4" />
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
  const [characterDetails, setCharacterDetails] = useState<{[key: string]: CharacterStoryDetails}>({});
  
  // Estado para la plantilla
  const [selectedTemplate, setSelectedTemplate] = useState("adventure");
  
  // Determinar si hay un personaje preseleccionado (de la URL)
  const urlParams = new URLSearchParams(location.search.toString());
  const preselectedCharacterId = urlParams.get('character') || urlParams.get('characterId');
  console.log("ID de personaje preseleccionado:", preselectedCharacterId);
  
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
  const { data: childProfilesData = [], isLoading: isLoadingProfiles, refetch: refetchProfiles } = useQuery({
    queryKey: ['/api/users/1/characters'], // Esta es la ruta correcta para obtener los personajes del usuario
  });
  
  // Convertir a array tipado
  const childProfiles = childProfilesData as any[];
  
  // Preseleccionar un personaje si viene en la URL y asignarle rol de protagonista
  useEffect(() => {
    if (preselectedCharacterId && childProfiles && childProfiles.length > 0) {
      console.log("Aplicando preselección y rol de protagonista para:", preselectedCharacterId);
      
      // Verificar que el ID existe en los perfiles
      const characterExists = childProfiles.some(c => c.id.toString() === preselectedCharacterId);
      
      if (characterExists) {
        console.log("Personaje encontrado, configurando como protagonista");
        
        // Añadirlo a la selección (reemplazando cualquier selección previa)
        setSelectedCharacterIds([preselectedCharacterId]);
        
        // Asignarle automáticamente el rol de protagonista
        setCharacterDetails(prevDetails => ({
          ...prevDetails,
          [preselectedCharacterId]: {
            role: 'protagonist',
            specificTraits: ['Valiente', 'Curioso'],
            storyBackground: '',
            specialAbilities: [],
            customDescription: ''
          }
        }));
        
        // También actualizar el formulario
        form.setValue('characterIds', [preselectedCharacterId]);
      } else {
        console.warn("El personaje preseleccionado no existe:", preselectedCharacterId);
      }
    }
  }, [preselectedCharacterId, childProfiles, form]);
  
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