import { Badge } from '@/components/ui/badge';

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
    PENDING: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
    CONFIRMED: { label: 'Confirmado', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
    PREPARING: { label: 'Preparando', className: 'bg-purple-100 text-purple-800 hover:bg-purple-100' },
    READY: { label: 'Pronto', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
    DELIVERED: { label: 'Entregue', className: 'bg-gray-100 text-gray-800 hover:bg-gray-100' },
    CANCELLED: { label: 'Cancelado', className: 'bg-red-100 text-red-800 hover:bg-red-100' },
  };

  const config = statusConfig[status];

  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  );
}
