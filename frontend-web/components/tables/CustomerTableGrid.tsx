/**
 * Customer Table Grid Component
 * Grid of tables for customer selection
 */

'use client';

import { CustomerTableCard } from './CustomerTableCard';
import type { PublicTable } from '@/lib/api/tables';

interface CustomerTableGridProps {
  tables: PublicTable[];
  selectedTableId?: string;
  onTableSelect?: (tableId: string) => void;
  emptyMessage?: string;
}

export function CustomerTableGrid({
  tables,
  selectedTableId,
  onTableSelect,
  emptyMessage = 'Nenhuma mesa disponível',
}: CustomerTableGridProps): JSX.Element {
  const safeTables = Array.isArray(tables) ? tables : [];

  if (safeTables.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="text-6xl mb-4">🪑</div>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  // Sort: available tables first, then by number
  const sortedTables = [...safeTables].sort((a, b) => {
    if (!a.isOccupied && b.isOccupied) return -1;
    if (a.isOccupied && !b.isOccupied) return 1;
    return a.number - b.number;
  });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {sortedTables.map((table) => (
        <CustomerTableCard
          key={table.id}
          table={table}
          selected={selectedTableId === table.id}
          onClick={() => onTableSelect?.(table.id)}
        />
      ))}
    </div>
  );
}
