import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  const formattedPrice = (tier.pricePerWeek / 100).toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR'
  });

  return (
    <Card className={`w-full ${isRecommended ? 'border-primary' : ''} ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{tier.name}</CardTitle>
          {isRecommended && (
            <Badge variant="default" className="bg-primary text-white">
              Recomendado
            </Badge>
          )}
          {tier.discount > 0 && (
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
              Ahorra {tier.discount}%
            </Badge>
          )}
        </div>
        <CardDescription>
          {tier.books} libro{tier.books !== 1 ? 's' : ''} por semana
          <br />
          {tier.pages} página{tier.pages !== 1 ? 's' : ''} por libro
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-end">
          <span className="text-3xl font-bold">{formattedPrice}</span>
          <span className="text-sm text-muted-foreground ml-1">/semana</span>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          {tier.description}
        </p>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => onSelect(tier.id)} 
          className="w-full" 
          variant={isSelected ? "default" : isRecommended ? "default" : "outline"}
        >
          {isSelected ? "Plan seleccionado" : "Elegir este plan"}
        </Button>
      </CardFooter>
    </Card>
  );
}