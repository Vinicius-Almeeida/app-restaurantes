/**
 * Socket.IO Type Definitions
 * FAANG-level type safety for real-time events
 */

import { OrderStatus, PaymentStatus, MemberStatus, MemberRole } from '@prisma/client';

// ============================================
// ROOM NAMING CONVENTIONS
// ============================================
export const ROOMS = {
  restaurant: (restaurantId: string) => `restaurant:${restaurantId}`,
  table: (tableId: string) => `table:${tableId}`,
  session: (sessionId: string) => `session:${sessionId}`,
  kitchen: (restaurantId: string) => `kitchen:${restaurantId}`,
  waiters: (restaurantId: string) => `waiters:${restaurantId}`,
  user: (userId: string) => `user:${userId}`,
} as const;

// ============================================
// EVENT PAYLOADS
// ============================================

// Orders
export interface NewOrderPayload {
  orderId: string;
  orderNumber: string;
  restaurantId: string;
  tableSessionId: string | null;
  tableNumber: string | null;
  status: OrderStatus;
  subtotal: number;
  totalAmount: number;
  items: Array<{
    id: string;
    menuItemName: string;
    quantity: number;
    unitPrice: number;
    notes: string | null;
  }>;
  createdAt: string;
}

export interface OrderStatusChangedPayload {
  orderId: string;
  orderNumber: string;
  restaurantId: string;
  oldStatus: OrderStatus;
  newStatus: OrderStatus;
  updatedAt: string;
  tableNumber: string | null;
}

export interface OrderItemAddedPayload {
  orderId: string;
  orderNumber: string;
  item: {
    id: string;
    menuItemName: string;
    quantity: number;
    unitPrice: number;
    notes: string | null;
  };
  newSubtotal: number;
  newTotal: number;
}

// Table Sessions
export interface MemberJoinRequestPayload {
  sessionId: string;
  tableId: string;
  tableNumber: number;
  restaurantId: string;
  member: {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    status: MemberStatus;
  };
  requestedAt: string;
}

export interface MemberApprovedPayload {
  sessionId: string;
  tableId: string;
  restaurantId: string;
  member: {
    id: string;
    userId: string;
    userName: string;
    role: MemberRole;
    status: MemberStatus;
  };
  approvedAt: string;
}

export interface MemberRejectedPayload {
  sessionId: string;
  tableId: string;
  restaurantId: string;
  userId: string;
  userName: string;
  reason?: string;
}

export interface MemberLeftPayload {
  sessionId: string;
  tableId: string;
  restaurantId: string;
  member: {
    id: string;
    userId: string;
    userName: string;
  };
  leftAt: string;
  remainingMembers: number;
}

export interface SessionClosedPayload {
  sessionId: string;
  tableId: string;
  tableNumber: number;
  restaurantId: string;
  totalAmount: number;
  closedAt: string;
}

// Payments
export interface PaymentReceivedPayload {
  paymentId: string;
  orderId: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  paidAt: string;
}

export interface AllPaymentsCompletePayload {
  orderId: string;
  orderNumber: string;
  sessionId: string | null;
  totalAmount: number;
  completedAt: string;
}

export interface SplitCreatedPayload {
  orderId: string;
  orderNumber: string;
  splitMethod: string;
  participants: Array<{
    userId: string;
    userName: string;
    amountDue: number;
    paymentLink: string;
  }>;
  createdAt: string;
}

export interface SplitUpdatedPayload {
  orderId: string;
  splitPaymentId: string;
  userId: string;
  userName: string;
  amountDue: number;
  paymentStatus: string;
  paidAt: string | null;
  remainingParticipants: number;
}

// Kitchen
export interface KitchenOrderReceivedPayload {
  orderId: string;
  orderNumber: string;
  restaurantId: string;
  tableNumber: string | null;
  items: Array<{
    id: string;
    menuItemName: string;
    quantity: number;
    notes: string | null;
    customizations: unknown;
  }>;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  receivedAt: string;
}

export interface KitchenOrderStartedPayload {
  orderId: string;
  orderNumber: string;
  restaurantId: string;
  startedAt: string;
  estimatedReadyTime?: string;
}

export interface KitchenOrderReadyPayload {
  orderId: string;
  orderNumber: string;
  restaurantId: string;
  tableNumber: string | null;
  readyAt: string;
}

// Waiter
export interface WaiterCalledPayload {
  sessionId: string;
  tableId: string;
  tableNumber: number;
  restaurantId: string;
  calledBy: {
    userId: string;
    userName: string;
  };
  reason?: string;
  calledAt: string;
}

export interface WaiterAssignedPayload {
  sessionId: string;
  tableId: string;
  tableNumber: number;
  restaurantId: string;
  waiter: {
    userId: string;
    userName: string;
  };
  assignedAt: string;
}

export interface TableNeedsAttentionPayload {
  sessionId: string;
  tableId: string;
  tableNumber: number;
  restaurantId: string;
  reason: 'order_ready' | 'payment_request' | 'assistance' | 'complaint';
  priority: 'low' | 'normal' | 'high';
  timestamp: string;
}

// ============================================
// SOCKET EVENTS MAP
// ============================================

export interface ServerToClientEvents {
  // Orders
  'new-order': (payload: NewOrderPayload) => void;
  'order-status-changed': (payload: OrderStatusChangedPayload) => void;
  'order-item-added': (payload: OrderItemAddedPayload) => void;

  // Table Sessions
  'member-join-request': (payload: MemberJoinRequestPayload) => void;
  'member-approved': (payload: MemberApprovedPayload) => void;
  'member-rejected': (payload: MemberRejectedPayload) => void;
  'member-left': (payload: MemberLeftPayload) => void;
  'session-closed': (payload: SessionClosedPayload) => void;

  // Payments
  'payment-received': (payload: PaymentReceivedPayload) => void;
  'all-payments-complete': (payload: AllPaymentsCompletePayload) => void;
  'split-created': (payload: SplitCreatedPayload) => void;
  'split-updated': (payload: SplitUpdatedPayload) => void;

  // Kitchen
  'kitchen-order-received': (payload: KitchenOrderReceivedPayload) => void;
  'kitchen-order-started': (payload: KitchenOrderStartedPayload) => void;
  'kitchen-order-ready': (payload: KitchenOrderReadyPayload) => void;

  // Waiter
  'waiter-called': (payload: WaiterCalledPayload) => void;
  'waiter-assigned': (payload: WaiterAssignedPayload) => void;
  'table-needs-attention': (payload: TableNeedsAttentionPayload) => void;
}

export interface ClientToServerEvents {
  // Connection management
  'join-restaurant': (restaurantId: string) => void;
  'leave-restaurant': (restaurantId: string) => void;
  'join-session': (sessionId: string) => void;
  'leave-session': (sessionId: string) => void;
  'join-kitchen': (restaurantId: string) => void;
  'join-waiters': (restaurantId: string) => void;

  // Actions (these trigger server-side logic that emits events)
  'call-waiter': (data: {
    sessionId: string;
    tableId: string;
    reason?: string;
  }) => void;
  'request-assistance': (data: {
    sessionId: string;
    tableId: string;
    reason: string;
  }) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
  userRole: string;
  restaurantId?: string;
}

// ============================================
// UTILITY TYPES
// ============================================

export type EventName = keyof ServerToClientEvents;

export interface EventMetadata {
  timestamp: string;
  eventId: string;
  version: string;
}
