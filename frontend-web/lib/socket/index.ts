/**
 * Socket.IO Exports
 * Centralized exports for all socket hooks and utilities
 */

// Core socket
export { socketManager, getSocket } from './socket';

// Hooks
export { useSocket } from './useSocket';
export { useOrderSocket } from './useOrderSocket';
export { useTableSocket } from './useTableSocket';
export { useKitchenSocket } from './useKitchenSocket';
export { usePaymentSocket } from './usePaymentSocket';
export { useWaiterSocket } from './useWaiterSocket';

// Types and constants
export { SOCKET_EVENTS, getRoomNames } from './types';
export type {
  SocketState,
  NewOrderPayload,
  OrderStatusChangedPayload,
  OrderItemAddedPayload,
  MemberJoinRequestPayload,
  MemberApprovedPayload,
  MemberRejectedPayload,
  MemberLeftPayload,
  SessionClosedPayload,
  PaymentReceivedPayload,
  AllPaymentsCompletePayload,
  SplitCreatedPayload,
  SplitUpdatedPayload,
  KitchenOrderReceivedPayload,
  KitchenOrderStartedPayload,
  KitchenOrderReadyPayload,
  WaiterCalledPayload,
  TableNeedsAttentionPayload,
} from './types';
