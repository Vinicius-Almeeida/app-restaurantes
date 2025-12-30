/**
 * Table Card Component
 * Individual table card with status, session info, and actions
 */

'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, DollarSign, AlertCircle, Package } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TableStatusBadge } from './TableStatusBadge';
import type { TableWithSession } from '../types';
import { cn } from '@/lib/utils';

interface TableCardProps {
  table: TableWithSession;
  onClick?: () => void;
}

export function TableCard({ table, onClick }: TableCardProps): JSX.Element {
  const hasSession = Boolean(table.session);
  const isPriority = table.hasPendingCall || table.hasReadyOrders;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  return (
    <Card
      onClick={onClick}
      className={cn(
        'p-4 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
        isPriority && 'ring-2 ring-yellow-400 dark:ring-yellow-600',
        table.hasPendingCall && 'ring-red-500 dark:ring-red-600 animate-pulse'
      )}
      role="button"
      tabIndex={0}
      aria-label={`Mesa ${table.number}, ${hasSession ? 'ocupada' : 'vazia'}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-2xl font-bold">Mesa {table.number}</h3>
          <p className="text-xs text-muted-foreground">
            Capacidade: {table.capacity} pessoas
          </p>
        </div>
        <TableStatusBadge
          isEmpty={!hasSession}
          hasPendingCall={table.hasPendingCall}
          hasReadyOrders={table.hasReadyOrders}
        />
      </div>

      {table.hasPendingCall && (
        <div className="flex items-center gap-2 p-2 mb-3 bg-red-50 dark:bg-red-950/20 rounded-md border border-red-200 dark:border-red-800">
          <AlertCircle className="size-4 text-red-600 dark:text-red-400" />
          <span className="text-xs font-medium text-red-600 dark:text-red-400">
            Cliente chamando!
          </span>
        </div>
      )}

      {table.hasReadyOrders && (
        <div className="flex items-center gap-2 p-2 mb-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-md border border-yellow-200 dark:border-yellow-800">
          <Package className="size-4 text-yellow-600 dark:text-yellow-400" />
          <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
            {table.readyOrdersCount} pedido{table.readyOrdersCount > 1 ? 's' : ''} pronto{table.readyOrdersCount > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {hasSession && table.session && (
        <div className="space-y-2 pt-3 border-t">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="size-4" />
              <span>{table.session.memberCount} cliente{table.session.memberCount > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="size-4" />
              <span className="text-xs">
                {formatDistanceToNow(new Date(table.session.startedAt), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="size-4 text-green-600 dark:text-green-400" />
              <span className="font-semibold text-green-600 dark:text-green-400">
                {formatCurrency(table.session.totalAmount)}
              </span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {table.session.orderCount} pedido{table.session.orderCount > 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      )}
    </Card>
  );
}
