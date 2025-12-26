import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RestaurantCardProps {
  id: string;
  name: string;
  slug: string;
  description?: string;
  cuisine?: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  acceptingOrders: boolean;
}

export function RestaurantCard({
  name,
  slug,
  description,
  cuisine,
  address,
  isActive,
  acceptingOrders,
}: RestaurantCardProps) {
  return (
    <Link href={`/r/${slug}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">{name}</CardTitle>
            {acceptingOrders ? (
              <Badge variant="default" className="bg-green-600">
                Aberto
              </Badge>
            ) : (
              <Badge variant="secondary">Fechado</Badge>
            )}
          </div>
          {cuisine && (
            <CardDescription className="flex items-center gap-2">
              <span>🍴</span>
              <span>{cuisine}</span>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>
          )}
          {address && (
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <span>📍</span>
              <span className="line-clamp-1">{address}</span>
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
