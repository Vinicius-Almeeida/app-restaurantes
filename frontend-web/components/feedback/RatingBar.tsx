'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingBarProps {
  rating: number;
  count: number;
  total: number;
  className?: string;
}

export function RatingBar({ rating, count, total, className }: RatingBarProps) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex items-center gap-1 min-w-[3rem]">
        <span className="text-sm font-medium">{rating}</span>
        <Star className="size-3 fill-yellow-400 text-yellow-400" />
      </div>

      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-yellow-400 transition-all duration-500 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${rating} stars: ${count} reviews (${percentage.toFixed(1)}%)`}
        />
      </div>

      <span className="text-sm text-muted-foreground min-w-[3rem] text-right">
        {count}
      </span>
    </div>
  );
}

interface RatingDistributionProps {
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  total: number;
  className?: string;
}

export function RatingDistribution({
  distribution,
  total,
  className,
}: RatingDistributionProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {[5, 4, 3, 2, 1].map((rating) => (
        <RatingBar
          key={rating}
          rating={rating}
          count={distribution[rating as keyof typeof distribution]}
          total={total}
        />
      ))}
    </div>
  );
}
