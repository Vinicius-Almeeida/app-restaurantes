/**
 * Socket.IO Event Types
 * Synchronized with backend Socket.IO events
 */

import type { Order, OrderStatus, OrderItem, SplitPayment, TableSession, TableSessionMember } from '../types';

// ==================== Order Events ====================
export interface NewOrderPayload {
  order: Order;
  restaurantId: string;
}

export interface OrderStatusChangedPayload {
  orderId: string;
  oldStatus: OrderStatus;
  newStatus: OrderStatus;
  updatedAt: string;
}

export interface OrderItemAddedPayload {
  orderId: string;
  item: OrderItem;
}

// ==================== Table Session Events ====================
export interface MemberJoinRequestPayload {
  sessionId: string;
  member: TableSessionMember;
}

export interface MemberApprovedPayload {
  sessionId: string;
  memberId: string;
  member: TableSessionMember;
}

export interface MemberRejectedPayload {
  sessionId: string;
  memberId: string;
  reason?: string;
}

export interface MemberLeftPayload {
  sessionId: string;
  memberId: string;
  userName: string;
}

export interface SessionClosedPayload {
  sessionId: string;
  closedAt: string;
}

// ==================== Payment Events ====================
export interface PaymentReceivedPayload {
  orderId: string;
  splitPaymentId: string;
  userId: string;
  amount: number;
  paidAt: string;
}

export interface AllPaymentsCompletePayload {
  orderId: string;
  totalAmount: number;
  completedAt: string;
}

export interface SplitCreatedPayload {
  orderId: string;
  splits: SplitPayment[];
}

export interface SplitUpdatedPayload {
  orderId: string;
  splitPaymentId: string;
  updates: Partial<SplitPayment>;
}

// ==================== Kitchen Events ====================
export interface KitchenOrderReceivedPayload {
  order: Order;
  restaurantId: string;
  timestamp: string;
}

export interface KitchenOrderStartedPayload {
  orderId: string;
  startedAt: string;
}

export interface KitchenOrderReadyPayload {
  orderId: string;
  readyAt: string;
  tableNumber?: string;
}

// ==================== Waiter Events ====================
export interface WaiterCalledPayload {
  sessionId: string;
  tableNumber: number;
  customerId: string;
  customerName: string;
  timestamp: string;
  reason?: string;
}

export interface TableNeedsAttentionPayload {
  tableNumber: number;
  sessionId: string;
  reason: 'CALL_WAITER' | 'PAYMENT_READY' | 'COMPLAINT';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

// ==================== Socket Event Names ====================
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',

  // Orders
  NEW_ORDER: 'new-order',
  ORDER_STATUS_CHANGED: 'order-status-changed',
  ORDER_ITEM_ADDED: 'order-item-added',

  // Table Sessions
  MEMBER_JOIN_REQUEST: 'member-join-request',
  MEMBER_APPROVED: 'member-approved',
  MEMBER_REJECTED: 'member-rejected',
  MEMBER_LEFT: 'member-left',
  SESSION_CLOSED: 'session-closed',

  // Payments
  PAYMENT_RECEIVED: 'payment-received',
  ALL_PAYMENTS_COMPLETE: 'all-payments-complete',
  SPLIT_CREATED: 'split-created',
  SPLIT_UPDATED: 'split-updated',

  // Kitchen
  KITCHEN_ORDER_RECEIVED: 'kitchen-order-received',
  KITCHEN_ORDER_STARTED: 'kitchen-order-started',
  KITCHEN_ORDER_READY: 'kitchen-order-ready',

  // Waiter
  WAITER_CALLED: 'waiter-called',
  TABLE_NEEDS_ATTENTION: 'table-needs-attention',

  // Rooms (for joining/leaving)
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',
} as const;

// ==================== Room Names ====================
export const getRoomNames = {
  restaurant: (restaurantId: string) => `restaurant:${restaurantId}`,
  tableSession: (sessionId: string) => `table-session:${sessionId}`,
  kitchen: (restaurantId: string) => `kitchen:${restaurantId}`,
  waiter: (restaurantId: string) => `waiter:${restaurantId}`,
  order: (orderId: string) => `order:${orderId}`,
};

// ==================== Socket State ====================
export interface SocketState {
  connected: boolean;
  reconnecting: boolean;
  error: Error | null;
}
