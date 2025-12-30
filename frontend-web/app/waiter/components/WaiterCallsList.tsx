/**
 * Waiter Calls List Component
 * List of pending and acknowledged waiter calls
 */

'use client';

import { WaiterCallAlert } from './WaiterCallAlert';
import type { WaiterCall } from '../types';

interface WaiterCallsListProps {
  calls: WaiterCall[];
  onAcknowledge: (callId: string) => void;
  onComplete: (callId: string) => void;
  isLoading?: boolean;
}

export function WaiterCallsList({
  calls,
  onAcknowledge,
  onComplete,
  isLoading = false,
}: WaiterCallsListProps): JSX.Element {
  const safeCalls = Array.isArray(calls) ? calls : [];

  if (safeCalls.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <p>Nenhuma chamada pendente</p>
      </div>
    );
  }

  const sortedCalls = [...safeCalls].sort((a, b) => {
    const statusPriority = { PENDING: 0, ACKNOWLEDGED: 1, COMPLETED: 2, EXPIRED: 3 };
    if (statusPriority[a.status] !== statusPriority[b.status]) {
      return statusPriority[a.status] - statusPriority[b.status];
    }
    if (a.priority === 'URGENT' && b.priority !== 'URGENT') return -1;
    if (a.priority !== 'URGENT' && b.priority === 'URGENT') return 1;
    return new Date(a.calledAt).getTime() - new Date(b.calledAt).getTime();
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Chamadas</h2>
        <span className="text-sm text-muted-foreground">
          {safeCalls.length} pendente{safeCalls.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-3">
        {sortedCalls.map((call) => (
          <WaiterCallAlert
            key={call.id}
            call={call}
            onAcknowledge={onAcknowledge}
            onComplete={onComplete}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  );
}
