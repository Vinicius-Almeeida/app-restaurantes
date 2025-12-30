/**
 * Table Grid Component
 * Responsive grid layout for table cards with priority sorting
 */

'use client';

import { TableCard } from './TableCard';
import type { TableWithSession } from '../types';

interface TableGridProps {
  tables: TableWithSession[];
  onTableClick?: (tableId: string) => void;
  emptyMessage?: string;
}

export function TableGrid({
  tables,
  onTableClick,
  emptyMessage = 'Nenhuma mesa disponível',
}: TableGridProps): JSX.Element {
  const safeTables = Array.isArray(tables) ? tables : [];

  if (safeTables.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  const sortedTables = [...safeTables].sort((a, b) => {
    if (a.hasPendingCall && !b.hasPendingCall) return -1;
    if (!a.hasPendingCall && b.hasPendingCall) return 1;
    if (a.hasReadyOrders && !b.hasReadyOrders) return -1;
    if (!a.hasReadyOrders && b.hasReadyOrders) return 1;
    if (a.session && !b.session) return -1;
    if (!a.session && b.session) return 1;
    return a.number - b.number;
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {sortedTables.map((table) => (
        <TableCard
          key={table.id}
          table={table}
          onClick={() => onTableClick?.(table.id)}
        />
      ))}
    </div>
  );
}
