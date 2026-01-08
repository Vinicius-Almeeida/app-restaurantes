/**
 * Customer Table Card Component
 * Card showing table status for customers to select
 */

'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import type { PublicTable } from '@/lib/api/tables';
import { cn } from '@/lib/utils';

interface CustomerTableCardProps {
  table: PublicTable;
  onClick?: () => void;
  selected?: boolean;
}

export function CustomerTableCard({ table, onClick, selected }: CustomerTableCardProps): JSX.Element {
  const isAvailable = !table.isOccupied;

  return (
    <Card
      onClick={isAvailable ? onClick : undefined}
      className={cn(
        'p-4 transition-all',
        isAvailable
          ? 'cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] hover:border-orange-400'
          : 'opacity-60 cursor-not-allowed bg-gray-50',
        selected && 'ring-2 ring-orange-500 border-orange-500'
      )}
      role="button"
      tabIndex={isAvailable ? 0 : -1}
      aria-label={`Mesa ${table.number}, ${isAvailable ? 'disponível' : 'ocupada'}`}
      aria-disabled={!isAvailable}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-2xl font-bold">Mesa {table.number}</h3>
        {isAvailable ? (
          <Badge className="bg-green-600 hover:bg-green-700">
            Disponível
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Ocupada
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="size-4" />
        <span>
          {table.isOccupied
            ? `${table.currentOccupancy}/${table.capacity} pessoas`
            : `Capacidade: ${table.capacity} pessoas`}
        </span>
      </div>
    </Card>
  );
}
