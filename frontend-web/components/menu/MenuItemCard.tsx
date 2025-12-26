import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MenuItemCardProps {
  id: string;
  name: string;
  description?: string;
  price: number;
  isAvailable: boolean;
  category?: string;
  onAddToCart?: (item: { id: string; name: string; price: number }) => void;
}

export function MenuItemCard({
  id,
  name,
  description,
  price,
  isAvailable,
  category,
  onAddToCart,
}: MenuItemCardProps) {
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{name}</CardTitle>
          {!isAvailable && (
            <Badge variant="secondary" className="ml-2">
              Indisponível
            </Badge>
          )}
        </div>
        {description && <CardDescription className="line-clamp-2">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-end">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-orange-600">{formatPrice(price)}</span>
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
