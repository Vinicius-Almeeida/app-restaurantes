/**
 * Table Status Badge Component
 * Visual indicator for table status with color coding
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TableStatusBadgeProps {
  isEmpty: boolean;
  hasPendingCall: boolean;
  hasReadyOrders: boolean;
  className?: string;
}

export function TableStatusBadge({
  isEmpty,
  hasPendingCall,
  hasReadyOrders,
  className,
}: TableStatusBadgeProps): JSX.Element {
  // Priority: Call > Ready Orders > Occupied > Empty
  const getStatusConfig = (): {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    className?: string;
  } => {
    if (hasPendingCall) {
      return {
        label: 'Chamando',
        variant: 'destructive',
        className: 'animate-pulse bg-red-500 text-white border-red-600',
      };
    }

    if (hasReadyOrders) {
      return {
        label: 'Pedido Pronto',
        variant: 'default',
        className: 'bg-yellow-500 text-white border-yellow-600',
      };
    }

    if (!isEmpty) {
      return {
        label: 'Ocupada',
        variant: 'default',
        className: 'bg-green-500 text-white border-green-600',
      };
    }

    return {
      label: 'Vazia',
      variant: 'outline',
      className: 'bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-400',
    };
  };

  const config = getStatusConfig();

  return (
    <Badge
      variant={config.variant}
      className={cn(
        'font-semibold text-xs px-2.5 py-1',
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  );
}
