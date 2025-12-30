/**
 * Order Card Component
 * Individual order card for Kanban board
 */

'use client';

import { Card } from '@/components/ui/card';
import type { KitchenOrder } from '../types';
import { OrderItemsList } from './OrderItemsList';
import { PriorityBadge } from './PriorityBadge';
import { WaitTimeBadge } from './WaitTimeBadge';
import { OrderActions } from './OrderActions';
import { UtensilsCrossed } from 'lucide-react';

interface OrderCardProps {
  order: KitchenOrder;
  onConfirm?: (orderId: string) => void;
  onStart?: (orderId: string) => void;
  onReady?: (orderId: string) => void;
  onCancel?: (orderId: string) => void;
  isLoading?: boolean;
}

export function OrderCard({
  order,
  onConfirm,
  onStart,
  onReady,
  onCancel,
  isLoading = false,
}: OrderCardProps) {
  return (
    <Card className="p-4 hover:shadow-lg transition-shadow bg-white border-2">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <UtensilsCrossed className="size-4 text-muted-foreground flex-shrink-0" />
            <h3 className="text-lg font-bold truncate">
              #{order.orderNumber}
            </h3>
          </div>

          {order.tableNumber && (
            <p className="text-sm text-muted-foreground font-medium">
              Mesa {order.tableNumber}
            </p>
          )}

          {order.customerName && (
            <p className="text-xs text-muted-foreground truncate">
              {order.customerName}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-1">
          <PriorityBadge priority={order.priority} />
          <WaitTimeBadge createdAt={order.createdAt} />
        </div>
      </div>

      <div className="mb-3">
        <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">
          Itens ({order.totalItems})
        </div>
        <OrderItemsList items={order.items} compact />
      </div>

      {order.notes && (
        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-xs text-yellow-800">
            <span className="font-semibold">Obs:</span> {order.notes}
          </p>
        </div>
      )}

      <div className="pt-3 border-t">
        <OrderActions
          orderId={order.id}
          status={order.status}
          onConfirm={onConfirm}
          onStart={onStart}
          onReady={onReady}
          onCancel={onCancel}
          isLoading={isLoading}
        />
      </div>
    </Card>
  );
}
