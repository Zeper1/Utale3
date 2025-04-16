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
  // Estados para los campos editables
  const [role, setRole] = useState<CharacterRole>(storyDetails?.role || 'protagonist');
  const [traits, setTraits] = useState<string>(storyDetails?.specificTraits?.join(', ') || '');
  const [background, setBackground] = useState<string>(storyDetails?.storyBackground || '');
  const [abilities, setAbilities] = useState<string>(storyDetails?.specialAbilities?.join(', ') || '');
  const [description, setDescription] = useState<string>(storyDetails?.customDescription || '');
  
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
  onCharacterCreated: () => void;
}

function CreateCharacterModal({
  isOpen,
  onOpenChange,
  onCharacterCreated
}: CreateCharacterModalProps) {
  // Estados para los campos del nuevo personaje
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<string>('child');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Tipos de personajes disponibles
  const characterTypes = [
    { value: 'child', label: 'Niño/a' },
    { value: 'adult', label: 'Adulto' },
    { value: 'pet', label: 'Mascota' },
    { value: 'teddy', label: 'Peluche' },
    { value: 'fantasy', label: 'Fantasía' },
    { value: 'other', label: 'Otro' }
  ];
  
  // Limpiar el formulario
  const resetForm = () => {
    setName('');
    setType('child');
    setAge('');
    setGender('');
    setIsSubmitting(false);
  };
  
  // Crear un nuevo personaje
  const handleCreateCharacter = async () => {
    if (!name.trim()) {
      toast({
        title: "Nombre requerido",
        description: "Por favor introduce un nombre para el personaje",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Preparar los datos para el nuevo personaje
      const characterData = {
        name: name.trim(),
        type,
        age: age ? parseInt(age) : null,
        gender,
      };
      
      // Enviar la solicitud de creación
      const response = await apiRequest('POST', '/api/characters', characterData);
      
      if (!response.ok) {
        throw new Error("Error al crear el personaje");
      }
      
      // Notificar éxito
      toast({
        title: "Personaje creado",
        description: `Se ha creado el personaje "${name}" correctamente.`,
      });
      
      // Limpiar y cerrar
      resetForm();
      onOpenChange(false);
      
      // Notificar al componente padre para que actualice la lista
      onCharacterCreated();
      
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            Crear Nuevo Personaje
          </DialogTitle>
          <DialogDescription>
            Completa la información básica para crear un nuevo personaje
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-5">
          {/* Nombre del personaje */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Nombre del personaje *</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Introduce el nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          {/* Tipo de personaje */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de personaje</label>
            <div className="grid grid-cols-3 gap-2">
              {characterTypes.map((typeOption) => (
                <div 
                  key={typeOption.value}
                  className={`px-3 py-2 text-center border rounded-md cursor-pointer text-sm ${
                    type === typeOption.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/30'
                  }`}
                  onClick={() => setType(typeOption.value)}
                >
                  {typeOption.label}
                </div>
              ))}
            </div>
          </div>
          
          {/* Edad */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Edad</label>
            <input
              type="number"
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Edad (opcional)"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min="0"
              max="150"
            />
          </div>
          
          {/* Género */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Género</label>
            <div className="flex gap-4">
              <div
                className={`flex-1 px-3 py-2 text-center border rounded-md cursor-pointer ${
                  gender === 'masculino' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/30'
                }`}
                onClick={() => setGender('masculino')}
              >
                Masculino
              </div>
              <div
                className={`flex-1 px-3 py-2 text-center border rounded-md cursor-pointer ${
                  gender === 'femenino' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/30'
                }`}
                onClick={() => setGender('femenino')}
              >
                Femenino
              </div>
              <div
                className={`flex-1 px-3 py-2 text-center border rounded-md cursor-pointer ${
                  gender === 'otro' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/30'
                }`}
                onClick={() => setGender('otro')}
              >
                Otro
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleCreateCharacter} disabled={isSubmitting}>
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
  
  // Función para refrescar la lista de personajes después de crear uno nuevo
  const handleCharacterCreated = () => {
    // La recarga se hará automáticamente a través de React Query
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
                          
                          {isSelected && characterDetails[profile.id.toString()]?.specificTraits?.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {characterDetails[profile.id.toString()].specificTraits.slice(0, 3).map((trait, idx) => (
                                <span key={idx} className="inline-block px-2 py-0.5 bg-primary/10 text-primary-foreground rounded-full text-xs">
                                  {trait}
                                </span>
                              ))}
                              {characterDetails[profile.id.toString()].specificTraits.length > 3 && (
                                <span className="inline-block px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs">
                                  +{characterDetails[profile.id.toString()].specificTraits.length - 3}
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
  const [characterDetails, setCharacterDetails] = useState<{[key: string]: CharacterStoryDetails}>({});
  
  // Estado para la plantilla
  const [selectedTemplate, setSelectedTemplate] = useState("adventure");
  
  // Determinar si hay un personaje preseleccionado (de la URL)
  const urlParams = new URLSearchParams(location.search.toString());
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
    queryKey: ['/api/users/1/characters'], // Esta es la ruta correcta para obtener los personajes del usuario
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