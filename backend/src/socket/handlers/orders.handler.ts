/**
 * Orders Socket Handler
 * Handles real-time order events and notifications
 */

import { Server } from 'socket.io';
import { PrismaClient, OrderStatus } from '@prisma/client';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
  NewOrderPayload,
  OrderStatusChangedPayload,
  OrderItemAddedPayload,
  ROOMS,
} from '../types/socket.types';

const prisma = new PrismaClient();

export type TypedServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

/**
 * Emits new order event to kitchen and waiters
 */
export const emitNewOrder = async (
  io: TypedServer,
  orderId: string
): Promise<void> => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            menuItem: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      console.error(`[Orders] Order ${orderId} not found`);
      return;
    }

    const payload: NewOrderPayload = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      restaurantId: order.restaurantId,
      tableSessionId: order.tableSessionId,
      tableNumber: order.tableNumber,
      status: order.status,
      subtotal: Number(order.subtotal),
      totalAmount: Number(order.totalAmount),
      items: order.orderItems.map((item) => ({
        id: item.id,
        menuItemName: item.menuItem.name,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        notes: item.notes,
      })),
      createdAt: order.createdAt.toISOString(),
    };

    io.to(ROOMS.restaurant(order.restaurantId)).emit('new-order', payload);
    io.to(ROOMS.kitchen(order.restaurantId)).emit('new-order', payload);
    io.to(ROOMS.waiters(order.restaurantId)).emit('new-order', payload);

    if (order.tableSessionId) {
      io.to(ROOMS.session(order.tableSessionId)).emit('new-order', payload);
    }

    console.log(`[Orders] New order ${order.orderNumber} emitted`);

    await prisma.auditLog.create({
      data: {
        action: 'ORDER_CREATED',
        entityType: 'Order',
        entityId: order.id,
        newValue: {
          orderNumber: order.orderNumber,
          restaurantId: order.restaurantId,
          totalAmount: Number(order.totalAmount),
        },
      },
    });
  } catch (error) {
    console.error('[Orders] Error emitting new order:', error);
  }
};

/**
 * Emits order status changed event
 */
export const emitOrderStatusChanged = async (
  io: TypedServer,
  orderId: string,
  oldStatus: OrderStatus,
  newStatus: OrderStatus
): Promise<void> => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        restaurantId: true,
        tableSessionId: true,
        tableNumber: true,
        createdAt: true,
      },
    });

    if (!order) {
      console.error(`[Orders] Order ${orderId} not found`);
      return;
    }

    const payload: OrderStatusChangedPayload = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      restaurantId: order.restaurantId,
      oldStatus,
      newStatus,
      updatedAt: new Date().toISOString(),
      tableNumber: order.tableNumber,
    };

    io.to(ROOMS.restaurant(order.restaurantId)).emit('order-status-changed', payload);
    io.to(ROOMS.kitchen(order.restaurantId)).emit('order-status-changed', payload);
    io.to(ROOMS.waiters(order.restaurantId)).emit('order-status-changed', payload);

    if (order.tableSessionId) {
      io.to(ROOMS.session(order.tableSessionId)).emit('order-status-changed', payload);
    }

    console.log(`[Orders] Order ${order.orderNumber} status: ${oldStatus} -> ${newStatus}`);

    await prisma.auditLog.create({
      data: {
        action: 'ORDER_STATUS_CHANGED',
        entityType: 'Order',
        entityId: order.id,
        oldValue: { status: oldStatus },
        newValue: { status: newStatus },
      },
    });
  } catch (error) {
    console.error('[Orders] Error emitting order status change:', error);
  }
};

/**
 * Emits order item added event
 */
export const emitOrderItemAdded = async (
  io: TypedServer,
  orderId: string,
  orderItemId: string
): Promise<void> => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        restaurantId: true,
        tableSessionId: true,
        subtotal: true,
        totalAmount: true,
      },
    });

    if (!order) {
      console.error(`[Orders] Order ${orderId} not found`);
      return;
    }

    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: {
        menuItem: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!orderItem) {
      console.error(`[Orders] Order item ${orderItemId} not found`);
      return;
    }

    const payload: OrderItemAddedPayload = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      item: {
        id: orderItem.id,
        menuItemName: orderItem.menuItem.name,
        quantity: orderItem.quantity,
        unitPrice: Number(orderItem.unitPrice),
        notes: orderItem.notes,
      },
      newSubtotal: Number(order.subtotal),
      newTotal: Number(order.totalAmount),
    };

    io.to(ROOMS.restaurant(order.restaurantId)).emit('order-item-added', payload);

    if (order.tableSessionId) {
      io.to(ROOMS.session(order.tableSessionId)).emit('order-item-added', payload);
    }

    console.log(`[Orders] Item added to order ${order.orderNumber}`);
  } catch (error) {
    console.error('[Orders] Error emitting order item added:', error);
  }
};

export const setupOrderHandlers = (io: TypedServer): void => {
  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    const userRole = socket.data.userRole;

    console.log(`[Orders] Socket ${socket.id} connected (User: ${userId}, Role: ${userRole})`);

    if (socket.data.restaurantId) {
      const restaurantRoom = ROOMS.restaurant(socket.data.restaurantId);
      socket.join(restaurantRoom);
      console.log(`[Orders] Socket ${socket.id} joined room ${restaurantRoom}`);
    }

    socket.on('disconnect', () => {
      console.log(`[Orders] Socket ${socket.id} disconnected`);
    });
  });
};
