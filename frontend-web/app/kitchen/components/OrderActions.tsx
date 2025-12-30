/**
 * Order Actions Component
 * Action buttons for order state transitions
 */

'use client';

import { Button } from '@/components/ui/button';
import type { OrderStatus } from '../types';
import { Check, Play, ChefHat, X } from 'lucide-react';

interface OrderActionsProps {
  orderId: string;
  status: OrderStatus;
  onConfirm?: (orderId: string) => void;
  onStart?: (orderId: string) => void;
  onReady?: (orderId: string) => void;
  onCancel?: (orderId: string) => void;
  isLoading?: boolean;
}

export function OrderActions({
  orderId,
  status,
  onConfirm,
  onStart,
  onReady,
  onCancel,
  isLoading = false,
}: OrderActionsProps) {
  if (status === 'PENDING') {
    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onConfirm?.(orderId)}
          disabled={isLoading}
          className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
        >
          <Check className="size-4 mr-1" />
          Confirmar
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onCancel?.(orderId)}
          disabled={isLoading}
          className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
        >
          <X className="size-4" />
        </Button>
      </div>
    );
  }

  if (status === 'CONFIRMED') {
    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => onStart?.(orderId)}
          disabled={isLoading}
          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Play className="size-4 mr-1" />
          Iniciar Preparo
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onCancel?.(orderId)}
          disabled={isLoading}
          className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
        >
          <X className="size-4" />
        </Button>
      </div>
    );
  }

  if (status === 'PREPARING') {
    return (
      <Button
        size="sm"
        onClick={() => onReady?.(orderId)}
        disabled={isLoading}
        className="w-full bg-green-500 hover:bg-green-600 text-white"
      >
        <ChefHat className="size-4 mr-1" />
        Marcar Pronto
      </Button>
    );
  }

  if (status === 'READY') {
    return (
      <div className="text-xs text-center text-green-600 font-medium py-2">
        Aguardando retirada pelo garçom
      </div>
    );
  }

  return null;
}
