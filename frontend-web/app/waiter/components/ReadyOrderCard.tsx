/**
 * Ready Order Card Component
 * Card for orders ready to be delivered
 */

'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Clock, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { ReadyOrder } from '../types';

interface ReadyOrderCardProps {
  order: ReadyOrder;
  onDeliver: (orderId: string) => void;
  isLoading?: boolean;
}

export function ReadyOrderCard({
  order,
  onDeliver,
  isLoading = false,
}: ReadyOrderCardProps): JSX.Element {
  const timeReady = formatDistanceToNow(new Date(order.readyAt), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <Card className="p-4 border-l-4 border-green-500 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-green-50 dark:bg-green-950/20">
            <Package className="size-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Pedido #{order.orderNumber}</h3>
            {order.tableNumber && (
              <p className="text-sm text-muted-foreground">Mesa {order.tableNumber}</p>
            )}
            {order.customerName && (
              <p className="text-xs text-muted-foreground">{order.customerName}</p>
            )}
          </div>
        </div>
        <Badge variant="secondary" className="text-xs">
          {order.totalItems} {order.totalItems === 1 ? 'item' : 'itens'}
        </Badge>
      </div>

      <div className="space-y-1 mb-3">
        {Array.isArray(order.items) && order.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {item.quantity}x {item.name}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
        <Clock className="size-3" />
        <span>Pronto {timeReady}</span>
      </div>

      <Button
        onClick={() => onDeliver(order.id)}
        disabled={isLoading}
        className="w-full"
        size="sm"
      >
        <CheckCircle className="size-4 mr-2" />
        Marcar como Entregue
      </Button>
    </Card>
  );
}
