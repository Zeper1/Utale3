import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { SubscriptionTierCard } from "./SubscriptionTierCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import type { SubscriptionTier } from "@shared/schema";

interface SubscriptionTierSelectorProps {
  onSelectTier: (tier: SubscriptionTier) => void;
  initialTierId?: number;
}

export function SubscriptionTierSelector({ onSelectTier, initialTierId }: SubscriptionTierSelectorProps) {
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [recommendedTiers, setRecommendedTiers] = useState<SubscriptionTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTierId, setSelectedTierId] = useState<number | undefined>(initialTierId);
  const [view, setView] = useState<'recommended' | 'all'>('recommended');

  useEffect(() => {
    const fetchTiers = async () => {
      try {
        setLoading(true);
        
        // Obtener todos los niveles
        const allTiersRes = await apiRequest("GET", "/api/subscription-tiers");
        const allTiers = await allTiersRes.json();
        setTiers(allTiers);
        
        // Obtener niveles recomendados
        const recommendedTiersRes = await apiRequest("GET", "/api/subscription-tiers/recommended");
        const recommendedTiers = await recommendedTiersRes.json();
        setRecommendedTiers(recommendedTiers);
        
        setLoading(false);
      } catch (err) {
        setError("Error al cargar los planes de suscripción");
        setLoading(false);
      }
    };
    
    fetchTiers();
  }, []);

  const handleSelectTier = (tierId: number) => {
    setSelectedTierId(tierId);
    const selectedTier = [...tiers, ...recommendedTiers].find(t => t.id === tierId);
    if (selectedTier) {
      onSelectTier(selectedTier);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const tiersToShow = view === 'recommended' ? recommendedTiers : tiers;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="recommended" onValueChange={(value) => setView(value as 'recommended' | 'all')}>
        <TabsList className="mb-6">
          <TabsTrigger value="recommended">Planes recomendados</TabsTrigger>
          <TabsTrigger value="all">Todos los planes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recommended" className="mt-0">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {recommendedTiers.map(tier => (
              <SubscriptionTierCard
                key={tier.id}
                tier={tier}
                isRecommended={recommendedTiers.indexOf(tier) === 2} // Plan "Avanzado" es el recomendado
                onSelect={handleSelectTier}
                isSelected={selectedTierId === tier.id}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="all" className="mt-0">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {tiers.map(tier => (
              <SubscriptionTierCard
                key={tier.id}
                tier={tier}
                isRecommended={false}
                onSelect={handleSelectTier}
                isSelected={selectedTierId === tier.id}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}