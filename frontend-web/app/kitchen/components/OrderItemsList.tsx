/**
 * Order Items List Component
 * Displays items in an order with quantity and notes
 */

'use client';

import type { KitchenOrderItem } from '../types';

interface OrderItemsListProps {
  items: KitchenOrderItem[];
  compact?: boolean;
}

export function OrderItemsList({ items, compact = false }: OrderItemsListProps) {
  if (!Array.isArray(items) || items.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum item</p>;
  }

  return (
    <ul className="space-y-2" role="list" aria-label="Itens do pedido">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex flex-col gap-1 text-sm"
        >
          <div className="flex items-start justify-between gap-2">
            <span className="font-medium flex-1">
              <span className="inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 mr-2 text-xs font-bold bg-primary/10 text-primary rounded">
                {item.quantity}x
              </span>
              {item.name}
            </span>
          </div>

          {item.notes && !compact && (
            <p className="text-xs text-muted-foreground pl-9 italic">
              Obs: {item.notes}
            </p>
          )}

          {item.customizations && !compact && Object.keys(item.customizations).length > 0 && (
            <p className="text-xs text-orange-600 dark:text-orange-400 pl-9">
              Customizado
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
