import { Check, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SubscriptionTier } from "@shared/schema";

interface SubscriptionTierCardProps {
  tier: SubscriptionTier;
  isRecommended?: boolean;
  onSelect: (tierId: number) => void;
  isSelected?: boolean;
}

export function SubscriptionTierCard({ 
  tier, 
  isRecommended = false,
  onSelect,
  isSelected = false
}: SubscriptionTierCardProps) {
  // Convertir el precio a un formato legible (de céntimos a euros)
  const formattedPrice = (tier.pricePerWeek / 100).toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR'
  });

  return (
    <Card className={cn(
      "flex flex-col transition-all duration-200", 
      isRecommended && "scale-105 shadow-lg border-primary",
      isSelected && "ring-2 ring-primary ring-offset-2"
    )}>
      <CardHeader className={cn(
        "pb-3", 
        isRecommended && "bg-primary/10 rounded-t-lg"
      )}>
        {isRecommended && (
          <Badge className="self-start mb-2 bg-primary text-white">
            <Star className="h-3 w-3 mr-1 fill-current" /> Recomendado
          </Badge>
        )}
        
        <CardTitle>{tier.name}</CardTitle>
        <CardDescription>{tier.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow pb-4">
        <div className="text-3xl font-bold mb-4">
          {formattedPrice}<span className="text-sm font-normal text-muted-foreground">/semana</span>
        </div>
        
        <ul className="space-y-2 text-sm">
          <li className="flex items-start">
            <Check className="h-5 w-5 mr-2 text-green-500 shrink-0" />
            <span>{tier.books} {tier.books === 1 ? "libro" : "libros"} por semana</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 mr-2 text-green-500 shrink-0" />
            <span>{tier.pages} páginas por libro</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 mr-2 text-green-500 shrink-0" />
            <span>PDF de alta calidad</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 mr-2 text-green-500 shrink-0" />
            <span>Biblioteca digital</span>
          </li>
          {tier.discount > 0 && (
            <li className="flex items-start">
              <Check className="h-5 w-5 mr-2 text-green-500 shrink-0" />
              <span className="text-green-600 font-medium">{tier.discount}% de descuento</span>
            </li>
          )}
        </ul>
      </CardContent>
      
      <CardFooter className="pt-2">
        <Button 
          onClick={() => onSelect(tier.id)} 
          variant={isSelected ? "default" : (isRecommended ? "default" : "outline")}
          className={cn(
            "w-full",
            isRecommended && !isSelected && "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          {isSelected ? "Seleccionado" : "Seleccionar"}
        </Button>
      </CardFooter>
    </Card>
  );
}