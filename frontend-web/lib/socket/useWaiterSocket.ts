/**
 * Waiter Socket Hook
 * Handles real-time waiter notifications and table attention
 */

'use client';

import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useSocket } from './useSocket';
import { SOCKET_EVENTS, getRoomNames } from './types';
import type {
  WaiterCalledPayload,
  TableNeedsAttentionPayload,
} from './types';

interface UseWaiterSocketOptions {
  restaurantId?: string;
  onWaiterCalled?: (payload: WaiterCalledPayload) => void;
  onTableNeedsAttention?: (payload: TableNeedsAttentionPayload) => void;
  enableNotifications?: boolean;
  enableSounds?: boolean;
}

const PRIORITY_LABELS = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
};

const REASON_LABELS = {
  CALL_WAITER: 'Chamado do cliente',
  PAYMENT_READY: 'Pronto para pagar',
  COMPLAINT: 'Reclamação',
};

export function useWaiterSocket(options: UseWaiterSocketOptions = {}) {
  const {
    restaurantId,
    onWaiterCalled,
    onTableNeedsAttention,
    enableNotifications = true,
    enableSounds = true,
  } = options;

  const { socket, state, joinRoom, leaveRoom } = useSocket();

  // Join waiter room on mount
  useEffect(() => {
    if (!socket || !state.connected || !restaurantId) return;

    const room = getRoomNames.waiter(restaurantId);
    joinRoom(room);

    return () => {
      leaveRoom(room);
    };
  }, [socket, state.connected, restaurantId, joinRoom, leaveRoom]);

  /**
   * Play notification sound
   */
  const playSound = useCallback((priority: 'LOW' | 'MEDIUM' | 'HIGH') => {
    if (!enableSounds || typeof window === 'undefined') return;

    try {
      const soundFile =
        priority === 'HIGH'
          ? '/sounds/urgent-call.mp3'
          : '/sounds/waiter-call.mp3';

      const audio = new Audio(soundFile);
      audio.play().catch(err => console.warn('Could not play sound:', err));
    } catch (error) {
      console.warn('Sound playback error:', error);
    }
  }, [enableSounds]);

  // Listen to waiter called events
  useEffect(() => {
    if (!socket) return;

    const handleWaiterCalled = (payload: WaiterCalledPayload) => {
      console.log('[WaiterSocket] Waiter called:', payload);

      playSound('MEDIUM');

      if (enableNotifications) {
        toast.info('Chamado de cliente', {
          description: `Mesa ${payload.tableNumber} - ${payload.customerName}${
            payload.reason ? `: ${payload.reason}` : ''
          }`,
          duration: 10000,
          action: {
            label: 'Atender',
            onClick: () => {
              // Navigate to table or acknowledge call
            },
          },
        });
      }

      onWaiterCalled?.(payload);
    };

    socket.on(SOCKET_EVENTS.WAITER_CALLED, handleWaiterCalled);

    return () => {
      socket.off(SOCKET_EVENTS.WAITER_CALLED, handleWaiterCalled);
    };
  }, [socket, onWaiterCalled, enableNotifications, playSound]);

  // Listen to table needs attention
  useEffect(() => {
    if (!socket) return;

    const handleTableNeedsAttention = (payload: TableNeedsAttentionPayload) => {
      console.log('[WaiterSocket] Table needs attention:', payload);

      playSound(payload.priority);

      if (enableNotifications) {
        const isUrgent = payload.priority === 'HIGH';

        toast[isUrgent ? 'error' : 'warning']('Mesa precisa de atenção', {
          description: `Mesa ${payload.tableNumber} - ${
            REASON_LABELS[payload.reason] || payload.reason
          } (${PRIORITY_LABELS[payload.priority]})`,
          duration: isUrgent ? 0 : 8000, // Persistent for urgent
          action: {
            label: 'Atender',
            onClick: () => {
              // Navigate to table
            },
          },
        });
      }

      onTableNeedsAttention?.(payload);
    };

    socket.on(SOCKET_EVENTS.TABLE_NEEDS_ATTENTION, handleTableNeedsAttention);

    return () => {
      socket.off(SOCKET_EVENTS.TABLE_NEEDS_ATTENTION, handleTableNeedsAttention);
    };
  }, [socket, onTableNeedsAttention, enableNotifications, playSound]);

  /**
   * Acknowledge call (mark as attended)
   */
  const acknowledgeCall = useCallback((sessionId: string) => {
    socket?.emit('acknowledge-call', { sessionId });

    if (enableNotifications) {
      toast.success('Chamado confirmado', {
        description: 'Cliente notificado que você está a caminho',
        duration: 3000,
      });
    }
  }, [socket, enableNotifications]);

  /**
   * Mark table as attended
   */
  const markTableAttended = useCallback((
    sessionId: string,
    notes?: string
  ) => {
    socket?.emit('mark-table-attended', { sessionId, notes });
  }, [socket]);

  /**
   * Request help at table
   */
  const requestHelp = useCallback((
    tableNumber: number,
    reason: string
  ) => {
    socket?.emit('request-help', { tableNumber, reason });
  }, [socket]);

  return {
    connected: state.connected,
    reconnecting: state.reconnecting,
    acknowledgeCall,
    markTableAttended,
    requestHelp,
  };
}
