'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  value: number;
  max?: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
};

export function RatingStars({
  value,
  max = 5,
  onChange,
  readonly = false,
  size = 'md',
  showValue = false,
  className,
}: RatingStarsProps) {
  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, rating: number) => {
    if (!readonly && onChange && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onChange(rating);
    }
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: max }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= value;
        const isPartial = !isFilled && starValue - 1 < value && value < starValue;
        const fillPercentage = isPartial ? ((value - (starValue - 1)) * 100) : 0;

        return (
          <div
            key={starValue}
            className="relative"
            onClick={() => handleClick(starValue)}
            onKeyDown={(e) => handleKeyDown(e, starValue)}
            role={readonly ? 'presentation' : 'button'}
            tabIndex={readonly ? -1 : 0}
            aria-label={readonly ? undefined : `Rate ${starValue} out of ${max} stars`}
          >
            <Star
              className={cn(
                sizeClasses[size],
                'transition-all duration-200',
                readonly
                  ? 'cursor-default'
                  : 'cursor-pointer hover:scale-110 active:scale-95',
                isFilled || isPartial
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-none text-gray-300 hover:text-yellow-400'
              )}
            />
            {isPartial && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillPercentage}%` }}
              >
                <Star
                  className={cn(
                    sizeClasses[size],
                    'fill-yellow-400 text-yellow-400'
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
      {showValue && (
        <span className="ml-2 text-sm font-medium text-muted-foreground">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}
