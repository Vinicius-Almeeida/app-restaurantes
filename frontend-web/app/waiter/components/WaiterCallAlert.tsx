/**
 * Waiter Call Alert Component
 * Urgent pulsating alert for customer calls
 */

'use client';

import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { WaiterCall } from '../types';

interface WaiterCallAlertProps {
  call: WaiterCall;
  onAcknowledge: (callId: string) => void;
  onComplete: (callId: string) => void;
  isLoading?: boolean;
}

export function WaiterCallAlert({
  call,
  onAcknowledge,
  onComplete,
  isLoading = false,
}: WaiterCallAlertProps): JSX.Element {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play notification sound on mount if urgent
  useEffect(() => {
    if (call.priority === 'URGENT' && call.status === 'PENDING') {
      try {
        audioRef.current = new Audio('/sounds/urgent-call.mp3');
        audioRef.current.loop = false;
        audioRef.current.play().catch(err => console.warn('Audio play failed:', err));
      } catch (error) {
        console.warn('Audio initialization failed:', error);
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [call.priority, call.status]);

  const isPending = call.status === 'PENDING';
  const isAcknowledged = call.status === 'ACKNOWLEDGED';
  const isUrgent = call.priority === 'URGENT';

  const timeAgo = formatDistanceToNow(new Date(call.calledAt), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <Card
      className={`p-4 border-l-4 ${
        isUrgent
          ? 'border-red-500 bg-red-50 dark:bg-red-950/20 animate-pulse'
          : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`p-2 rounded-full ${
            isUrgent
              ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
              : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400'
          }`}
        >
          <Bell className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg">Mesa {call.tableNumber}</h3>
            {isUrgent && (
              <Badge variant="destructive" className="text-xs">
                URGENTE
              </Badge>
            )}
          </div>

          {call.reason && (
            <p className="text-sm text-muted-foreground mb-2">{call.reason}</p>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="w-3 h-3" />
            <span>{timeAgo}</span>
          </div>

          {isAcknowledged && call.waiterName && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
              Atendido por: {call.waiterName}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {isPending && (
            <Button
              size="sm"
              onClick={() => onAcknowledge(call.id)}
              disabled={isLoading}
              className="whitespace-nowrap"
            >
              Atender
            </Button>
          )}

          {isAcknowledged && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onComplete(call.id)}
              disabled={isLoading}
              className="whitespace-nowrap"
            >
              Concluir
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
