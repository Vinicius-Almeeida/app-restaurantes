/**
 * Kitchen Socket Handler
 * Handles real-time kitchen order events
 */

import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
  KitchenOrderReceivedPayload,
  KitchenOrderStartedPayload,
  KitchenOrderReadyPayload,
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
 * Emits order received in kitchen
 */
export const emitKitchenOrderReceived = async (
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
              select: { name: true },
            },
          },
        },
      },
    });

    if (!order) {
      console.error(`[Kitchen] Order ${orderId} not found`);
      return;
    }

    // Calculate priority based on order time and status
    const orderAge = Date.now() - order.createdAt.getTime();
    let priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal';

    if (orderAge > 30 * 60 * 1000) {
      priority = 'urgent'; // Over 30 minutes
    } else if (orderAge > 15 * 60 * 1000) {
      priority = 'high'; // Over 15 minutes
    } else if (orderAge < 5 * 60 * 1000) {
      priority = 'low'; // Under 5 minutes
    }

    const payload: KitchenOrderReceivedPayload = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      restaurantId: order.restaurantId,
      tableNumber: order.tableNumber,
      items: order.orderItems.map((item) => ({
        id: item.id,
        menuItemName: item.menuItem.name,
        quantity: item.quantity,
        notes: item.notes,
        customizations: item.customizations,
      })),
      priority,
      receivedAt: order.createdAt.toISOString(),
    };

    // Emit to kitchen room
    io.to(ROOMS.kitchen(order.restaurantId)).emit('kitchen-order-received', payload);

    // Also emit to restaurant room for monitoring
    io.to(ROOMS.restaurant(order.restaurantId)).emit('kitchen-order-received', payload);

    console.log(`[Kitchen] Order ${order.orderNumber} sent to kitchen (Priority: ${priority})`);

    await prisma.auditLog.create({
      data: {
        action: 'KITCHEN_ORDER_RECEIVED',
        entityType: 'Order',
        entityId: order.id,
        newValue: {
          orderNumber: order.orderNumber,
          priority,
          itemsCount: order.orderItems.length,
        },
      },
    });
  } catch (error) {
    console.error('[Kitchen] Error emitting kitchen order received:', error);
  }
};

/**
 * Emits order started in kitchen
 */
export const emitKitchenOrderStarted = async (
  io: TypedServer,
  orderId: string,
  estimatedReadyTime?: Date
): Promise<void> => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        restaurantId: true,
        tableSessionId: true,
      },
    });

    if (!order) {
      console.error(`[Kitchen] Order ${orderId} not found`);
      return;
    }

    const payload: KitchenOrderStartedPayload = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      restaurantId: order.restaurantId,
      startedAt: new Date().toISOString(),
      estimatedReadyTime: estimatedReadyTime?.toISOString(),
    };

    // Emit to kitchen room
    io.to(ROOMS.kitchen(order.restaurantId)).emit('kitchen-order-started', payload);

    // Emit to waiters
    io.to(ROOMS.waiters(order.restaurantId)).emit('kitchen-order-started', payload);

    // Emit to customer session
    if (order.tableSessionId) {
      io.to(ROOMS.session(order.tableSessionId)).emit('kitchen-order-started', payload);
    }

    console.log(`[Kitchen] Order ${order.orderNumber} started in kitchen`);

    await prisma.auditLog.create({
      data: {
        action: 'KITCHEN_ORDER_STARTED',
        entityType: 'Order',
        entityId: order.id,
        newValue: {
          orderNumber: order.orderNumber,
          estimatedReadyTime: estimatedReadyTime?.toISOString() || null,
        },
      },
    });
  } catch (error) {
    console.error('[Kitchen] Error emitting kitchen order started:', error);
  }
};

/**
 * Emits order ready from kitchen
 */
export const emitKitchenOrderReady = async (
  io: TypedServer,
  orderId: string
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
      },
    });

    if (!order) {
      console.error(`[Kitchen] Order ${orderId} not found`);
      return;
    }

    const payload: KitchenOrderReadyPayload = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      restaurantId: order.restaurantId,
      tableNumber: order.tableNumber,
      readyAt: new Date().toISOString(),
    };

    // Emit to kitchen room
    io.to(ROOMS.kitchen(order.restaurantId)).emit('kitchen-order-ready', payload);

    // Emit to waiters (high priority - food is ready!)
    io.to(ROOMS.waiters(order.restaurantId)).emit('kitchen-order-ready', payload);

    // Emit to customer session
    if (order.tableSessionId) {
      io.to(ROOMS.session(order.tableSessionId)).emit('kitchen-order-ready', payload);
    }

    console.log(`[Kitchen] Order ${order.orderNumber} is ready for delivery`);

    await prisma.auditLog.create({
      data: {
        action: 'KITCHEN_ORDER_READY',
        entityType: 'Order',
        entityId: order.id,
        newValue: {
          orderNumber: order.orderNumber,
          tableNumber: order.tableNumber,
        },
      },
    });
  } catch (error) {
    console.error('[Kitchen] Error emitting kitchen order ready:', error);
  }
};

/**
 * Setup kitchen event handlers
 */
export const setupKitchenHandlers = (io: TypedServer): void => {
  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    const userRole = socket.data.userRole;
    const restaurantId = socket.data.restaurantId;

    console.log(`[Kitchen] Socket ${socket.id} connected (User: ${userId}, Role: ${userRole})`);

    // Join kitchen room if user is kitchen staff
    socket.on('join-kitchen', (reqRestaurantId: string) => {
      // Verify user has permission to join kitchen
      if (userRole === 'KITCHEN' || userRole === 'RESTAURANT_OWNER' || userRole === 'SUPER_ADMIN') {
        // Verify restaurant ownership for staff
        if (userRole === 'KITCHEN' && restaurantId !== reqRestaurantId) {
          console.warn(`[Kitchen] User ${userId} tried to join unauthorized kitchen ${reqRestaurantId}`);
          return;
        }

        socket.join(ROOMS.kitchen(reqRestaurantId));
        console.log(`[Kitchen] Socket ${socket.id} joined kitchen room: ${reqRestaurantId}`);
      } else {
        console.warn(`[Kitchen] User ${userId} with role ${userRole} cannot join kitchen`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Kitchen] Socket ${socket.id} disconnected`);
    });
  });
};
