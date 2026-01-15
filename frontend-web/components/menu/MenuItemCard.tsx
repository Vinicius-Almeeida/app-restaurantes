import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Star, Flame, Sparkles, ChefHat, Users } from 'lucide-react';

interface MenuItemCardProps {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  // Enhanced fields
  prepTime?: number;
  servingSize?: string;
  avgRating?: number;
  ratingCount?: number;
  isFeatured?: boolean;
  isNew?: boolean;
  tags?: string[];
  badge?: string;
  recommendationType?: 'popular' | 'trending' | 'featured' | 'new' | 'personalized' | 'top_rated';
  onAddToCart?: (item: { id: string; name: string; price: number }) => void;
}

export function MenuItemCard({
  id,
  name,
  description,
  price,
  imageUrl,
  isAvailable,
  prepTime,
  servingSize,
  avgRating,
  ratingCount,
  isFeatured,
  isNew,
  tags,
  badge,
  recommendationType,
  onAddToCart,
}: MenuItemCardProps) {
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPrepTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const getBadgeConfig = () => {
    if (badge) {
      return { label: badge, variant: 'default' as const, icon: Sparkles };
    }
    if (recommendationType === 'trending') {
      return { label: 'Em Alta', variant: 'destructive' as const, icon: Flame };
    }
    if (recommendationType === 'featured' || isFeatured) {
      return { label: 'Destaque do Chef', variant: 'default' as const, icon: ChefHat };
    }
    if (recommendationType === 'new' || isNew) {
      return { label: 'Novidade', variant: 'secondary' as const, icon: Sparkles };
    }
    if (recommendationType === 'popular') {
      return { label: 'Popular', variant: 'outline' as const, icon: Flame };
    }
    return null;
  };

  const badgeConfig = getBadgeConfig();

  return (
    <Card className="h-full flex flex-col overflow-hidden group hover:shadow-lg transition-shadow">
      {/* Image Section */}
      {imageUrl && (
        <div className="relative h-40 w-full overflow-hidden">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Badge overlay */}
          {badgeConfig && (
            <div className="absolute top-2 left-2">
              <Badge variant={badgeConfig.variant} className="gap-1">
                <badgeConfig.icon className="h-3 w-3" />
                {badgeConfig.label}
              </Badge>
            </div>
          )}
          {!isAvailable && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="secondary" className="text-lg">
                Indisponível
              </Badge>
            </div>
          )}
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg line-clamp-1">{name}</CardTitle>
          {!imageUrl && badgeConfig && (
            <Badge variant={badgeConfig.variant} className="gap-1 shrink-0">
              <badgeConfig.icon className="h-3 w-3" />
              {badgeConfig.label}
            </Badge>
          )}
          {!imageUrl && !isAvailable && (
            <Badge variant="secondary" className="shrink-0">
              Indisponível
            </Badge>
          )}
        </div>
        {description && (
          <CardDescription className="line-clamp-2">{description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-end gap-3">
        {/* Info Row: Prep Time, Rating, Serving Size */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {prepTime && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatPrepTime(prepTime)}</span>
            </div>
          )}
          {avgRating !== undefined && avgRating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{avgRating.toFixed(1)}</span>
              {ratingCount !== undefined && ratingCount > 0 && (
                <span className="text-xs">({ratingCount})</span>
              )}
            </div>
          )}
          {servingSize && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{servingSize}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Price and Add Button */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-2xl font-bold text-orange-600">
            {formatPrice(price)}
          </span>
          <Button
            onClick={() => onAddToCart?.({ id, name, price })}
            disabled={!isAvailable}
            size="sm"
          >
            Adicionar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
