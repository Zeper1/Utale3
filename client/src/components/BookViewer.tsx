import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Download, Share, 
  ZoomIn, ZoomOut, BookOpen, Maximize2, X, 
  Volume2, VolumeX
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface BookViewerProps {
  book: Book;
  onClose?: () => void;
}

const BookViewer = ({ book, onClose }: BookViewerProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [autoPlaySpeed, setAutoPlaySpeed] = useState(15); // segundos por página
  const [pageDirection, setPageDirection] = useState<'left' | 'right'>('right');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const synth = useRef<SpeechSynthesis | null>(null);
  const { toast } = useToast();
  
  const bookContent = book.content as any;
  
  useEffect(() => {
    // Inicializar sintetizador de voz
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synth.current = window.speechSynthesis;
    }
    
    // Limpiar al desmontar
    return () => {
      if (synth.current) {
        synth.current.cancel();
      }
    };
  }, []);
  
  useEffect(() => {
    if (isReading) {
      const timer = setTimeout(() => {
        if (currentPage < totalPages - 1) {
          handleNextPage();
        } else {
          setIsReading(false);
          toast({
            title: "Lectura completada",
            description: "Has llegado al final del libro"
          });
        }
      }, autoPlaySpeed * 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isReading, currentPage]);
  
  // Función para entrar/salir de pantalla completa
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        toast({
          title: "Error",
          description: "No se pudo activar el modo pantalla completa",
          variant: "destructive"
        });
      });
    } else {
      document.exitFullscreen();
    }
  };
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(Boolean(document.fullscreenElement));
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Función para leer texto en voz alta
  const readPageAloud = () => {
    if (!synth.current) {
      toast({
        title: "No disponible",
        description: "La función de lectura no está disponible en tu navegador",
        variant: "destructive"
      });
      return;
    }
    
    synth.current.cancel(); // Detener cualquier lectura previa
    
    const utterance = new SpeechSynthesisUtterance(currentPageData.text);
    utterance.lang = 'es-ES';
    synth.current.speak(utterance);
  };
  
  // Función para detener la lectura
  const stopReading = () => {
    if (synth.current) {
      synth.current.cancel();
    }
  };
  
  if (!bookContent || !bookContent.pages || !bookContent.pages.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h3 className="text-xl font-medium mb-2">No hay vista previa disponible</h3>
        <p className="text-muted-foreground">Este libro aún no tiene contenido.</p>
      </div>
    );
  }
  
  const totalPages = bookContent.pages.length;
  
  const handlePrevPage = () => {
    setPageDirection('left');
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : prev));
    if (audioEnabled && synth.current) {
      synth.current.cancel();
      setTimeout(readPageAloud, 500); // Pequeño retraso para mejor experiencia
    }
  };
  
  const handleNextPage = () => {
    setPageDirection('right');
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : prev));
    if (audioEnabled && synth.current) {
      synth.current.cancel();
      setTimeout(readPageAloud, 500); // Pequeño retraso para mejor experiencia
    }
  };
  
  // Sonido de paso de página
  const pageTurnSound = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    // Crear elemento de audio para el sonido de paso de página
    if (typeof window !== 'undefined') {
      pageTurnSound.current = new Audio('https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3');
      pageTurnSound.current.volume = 0.3; // Reducir volumen para no ser intrusivo
    }
  }, []);
  
  // Función para reproducir el sonido de paso de página
  const playPageTurnSound = () => {
    if (pageTurnSound.current) {
      pageTurnSound.current.currentTime = 0; // Reiniciar el sonido
      pageTurnSound.current.play().catch(err => {
        // Manejar error silenciosamente (los navegadores pueden bloquear la reproducción automática)
        console.log("No se pudo reproducir el sonido:", err);
      });
    }
  };
  
  useEffect(() => {
    // Manejar teclas de navegación
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        if (currentPage > 0) {
          playPageTurnSound();
          handlePrevPage();
        }
      } else if (e.key === 'ArrowRight') {
        if (currentPage < totalPages - 1) {
          playPageTurnSound();
          handleNextPage();
        }
      } else if (e.key === 'Escape' && isFullScreen) {
        document.exitFullscreen();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentPage, isFullScreen, totalPages]);
  
  // Toggle audio narration
  const toggleAudio = () => {
    if (audioEnabled) {
      stopReading();
      setAudioEnabled(false);
    } else {
      setAudioEnabled(true);
      readPageAloud();
    }
  };
  
  // Toggle auto-play reading mode
  const toggleReading = () => {
    if (isReading) {
      setIsReading(false);
    } else {
      setIsReading(true);
      if (audioEnabled) {
        readPageAloud();
      }
    }
  };
  
  const currentPageData = bookContent.pages[currentPage];
  
  // Variantes mejoradas para la animación de página con efecto 3D
  const pageVariants = {
    enter: (direction: 'left' | 'right') => ({
      x: direction === 'right' ? 1000 : -1000,
      opacity: 0,
      rotateY: direction === 'right' ? 45 : -45,
      scale: 0.85
    }),
    center: {
      x: 0,
      opacity: 1,
      rotateY: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    },
    exit: (direction: 'left' | 'right') => ({
      x: direction === 'right' ? -1000 : 1000,
      opacity: 0,
      rotateY: direction === 'right' ? -45 : 45,
      scale: 0.85,
      transition: { 
        duration: 0.5 
      }
    })
  };
  
  // Efecto de sombra para simular la curvatura del libro
  const pageShadowVariants = {
    enter: (direction: 'left' | 'right') => ({
      opacity: 0
    }),
    center: {
      opacity: 1
    },
    exit: (direction: 'left' | 'right') => ({
      opacity: 0
    })
  };
  
  return (
    <div ref={containerRef} className={cn(
      "flex flex-col h-full transition-all duration-300",
      isFullScreen && "fixed inset-0 z-50 bg-background p-6"
    )}>
      {/* Header con título y controles principales */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          {isFullScreen && (
            <Button variant="ghost" size="sm" onClick={() => document.exitFullscreen()}>
              <X className="h-4 w-4 mr-2" />
              Salir
            </Button>
          )}
        </div>
        
        <h2 className={cn(
          "text-2xl font-bold font-heading bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text text-center flex-1",
          isFullScreen && "text-3xl"
        )}>
          {book.title}
        </h2>
        
        <div className="flex items-center gap-2 flex-1 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullScreen}
            title={isFullScreen ? "Salir de pantalla completa" : "Pantalla completa"}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          
          <Button 
            variant={audioEnabled ? "default" : "ghost"} 
            size="sm"
            onClick={toggleAudio}
            title={audioEnabled ? "Desactivar narración" : "Activar narración"}
          >
            {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          
          <Button 
            variant={isReading ? "default" : "ghost"} 
            size="sm"
            onClick={toggleReading}
            title={isReading ? "Detener lectura automática" : "Iniciar lectura automática"}
          >
            <BookOpen className="h-4 w-4" />
            {isReading && <span className="ml-2">Auto</span>}
          </Button>
        </div>
      </div>
      
      {/* Book viewer */}
      <div className="flex-1 flex items-center justify-center perspective-1000">
        <div className="relative w-full max-w-4xl mx-auto aspect-[16/10] book-container">
          {/* Controles de navegación de libro */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-20 flex justify-between px-4 pointer-events-none">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-full bg-background/80 hover:bg-background/90 shadow-lg pointer-events-auto",
                currentPage === 0 && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => {
                if(currentPage > 0) {
                  playPageTurnSound();
                  handlePrevPage();
                }
              }}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-full bg-background/80 hover:bg-background/90 shadow-lg pointer-events-auto",
                currentPage === totalPages - 1 && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => {
                if(currentPage < totalPages - 1) {
                  playPageTurnSound();
                  handleNextPage();
                }
              }}
              disabled={currentPage === totalPages - 1}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
          
          {/* Libro renderizado con estilos de libro físico */}
          <div className="w-full h-full relative book-wrapper bg-[#f0ede5] rounded-lg shadow-[0_20px_25px_-5px_rgba(0,0,0,0.5),0_10px_10px_-5px_rgba(0,0,0,0.1)]">
            {/* Encuadernación central del libro */}
            <div className="absolute left-1/2 top-0 bottom-0 w-8 -ml-4 z-10 bg-gradient-to-r from-[#dbd7cc]/90 via-[#666]/10 to-[#dbd7cc]/90 rounded"></div>
            
            {/* Sombra de la página */}
            <AnimatePresence initial={false} custom={pageDirection}>
              <motion.div
                key={`shadow-${currentPage}`}
                custom={pageDirection}
                variants={pageShadowVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className={cn(
                  "absolute inset-0 z-0 pointer-events-none",
                  pageDirection === 'right' ? 
                    "bg-gradient-to-l from-transparent via-transparent to-black/10" :
                    "bg-gradient-to-r from-transparent via-transparent to-black/10"
                )}
              />
            </AnimatePresence>
            
            {/* Animación de página con efecto 3D */}
            <AnimatePresence initial={false} custom={pageDirection} mode="wait">
              <motion.div
                key={currentPage}
                custom={pageDirection}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                style={{ 
                  transformStyle: "preserve-3d",
                  perspective: "1000px" 
                }}
                className="h-full w-full flex flex-col md:flex-row bg-white rounded overflow-hidden shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)]"
              >
                {/* Imagen */}
                <div className="w-full md:w-1/2 h-48 md:h-full relative bg-white">
                  {currentPageData.imageUrl ? (
                    <div 
                      className="w-full h-full overflow-hidden cursor-pointer p-1"
                      onClick={() => setImageModalOpen(true)}
                      style={{ 
                        transform: `scale(${zoomLevel})`,
                        transition: 'transform 0.3s ease'
                      }}
                    >
                      <img
                        src={currentPageData.imageUrl}
                        alt={`Page ${currentPage + 1}`}
                        className="w-full h-full object-contain rounded-sm"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    </div>
                  )}
                  
                  {/* Controles de zoom */}
                  <div className="absolute bottom-3 right-3 flex bg-white/90 rounded-full p-1 shadow-md">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setZoomLevel(Math.max(1, zoomLevel - 0.1))}
                      disabled={zoomLevel <= 1}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
                      disabled={zoomLevel >= 2}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Texto */}
                <div className="w-full md:w-1/2 p-6 flex flex-col justify-center bg-[#fffdf9] border-l border-[#e6e2d9]">
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-4">
                      <Badge variant="outline" className="text-xs font-semibold px-3 py-1">
                        Página {currentPage + 1} de {totalPages}
                      </Badge>
                      {audioEnabled && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={readPageAloud}
                          className="h-8 text-xs"
                        >
                          <Volume2 className="h-3 w-3 mr-1" />
                          Leer en voz alta
                        </Button>
                      )}
                    </div>
                    <p className="text-lg leading-relaxed font-serif">{currentPageData.text}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Estilos CSS personalizados para el libro */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .perspective-1000 {
          perspective: 1000px;
        }
        .book-container {
          transform-style: preserve-3d;
          filter: drop-shadow(0 25px 25px rgba(0, 0, 0, 0.15));
        }
        .book-wrapper {
          transform-style: preserve-3d;
          transform: rotateX(3deg);
          transition: transform 0.5s ease;
        }
        .book-wrapper:hover {
          transform: rotateX(0deg);
        }
      `}} />
      
      {/* Controles de lectura */}
      {isReading && (
        <div className="mt-4 max-w-xs mx-auto w-full">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs">Velocidad:</span>
            <span className="text-xs">{autoPlaySpeed}s</span>
          </div>
          <Slider
            value={[autoPlaySpeed]}
            min={5}
            max={30}
            step={1}
            onValueChange={(value) => setAutoPlaySpeed(value[0])}
          />
        </div>
      )}
      
      {/* Book controls */}
      <div className="flex justify-center mt-4 gap-4">
        <Button variant="outline" size="sm" onClick={() => setCurrentPage(0)}>
          Primera página
        </Button>
        <Button 
          variant="default" 
          size="sm"
          onClick={() => window.open(`/api/books/${book.id}/download`, '_blank')}
        >
          <Download className="h-4 w-4 mr-2" />
          Descargar PDF
        </Button>
        <Button variant="outline" size="sm">
          <Share className="h-4 w-4 mr-2" />
          Compartir
        </Button>
      </div>
      
      {/* Modal de imagen ampliada */}
      <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden bg-transparent border-none">
          {currentPageData?.imageUrl && (
            <div className="relative">
              <img
                src={currentPageData.imageUrl}
                alt={`Ilustración página ${currentPage + 1}`}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 bg-background/30 hover:bg-background/50"
                onClick={() => setImageModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookViewer;