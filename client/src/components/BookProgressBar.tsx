import React from "react";
import { Button } from "./ui/button";
import { Check, Loader, Circle } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";

export interface BookDraft {
  id?: number;
  userId: number;
  title?: string;
  step: number;
  characterIds?: number[];
  themeId?: number;
  storyDetails?: {
    title?: string;
    description?: string;
    theme?: string;
    ageRange?: string;
    complexity?: string;
    length?: string;
    tone?: string;
    style?: string;
    subject?: string;
    setting?: string;
    additionalDetails?: string;
  };
  fontStyle?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BookProgressBarProps {
  currentStep: number;
  totalSteps: number;
  bookDraft: BookDraft | null;
  onLoadDraft: (draft: BookDraft) => void;
  onSaveDraft: () => void;
}

const BookProgressBar: React.FC<BookProgressBarProps> = ({
  currentStep,
  totalSteps,
  bookDraft,
  onLoadDraft,
  onSaveDraft
}) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Función para guardar el progreso automáticamente
  const handleSaveDraft = async () => {
    if (!bookDraft) return;
    
    try {
      setIsSaving(true);
      
      // Si el borrador ya tiene ID, actualizar, de lo contrario crear nuevo
      const method = bookDraft.id ? "PUT" : "POST";
      const url = bookDraft.id 
        ? `/api/book-drafts/${bookDraft.id}` 
        : "/api/book-drafts";
      
      const response = await apiRequest(method, url, bookDraft);
      const savedDraft = await response.json();
      
      onLoadDraft(savedDraft);
      
      toast({
        title: "Progreso guardado",
        description: "Tu libro se ha guardado correctamente",
        variant: "default",
      });
    } catch (error) {
      console.error("Error al guardar el borrador:", error);
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar tu progreso. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Guardado automático cuando cambia el paso actual
  React.useEffect(() => {
    if (bookDraft) {
      const timeoutId = setTimeout(() => {
        handleSaveDraft();
      }, 3000); // Guardar después de 3 segundos de inactividad
      
      return () => clearTimeout(timeoutId);
    }
  }, [bookDraft]);

  // Lista de pasos para la barra de progreso
  const steps = [
    { label: "Personajes", description: "Selección de personajes", step: 1 },
    { label: "Historia", description: "Detalles de la historia", step: 2 },
    { label: "Estilo", description: "Diseño y fuentes", step: 3 },
  ];

  return (
    <div className="w-full mb-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Progreso del libro</h2>
        <Button
          size="sm"
          variant="outline"
          onClick={onSaveDraft}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            "Guardar progreso"
          )}
        </Button>
      </div>

      <div className="relative">
        {/* Barra de progreso */}
        <div className="w-full h-2 bg-gray-200 rounded-full mb-4">
          <div
            className="h-2 bg-primary rounded-full"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>

        {/* Checkpoints */}
        <div className="flex justify-between">
          {steps.map((step, index) => {
            const isActive = currentStep >= step.step;
            const isCurrentStep = currentStep === step.step;

            return (
              <div
                key={step.step}
                className={`flex flex-col items-center space-y-1 ${
                  isActive ? "text-primary" : "text-gray-400"
                }`}
              >
                <div className="relative">
                  <div
                    className={`h-6 w-6 rounded-full flex items-center justify-center ${
                      isActive ? "bg-primary text-white" : "bg-gray-200"
                    }`}
                  >
                    {isActive ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </div>
                  {isCurrentStep && (
                    <div className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></div>
                  )}
                </div>
                <span className="text-xs font-medium">{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BookProgressBar;