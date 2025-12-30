'use client';

import type { OrderStatus } from '../../types';
import { ORDER_STATUS_FLOW } from '../../constants';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const statusInfo = ORDER_STATUS_FLOW.find((s) => s.key === status);

  if (!statusInfo) {
    return null;
  }

  const Icon = statusInfo.icon;

  return (
    <span className={`order-status-badge order-status-${status}`}>
      <Icon size={14} />
      {statusInfo.label}
    </span>
  );
}
