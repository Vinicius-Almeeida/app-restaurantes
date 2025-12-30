/**
 * Review Card Component
 * Displays a customer review with ratings and response
 */

'use client';

import { MessageSquare, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RatingStars } from './RatingStars';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Review {
  id: string;
  userName: string;
  overallRating: number;
  foodRating?: number;
  serviceRating?: number;
  ambianceRating?: number;
  waitTimeRating?: number;
  valueRating?: number;
  comment?: string;
  response?: string;
  respondedAt?: string;
  createdAt: string;
}

interface ReviewCardProps {
  review: Review;
  onRespond?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
  className?: string;
}

const categoryLabels: Record<string, string> = {
  food: 'Comida',
  service: 'Atendimento',
  ambiance: 'Ambiente',
  waitTime: 'Tempo de espera',
  value: 'Custo-benefício',
};

export function ReviewCard({
  review,
  onRespond,
  onDelete,
  showActions = false,
  className,
}: ReviewCardProps) {
  const categoryRatings = [
    { key: 'food', value: review.foodRating },
    { key: 'service', value: review.serviceRating },
    { key: 'ambiance', value: review.ambianceRating },
    { key: 'waitTime', value: review.waitTimeRating },
    { key: 'value', value: review.valueRating },
  ].filter((cat) => cat.value !== undefined && cat.value !== null);

  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {review.userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium">{review.userName}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="size-3" />
                <time dateTime={review.createdAt}>
                  {format(new Date(review.createdAt), "d 'de' MMMM, yyyy", {
                    locale: ptBR,
                  })}
                </time>
              </div>
            </div>
          </div>
          <RatingStars value={review.overallRating} readonly size="md" showValue />
        </div>

        {showActions && (
          <div className="flex gap-2">
            {!review.response && onRespond && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRespond(review.id)}
                className="gap-2"
              >
                <MessageSquare className="size-4" />
                Responder
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(review.id)}
              >
                Excluir
              </Button>
            )}
          </div>
        )}
      </div>

      {categoryRatings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {categoryRatings.map(({ key, value }) => (
            <div key={key} className="flex items-center justify-between gap-2">
              <span className="text-sm text-muted-foreground">
                {categoryLabels[key]}
              </span>
              <RatingStars value={value!} readonly size="sm" />
            </div>
          ))}
        </div>
      )}

      {review.comment && (
        <div className="mb-4">
          <p className="text-sm leading-relaxed">{review.comment}</p>
        </div>
      )}

      {review.response && (
        <div className="mt-4 pt-4 border-t">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="size-4 text-primary" />
              <span className="text-sm font-medium">Resposta do restaurante</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{review.response}</p>
            {review.respondedAt && (
              <p className="text-xs text-muted-foreground">
                {format(
                  new Date(review.respondedAt),
                  "d 'de' MMM 'às' HH:mm",
                  { locale: ptBR }
                )}
              </p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
