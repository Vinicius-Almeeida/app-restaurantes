'use client';

import { useState, useEffect } from 'react';
import { MenuItemCard } from './MenuItemCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Flame, TrendingUp, ChefHat, Sparkles, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  prepTime?: number;
  servingSize?: string;
  avgRating?: number;
  ratingCount?: number;
  isFeatured?: boolean;
  isNew?: boolean;
  tags?: string[];
  badge?: string;
  recommendationType?: 'popular' | 'trending' | 'featured' | 'new' | 'personalized' | 'top_rated';
}

interface RecommendationsSectionProps {
  restaurantId: string;
  title?: string;
  type?: 'popular' | 'trending' | 'featured' | 'new' | 'personalized' | 'mixed';
  limit?: number;
  showTypeSelector?: boolean;
  onAddToCart?: (item: { id: string; name: string; price: number }) => void;
  className?: string;
}

const RECOMMENDATION_TYPES = [
  { id: 'mixed', label: 'Para Você', icon: Sparkles },
  { id: 'popular', label: 'Populares', icon: Flame },
  { id: 'trending', label: 'Em Alta', icon: TrendingUp },
  { id: 'featured', label: 'Destaques', icon: ChefHat },
  { id: 'new', label: 'Novidades', icon: Sparkles },
] as const;

export function RecommendationsSection({
  restaurantId,
  title = 'Recomendados',
  type: initialType = 'mixed',
  limit = 6,
  showTypeSelector = true,
  onAddToCart,
  className,
}: RecommendationsSectionProps) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState(initialType);

  const fetchRecommendations = async (recType: string) => {
    setLoading(true);
    setError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
      const endpoint = recType === 'mixed'
        ? `${baseUrl}/api/menu/restaurant/${restaurantId}/recommendations?limit=${limit}`
        : `${baseUrl}/api/menu/restaurant/${restaurantId}/${recType}?limit=${limit}`;

      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const result = await response.json();
      setItems(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading recommendations');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchRecommendations(selectedType);
    }
  }, [restaurantId, selectedType, limit]);

  const handleTypeChange = (newType: typeof selectedType) => {
    setSelectedType(newType);
  };

  const handleRefresh = () => {
    fetchRecommendations(selectedType);
  };

  if (error) {
    return (
      <div className={cn('py-6', className)}>
        <div className="text-center text-muted-foreground">
          <p>Não foi possível carregar as recomendações</p>
          <Button variant="ghost" size="sm" onClick={handleRefresh} className="mt-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <section className={cn('py-6', className)}>
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{title}</h2>
          <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </Button>
        </div>

        {/* Type Selector */}
        {showTypeSelector && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {RECOMMENDATION_TYPES.map((recType) => {
              const Icon = recType.icon;
              const isSelected = selectedType === recType.id;
              return (
                <Button
                  key={recType.id}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTypeChange(recType.id as typeof selectedType)}
                  className={cn(
                    'gap-2 whitespace-nowrap',
                    isSelected && 'bg-orange-600 hover:bg-orange-700'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {recType.label}
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex justify-between">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Nenhuma recomendação disponível no momento</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <MenuItemCard
              key={item.id}
              id={item.id}
              name={item.name}
              description={item.description}
              price={Number(item.price)}
              imageUrl={item.imageUrl}
              isAvailable={item.isAvailable}
              prepTime={item.prepTime}
              servingSize={item.servingSize}
              avgRating={item.avgRating ? Number(item.avgRating) : undefined}
              ratingCount={item.ratingCount}
              isFeatured={item.isFeatured}
              isNew={item.isNew}
              tags={item.tags}
              badge={item.badge}
              recommendationType={item.recommendationType}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </section>
  );
}
