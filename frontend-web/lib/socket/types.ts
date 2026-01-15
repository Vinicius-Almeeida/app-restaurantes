/**
 * Socket.IO Event Types
 * Synchronized with backend Socket.IO events
 */

// ==================== Order Events ====================
export interface NewOrderPayload {
  orderId: string;
  orderNumber: string;
  restaurantId: string;
  tableSessionId: string | null;
  tableNumber: string | null;
  status: string;
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
  oldStatus: string;
  newStatus: string;
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

// ==================== Table Session Events ====================
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
    status: string;
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
    role: string;
    status: string;
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

// ==================== Payment Events ====================
export interface PaymentReceivedPayload {
  paymentId: string;
  orderId: string;
  amount: number;
  method: string;
  status: string;
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

// ==================== Kitchen Events ====================
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

// ==================== Waiter Events ====================
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

// ==================== Socket Event Names ====================
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',

  // Authentication
  AUTHENTICATE: 'authenticate',

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
  WAITER_ASSIGNED: 'waiter-assigned',
  TABLE_NEEDS_ATTENTION: 'table-needs-attention',

  // Room Management
  JOIN_RESTAURANT: 'join-restaurant',
  LEAVE_RESTAURANT: 'leave-restaurant',
  JOIN_KITCHEN: 'join-kitchen',
  JOIN_WAITERS: 'join-waiters',
  JOIN_SESSION: 'join-session',
  LEAVE_SESSION: 'leave-session',
} as const;

// ==================== Room Names ====================
export const getRoomNames = {
  restaurant: (restaurantId: string) => `restaurant:${restaurantId}`,
  kitchen: (restaurantId: string) => `kitchen:${restaurantId}`,
  waiters: (restaurantId: string) => `waiters:${restaurantId}`,
  session: (sessionId: string) => `session:${sessionId}`,
  user: (userId: string) => `user:${userId}`,
  // Aliases for compatibility
  order: (orderId: string) => `order:${orderId}`,
  table: (tableId: string) => `table:${tableId}`,
};

// ==================== Socket State ====================
export interface SocketState {
  connected: boolean;
  reconnecting: boolean;
  error: Error | null;
}
