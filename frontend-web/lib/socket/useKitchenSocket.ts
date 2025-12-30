/**
 * Kitchen Socket Hook
 * Handles real-time kitchen dashboard events
 */

'use client';

import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useSocket } from './useSocket';
import { SOCKET_EVENTS, getRoomNames } from './types';
import type {
  KitchenOrderReceivedPayload,
  KitchenOrderStartedPayload,
  KitchenOrderReadyPayload,
} from './types';

interface UseKitchenSocketOptions {
  restaurantId?: string;
  onOrderReceived?: (payload: KitchenOrderReceivedPayload) => void;
  onOrderStarted?: (payload: KitchenOrderStartedPayload) => void;
  onOrderReady?: (payload: KitchenOrderReadyPayload) => void;
  enableNotifications?: boolean;
  enableSounds?: boolean;
}

export function useKitchenSocket(options: UseKitchenSocketOptions = {}) {
  const {
    restaurantId,
    onOrderReceived,
    onOrderStarted,
    onOrderReady,
    enableNotifications = true,
    enableSounds = true,
  } = options;

  const { socket, state, joinRoom, leaveRoom } = useSocket();

  // Join kitchen room on mount
  useEffect(() => {
    if (!socket || !state.connected || !restaurantId) return;

    const room = getRoomNames.kitchen(restaurantId);
    joinRoom(room);

    return () => {
      leaveRoom(room);
    };
  }, [socket, state.connected, restaurantId, joinRoom, leaveRoom]);

  /**
   * Play notification sound
   */
  const playSound = useCallback((type: 'new-order' | 'ready') => {
    if (!enableSounds || typeof window === 'undefined') return;

    try {
      const audio = new Audio(
        type === 'new-order'
          ? '/sounds/new-order.mp3'
          : '/sounds/order-ready.mp3'
      );
      audio.play().catch(err => console.warn('Could not play sound:', err));
    } catch (error) {
      console.warn('Sound playback error:', error);
    }
  }, [enableSounds]);

  // Listen to new order received in kitchen
  useEffect(() => {
    if (!socket) return;

    const handleOrderReceived = (payload: KitchenOrderReceivedPayload) => {
      console.log('[KitchenSocket] New order received:', payload);

      playSound('new-order');

      if (enableNotifications) {
        toast.success('Novo pedido recebido', {
          description: `Pedido #${payload.order.orderNumber}${
            payload.order.tableNumber ? ` - Mesa ${payload.order.tableNumber}` : ''
          }`,
          duration: 8000,
          action: {
            label: 'Ver',
            onClick: () => {
              // Navigate to order details
            },
          },
        });
      }

      onOrderReceived?.(payload);
    };

    socket.on(SOCKET_EVENTS.KITCHEN_ORDER_RECEIVED, handleOrderReceived);

    return () => {
      socket.off(SOCKET_EVENTS.KITCHEN_ORDER_RECEIVED, handleOrderReceived);
    };
  }, [socket, onOrderReceived, enableNotifications, playSound]);

  // Listen to order preparation started
  useEffect(() => {
    if (!socket) return;

    const handleOrderStarted = (payload: KitchenOrderStartedPayload) => {
      console.log('[KitchenSocket] Order preparation started:', payload);

      onOrderStarted?.(payload);
    };

    socket.on(SOCKET_EVENTS.KITCHEN_ORDER_STARTED, handleOrderStarted);

    return () => {
      socket.off(SOCKET_EVENTS.KITCHEN_ORDER_STARTED, handleOrderStarted);
    };
  }, [socket, onOrderStarted]);

  // Listen to order ready
  useEffect(() => {
    if (!socket) return;

    const handleOrderReady = (payload: KitchenOrderReadyPayload) => {
      console.log('[KitchenSocket] Order ready:', payload);

      playSound('ready');

      if (enableNotifications) {
        toast.success('Pedido pronto', {
          description: payload.tableNumber
            ? `Mesa ${payload.tableNumber} - Pedido pronto para servir`
            : 'Pedido pronto para servir',
          duration: 6000,
        });
      }

      onOrderReady?.(payload);
    };

    socket.on(SOCKET_EVENTS.KITCHEN_ORDER_READY, handleOrderReady);

    return () => {
      socket.off(SOCKET_EVENTS.KITCHEN_ORDER_READY, handleOrderReady);
    };
  }, [socket, onOrderReady, enableNotifications, playSound]);

  /**
   * Mark order as started in kitchen
   */
  const startOrder = useCallback((orderId: string) => {
    socket?.emit('kitchen-start-order', { orderId });
  }, [socket]);

  /**
   * Mark order as ready
   */
  const markOrderReady = useCallback((orderId: string) => {
    socket?.emit('kitchen-order-ready', { orderId });
  }, [socket]);

  /**
   * Update order priority
   */
  const updateOrderPriority = useCallback((
    orderId: string,
    priority: 'LOW' | 'MEDIUM' | 'HIGH'
  ) => {
    socket?.emit('kitchen-update-priority', { orderId, priority });
  }, [socket]);

  return {
    connected: state.connected,
    reconnecting: state.reconnecting,
    startOrder,
    markOrderReady,
    updateOrderPriority,
  };
}
