/**
 * Kanban Board Component
 * Main board with all columns for kitchen order management
 */

'use client';

import type { ActiveOrdersResponse } from '../types';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  data: ActiveOrdersResponse;
  onConfirm?: (orderId: string) => void;
  onStart?: (orderId: string) => void;
  onReady?: (orderId: string) => void;
  onCancel?: (orderId: string) => void;
  isLoading?: boolean;
}

export function KanbanBoard({
  data,
  onConfirm,
  onStart,
  onReady,
  onCancel,
  isLoading = false,
}: KanbanBoardProps) {
  const columns = [
    { title: 'Novos Pedidos', status: 'PENDING' as const, orders: data.pending },
    { title: 'Confirmados', status: 'CONFIRMED' as const, orders: data.confirmed },
    { title: 'Em Preparo', status: 'PREPARING' as const, orders: data.preparing },
    { title: 'Prontos', status: 'READY' as const, orders: data.ready },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 h-full">
      {columns.map((column) => (
        <KanbanColumn
          key={column.status}
          title={column.title}
          status={column.status}
          orders={column.orders}
          onConfirm={onConfirm}
          onStart={onStart}
          onReady={onReady}
          onCancel={onCancel}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
