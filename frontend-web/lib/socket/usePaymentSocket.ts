/**
 * Payment Socket Hook
 * Handles real-time payment and split bill events
 */

'use client';

import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useSocket } from './useSocket';
import { SOCKET_EVENTS, getRoomNames } from './types';
import type {
  PaymentReceivedPayload,
  AllPaymentsCompletePayload,
  SplitCreatedPayload,
  SplitUpdatedPayload,
} from './types';

interface UsePaymentSocketOptions {
  orderId?: string;
  onPaymentReceived?: (payload: PaymentReceivedPayload) => void;
  onAllPaymentsComplete?: (payload: AllPaymentsCompletePayload) => void;
  onSplitCreated?: (payload: SplitCreatedPayload) => void;
  onSplitUpdated?: (payload: SplitUpdatedPayload) => void;
  enableNotifications?: boolean;
}

export function usePaymentSocket(options: UsePaymentSocketOptions = {}) {
  const {
    orderId,
    onPaymentReceived,
    onAllPaymentsComplete,
    onSplitCreated,
    onSplitUpdated,
    enableNotifications = true,
  } = options;

  const { socket, state, joinRoom, leaveRoom } = useSocket();

  // Join order room to receive payment updates
  useEffect(() => {
    if (!socket || !state.connected || !orderId) return;

    const room = getRoomNames.order(orderId);
    joinRoom(room);

    return () => {
      leaveRoom(room);
    };
  }, [socket, state.connected, orderId, joinRoom, leaveRoom]);

  // Listen to payment received
  useEffect(() => {
    if (!socket) return;

    const handlePaymentReceived = (payload: PaymentReceivedPayload) => {
      console.log('[PaymentSocket] Payment received:', payload);

      if (enableNotifications) {
        toast.success('Pagamento recebido', {
          description: `R$ ${payload.amount.toFixed(2)} pago com sucesso`,
          duration: 4000,
        });
      }

      onPaymentReceived?.(payload);
    };

    socket.on(SOCKET_EVENTS.PAYMENT_RECEIVED, handlePaymentReceived);

    return () => {
      socket.off(SOCKET_EVENTS.PAYMENT_RECEIVED, handlePaymentReceived);
    };
  }, [socket, onPaymentReceived, enableNotifications]);

  // Listen to all payments complete
  useEffect(() => {
    if (!socket) return;

    const handleAllPaymentsComplete = (payload: AllPaymentsCompletePayload) => {
      console.log('[PaymentSocket] All payments complete:', payload);

      if (enableNotifications) {
        toast.success('Todos pagamentos concluídos', {
          description: 'Obrigado! Você já pode sair.',
          duration: 5000,
        });
      }

      onAllPaymentsComplete?.(payload);
    };

    socket.on(SOCKET_EVENTS.ALL_PAYMENTS_COMPLETE, handleAllPaymentsComplete);

    return () => {
      socket.off(SOCKET_EVENTS.ALL_PAYMENTS_COMPLETE, handleAllPaymentsComplete);
    };
  }, [socket, onAllPaymentsComplete, enableNotifications]);

  // Listen to split created
  useEffect(() => {
    if (!socket) return;

    const handleSplitCreated = (payload: SplitCreatedPayload) => {
      console.log('[PaymentSocket] Split created:', payload);

      if (enableNotifications) {
        toast.info('Divisão de conta criada', {
          description: `${payload.splits.length} participantes`,
          duration: 4000,
        });
      }

      onSplitCreated?.(payload);
    };

    socket.on(SOCKET_EVENTS.SPLIT_CREATED, handleSplitCreated);

    return () => {
      socket.off(SOCKET_EVENTS.SPLIT_CREATED, handleSplitCreated);
    };
  }, [socket, onSplitCreated, enableNotifications]);

  // Listen to split updated
  useEffect(() => {
    if (!socket) return;

    const handleSplitUpdated = (payload: SplitUpdatedPayload) => {
      console.log('[PaymentSocket] Split updated:', payload);

      if (enableNotifications && payload.updates.paymentStatus === 'PAID') {
        toast.success('Pagamento confirmado', {
          description: 'Sua parte foi paga com sucesso',
          duration: 4000,
        });
      }

      onSplitUpdated?.(payload);
    };

    socket.on(SOCKET_EVENTS.SPLIT_UPDATED, handleSplitUpdated);

    return () => {
      socket.off(SOCKET_EVENTS.SPLIT_UPDATED, handleSplitUpdated);
    };
  }, [socket, onSplitUpdated, enableNotifications]);

  /**
   * Process split payment
   */
  const processSplitPayment = useCallback((
    splitPaymentId: string,
    paymentData: {
      method: string;
      cardToken?: string;
      pixKey?: string;
    }
  ) => {
    socket?.emit('process-split-payment', {
      splitPaymentId,
      ...paymentData,
    });
  }, [socket]);

  /**
   * Update split amount
   */
  const updateSplitAmount = useCallback((
    splitPaymentId: string,
    newAmount: number
  ) => {
    socket?.emit('update-split-amount', {
      splitPaymentId,
      newAmount,
    });
  }, [socket]);

  return {
    connected: state.connected,
    reconnecting: state.reconnecting,
    processSplitPayment,
    updateSplitAmount,
  };
}
