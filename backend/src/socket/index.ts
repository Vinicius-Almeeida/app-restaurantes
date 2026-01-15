/**
 * Socket.IO Initialization
 * Connects all handlers and exports emit functions for use in services
 */

import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
  NewOrderPayload,
  OrderStatusChangedPayload,
  OrderItemAddedPayload,
  KitchenOrderReceivedPayload,
  ROOMS,
} from './types/socket.types';

// Import handlers for setup
import { setupOrderHandlers } from './handlers/orders.handler';
import { setupKitchenHandlers } from './handlers/kitchen.handler';
import { setupTableHandlers } from './handlers/tables.handler';
import { setupWaiterHandlers } from './handlers/waiter.handler';

export type TypedSocketServer = SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

// Global io instance for use in services
let ioInstance: TypedSocketServer | null = null;

/**
 * Initialize Socket.IO with all handlers
 */
export function initializeSocket(
  httpServer: HttpServer,
  corsOriginCheck: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void
): TypedSocketServer {
  const io: TypedSocketServer = new SocketIOServer(httpServer, {
    cors: {
      origin: corsOriginCheck,
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Store global instance
  ioInstance = io;

  // Base connection handler
  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Handle authentication data from connection
    socket.on('authenticate', (data: { userId: string; userRole: string; restaurantId?: string }) => {
      socket.data.userId = data.userId;
      socket.data.userRole = data.userRole;
      socket.data.restaurantId = data.restaurantId;
      console.log(`[Socket] Authenticated: ${socket.id} as ${data.userRole}`);
    });

    // Handle restaurant room joining
    socket.on('join-restaurant', (restaurantId: string) => {
      socket.join(`restaurant:${restaurantId}`);
      console.log(`[Socket] ${socket.id} joined restaurant:${restaurantId}`);
    });

    socket.on('leave-restaurant', (restaurantId: string) => {
      socket.leave(`restaurant:${restaurantId}`);
      console.log(`[Socket] ${socket.id} left restaurant:${restaurantId}`);
    });

    // Handle kitchen room
    socket.on('join-kitchen', (restaurantId: string) => {
      socket.join(ROOMS.kitchen(restaurantId));
      console.log(`[Socket] ${socket.id} joined kitchen:${restaurantId}`);
    });

    // Handle waiter room
    socket.on('join-waiters', (restaurantId: string) => {
      socket.join(ROOMS.waiters(restaurantId));
      console.log(`[Socket] ${socket.id} joined waiters:${restaurantId}`);
    });

    // Handle table session room
    socket.on('join-session', (sessionId: string) => {
      socket.join(ROOMS.session(sessionId));
      console.log(`[Socket] ${socket.id} joined session:${sessionId}`);
    });

    socket.on('leave-session', (sessionId: string) => {
      socket.leave(ROOMS.session(sessionId));
      console.log(`[Socket] ${socket.id} left session:${sessionId}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket] Client disconnected: ${socket.id} (${reason})`);
    });

    socket.on('error', (error) => {
      console.error(`[Socket] Error on ${socket.id}:`, error);
    });
  });

  // Setup all domain-specific handlers
  setupOrderHandlers(io);
  setupKitchenHandlers(io);
  setupTableHandlers(io);
  setupWaiterHandlers(io);

  console.log('[Socket] All handlers initialized');

  return io;
}

/**
 * Get the global Socket.IO instance
 * Use this in services to emit events
 */
export function getIO(): TypedSocketServer {
  if (!ioInstance) {
    throw new Error('Socket.IO not initialized. Call initializeSocket first.');
  }
  return ioInstance;
}

/**
 * Check if Socket.IO is initialized
 */
export function isSocketInitialized(): boolean {
  return ioInstance !== null;
}

// ============================================
// SIMPLIFIED EMIT FUNCTIONS FOR SERVICES
// These wrap the io instance and emit directly
// ============================================

interface SimpleNewOrderPayload {
  id: string;
  orderNumber: string;
  restaurantId: string;
  tableNumber: string | null;
  status: string;
  totalAmount: number;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
  createdAt: string;
}

interface SimpleStatusPayload {
  orderId: string;
  orderNumber: string;
  previousStatus: string;
  newStatus: string;
  tableNumber: string | null;
  updatedAt: string;
}

interface SimpleItemAddedPayload {
  orderId: string;
  orderNumber: string;
  item: {
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    userId: string;
  };
  newTotal: number;
}

interface SimpleKitchenPayload {
  orderId: string;
  orderNumber: string;
  startedAt?: string;
  readyAt?: string;
  tableNumber?: string | null;
}

/**
 * Emit new order event to restaurant, kitchen, and waiters
 */
export function emitNewOrder(restaurantId: string, order: SimpleNewOrderPayload): void {
  if (!ioInstance) return;

  const payload: NewOrderPayload = {
    orderId: order.id,
    orderNumber: order.orderNumber,
    restaurantId: order.restaurantId,
    tableSessionId: null,
    tableNumber: order.tableNumber,
    status: order.status as NewOrderPayload['status'],
    subtotal: order.totalAmount,
    totalAmount: order.totalAmount,
    items: order.items.map((item) => ({
      id: item.id,
      menuItemName: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      notes: null,
    })),
    createdAt: order.createdAt,
  };

  ioInstance.to(ROOMS.restaurant(restaurantId)).emit('new-order', payload);
  ioInstance.to(ROOMS.kitchen(restaurantId)).emit('new-order', payload);
  ioInstance.to(ROOMS.waiters(restaurantId)).emit('new-order', payload);

  console.log(`[Socket] New order ${order.orderNumber} emitted to restaurant ${restaurantId}`);
}

/**
 * Emit order status changed event
 */
export function emitOrderStatusChanged(restaurantId: string, data: SimpleStatusPayload): void {
  if (!ioInstance) return;

  const payload: OrderStatusChangedPayload = {
    orderId: data.orderId,
    orderNumber: data.orderNumber,
    restaurantId,
    oldStatus: data.previousStatus as OrderStatusChangedPayload['oldStatus'],
    newStatus: data.newStatus as OrderStatusChangedPayload['newStatus'],
    tableNumber: data.tableNumber,
    updatedAt: data.updatedAt,
  };

  ioInstance.to(ROOMS.restaurant(restaurantId)).emit('order-status-changed', payload);
  ioInstance.to(ROOMS.kitchen(restaurantId)).emit('order-status-changed', payload);
  ioInstance.to(ROOMS.waiters(restaurantId)).emit('order-status-changed', payload);

  console.log(`[Socket] Order ${data.orderNumber} status changed: ${data.previousStatus} -> ${data.newStatus}`);
}

/**
 * Emit order item added event
 */
export function emitOrderItemAdded(restaurantId: string, data: SimpleItemAddedPayload): void {
  if (!ioInstance) return;

  const payload: OrderItemAddedPayload = {
    orderId: data.orderId,
    orderNumber: data.orderNumber,
    item: {
      id: data.item.id,
      menuItemName: data.item.name,
      quantity: data.item.quantity,
      unitPrice: data.item.unitPrice,
      notes: null,
    },
    newSubtotal: data.newTotal,
    newTotal: data.newTotal,
  };

  ioInstance.to(ROOMS.restaurant(restaurantId)).emit('order-item-added', payload);

  console.log(`[Socket] Item added to order ${data.orderNumber}`);
}

/**
 * Emit kitchen order received event
 */
export function emitKitchenOrderReceived(restaurantId: string, order: SimpleNewOrderPayload): void {
  if (!ioInstance) return;

  const payload: KitchenOrderReceivedPayload = {
    orderId: order.id,
    orderNumber: order.orderNumber,
    restaurantId,
    tableNumber: order.tableNumber,
    items: order.items.map((item) => ({
      id: item.id,
      menuItemName: item.name,
      quantity: item.quantity,
      notes: null,
      customizations: null,
    })),
    priority: 'normal',
    receivedAt: order.createdAt,
  };

  ioInstance.to(ROOMS.kitchen(restaurantId)).emit('kitchen-order-received', payload);

  console.log(`[Socket] Kitchen received order ${order.orderNumber}`);
}

/**
 * Emit kitchen order started event
 */
export function emitKitchenOrderStarted(restaurantId: string, data: SimpleKitchenPayload): void {
  if (!ioInstance) return;

  ioInstance.to(ROOMS.kitchen(restaurantId)).emit('kitchen-order-started', {
    orderId: data.orderId,
    orderNumber: data.orderNumber,
    restaurantId,
    startedAt: data.startedAt || new Date().toISOString(),
  });

  ioInstance.to(ROOMS.waiters(restaurantId)).emit('kitchen-order-started', {
    orderId: data.orderId,
    orderNumber: data.orderNumber,
    restaurantId,
    startedAt: data.startedAt || new Date().toISOString(),
  });

  console.log(`[Socket] Kitchen started order ${data.orderNumber}`);
}

/**
 * Emit kitchen order ready event
 */
export function emitKitchenOrderReady(restaurantId: string, data: SimpleKitchenPayload): void {
  if (!ioInstance) return;

  const payload = {
    orderId: data.orderId,
    orderNumber: data.orderNumber,
    restaurantId,
    tableNumber: data.tableNumber,
    readyAt: data.readyAt || new Date().toISOString(),
  };

  ioInstance.to(ROOMS.kitchen(restaurantId)).emit('kitchen-order-ready', payload);
  ioInstance.to(ROOMS.waiters(restaurantId)).emit('kitchen-order-ready', payload);
  ioInstance.to(ROOMS.restaurant(restaurantId)).emit('kitchen-order-ready', payload);

  console.log(`[Socket] Kitchen order ${data.orderNumber} is ready`);
}

// Re-export table and waiter emit functions from handlers
export {
  emitMemberJoinRequest,
  emitMemberApproved,
  emitMemberRejected,
  emitMemberLeft,
  emitSessionClosed,
} from './handlers/tables.handler';

export {
  emitWaiterCalled,
  emitWaiterAssigned,
  emitTableNeedsAttention,
} from './handlers/waiter.handler';
