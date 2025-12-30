/**
 * Order Socket Hook
 * Handles real-time order events
 */

'use client';

import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useSocket } from './useSocket';
import { SOCKET_EVENTS, getRoomNames } from './types';
import type {
  NewOrderPayload,
  OrderStatusChangedPayload,
  OrderItemAddedPayload,
} from './types';

interface UseOrderSocketOptions {
  restaurantId?: string;
  orderId?: string;
  onNewOrder?: (payload: NewOrderPayload) => void;
  onStatusChanged?: (payload: OrderStatusChangedPayload) => void;
  onItemAdded?: (payload: OrderItemAddedPayload) => void;
  enableNotifications?: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  PREPARING: 'Preparando',
  READY: 'Pronto',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
};

export function useOrderSocket(options: UseOrderSocketOptions = {}) {
  const {
    restaurantId,
    orderId,
    onNewOrder,
    onStatusChanged,
    onItemAdded,
    enableNotifications = true,
  } = options;

  const { socket, state, joinRoom, leaveRoom } = useSocket();

  // Join restaurant room on mount
  useEffect(() => {
    if (!socket || !state.connected || !restaurantId) return;

    const room = getRoomNames.restaurant(restaurantId);
    joinRoom(room);

    return () => {
      leaveRoom(room);
    };
  }, [socket, state.connected, restaurantId, joinRoom, leaveRoom]);

  // Join order room if orderId is provided
  useEffect(() => {
    if (!socket || !state.connected || !orderId) return;

    const room = getRoomNames.order(orderId);
    joinRoom(room);

    return () => {
      leaveRoom(room);
    };
  }, [socket, state.connected, orderId, joinRoom, leaveRoom]);

  // Listen to new order events
  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = (payload: NewOrderPayload) => {
      console.log('[OrderSocket] New order received:', payload);

      if (enableNotifications) {
        toast.success('Novo pedido recebido', {
          description: `Pedido #${payload.order.orderNumber}`,
          duration: 5000,
        });
      }

      onNewOrder?.(payload);
    };

    socket.on(SOCKET_EVENTS.NEW_ORDER, handleNewOrder);

    return () => {
      socket.off(SOCKET_EVENTS.NEW_ORDER, handleNewOrder);
    };
  }, [socket, onNewOrder, enableNotifications]);

  // Listen to order status changes
  useEffect(() => {
    if (!socket) return;

    const handleStatusChanged = (payload: OrderStatusChangedPayload) => {
      console.log('[OrderSocket] Order status changed:', payload);

      if (enableNotifications) {
        const statusLabel = STATUS_LABELS[payload.newStatus] || payload.newStatus;
        toast.info('Status do pedido atualizado', {
          description: `Agora: ${statusLabel}`,
          duration: 4000,
        });
      }

      onStatusChanged?.(payload);
    };

    socket.on(SOCKET_EVENTS.ORDER_STATUS_CHANGED, handleStatusChanged);

    return () => {
      socket.off(SOCKET_EVENTS.ORDER_STATUS_CHANGED, handleStatusChanged);
    };
  }, [socket, onStatusChanged, enableNotifications]);

  // Listen to order item added
  useEffect(() => {
    if (!socket) return;

    const handleItemAdded = (payload: OrderItemAddedPayload) => {
      console.log('[OrderSocket] Order item added:', payload);

      if (enableNotifications) {
        toast.info('Item adicionado ao pedido', {
          description: payload.item.menuItem.name,
          duration: 3000,
        });
      }

      onItemAdded?.(payload);
    };

    socket.on(SOCKET_EVENTS.ORDER_ITEM_ADDED, handleItemAdded);

    return () => {
      socket.off(SOCKET_EVENTS.ORDER_ITEM_ADDED, handleItemAdded);
    };
  }, [socket, onItemAdded, enableNotifications]);

  /**
   * Emit order status change (for staff)
   */
  const updateOrderStatus = useCallback((
    orderId: string,
    newStatus: string
  ) => {
    socket?.emit('update-order-status', { orderId, newStatus });
  }, [socket]);

  /**
   * Emit add item to order
   */
  const addItemToOrder = useCallback((
    orderId: string,
    itemData: unknown
  ) => {
    socket?.emit('add-order-item', { orderId, ...itemData });
  }, [socket]);

  return {
    connected: state.connected,
    reconnecting: state.reconnecting,
    updateOrderStatus,
    addItemToOrder,
  };
}
