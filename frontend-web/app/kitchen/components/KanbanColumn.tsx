/**
 * Kanban Column Component
 * Column container for order cards with status header
 */

'use client';

import type { KitchenOrder, OrderStatus } from '../types';
import { OrderCard } from './OrderCard';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  title: string;
  status: OrderStatus;
  orders: KitchenOrder[];
  onConfirm?: (orderId: string) => void;
  onStart?: (orderId: string) => void;
  onReady?: (orderId: string) => void;
  onCancel?: (orderId: string) => void;
  isLoading?: boolean;
}

const columnConfig: Record<OrderStatus, { bgColor: string; borderColor: string; textColor: string }> = {
  PENDING: {
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    textColor: 'text-blue-700',
  },
  CONFIRMED: {
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    textColor: 'text-purple-700',
  },
  PREPARING: {
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
    textColor: 'text-orange-700',
  },
  READY: {
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
    textColor: 'text-green-700',
  },
  DELIVERED: {
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-300',
    textColor: 'text-slate-700',
  },
  CANCELLED: {
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    textColor: 'text-red-700',
  },
};

export function KanbanColumn({
  title,
  status,
  orders,
  onConfirm,
  onStart,
  onReady,
  onCancel,
  isLoading = false,
}: KanbanColumnProps) {
  const safeOrders = Array.isArray(orders) ? orders : [];
  const config = columnConfig[status];

  return (
    <div className="flex flex-col h-full min-w-[300px]">
      <div
        className={cn(
          'border-2 rounded-t-lg px-4 py-3 sticky top-0 z-10',
          config.bgColor,
          config.borderColor
        )}
      >
        <div className="flex items-center justify-between">
          <h2 className={cn('text-lg font-bold', config.textColor)}>
            {title}
          </h2>
          <span
            className={cn(
              'text-sm font-semibold bg-white rounded-full px-3 py-1 border-2',
              config.textColor,
              config.borderColor
            )}
          >
            {safeOrders.length}
          </span>
        </div>
      </div>

      <div
        className={cn(
          'flex-1 border-x-2 border-b-2 rounded-b-lg p-4 overflow-y-auto',
          config.bgColor,
          config.borderColor
        )}
        style={{ minHeight: '200px', maxHeight: 'calc(100vh - 280px)' }}
      >
        <div className="space-y-3">
          {safeOrders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground font-medium">
                Nenhum pedido
              </p>
            </div>
          ) : (
            safeOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onConfirm={onConfirm}
                onStart={onStart}
                onReady={onReady}
                onCancel={onCancel}
                isLoading={isLoading}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
