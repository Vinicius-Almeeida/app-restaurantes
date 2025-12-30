/**
 * Ready Orders List Component
 * List of all orders ready for delivery
 */

'use client';

import { ReadyOrderCard } from './ReadyOrderCard';
import type { ReadyOrder } from '../types';

interface ReadyOrdersListProps {
  orders: ReadyOrder[];
  onDeliver: (orderId: string) => void;
  isLoading?: boolean;
}

export function ReadyOrdersList({
  orders,
  onDeliver,
  isLoading = false,
}: ReadyOrdersListProps): JSX.Element {
  const safeOrders = Array.isArray(orders) ? orders : [];

  if (safeOrders.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <p>Nenhum pedido pronto para entrega</p>
      </div>
    );
  }

  const sortedOrders = [...safeOrders].sort(
    (a, b) => new Date(a.readyAt).getTime() - new Date(b.readyAt).getTime()
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Pedidos Prontos</h2>
        <span className="text-sm text-muted-foreground">
          {safeOrders.length} pedido{safeOrders.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {sortedOrders.map((order) => (
          <ReadyOrderCard
            key={order.id}
            order={order}
            onDeliver={onDeliver}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  );
}
