/**
 * Waiter Socket Handler
 * Handles real-time waiter call and assistance events
 */

import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
  WaiterCalledPayload,
  WaiterAssignedPayload,
  TableNeedsAttentionPayload,
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
 * Emits waiter called event
 */
export const emitWaiterCalled = async (
  io: TypedServer,
  sessionId: string,
  calledByUserId: string,
  reason?: string
): Promise<void> => {
  try {
    const session = await prisma.tableSession.findUnique({
      where: { id: sessionId },
      include: {
        table: {
          select: {
            id: true,
            number: true,
            restaurantId: true,
          },
        },
      },
    });

    if (!session) {
      console.error(`[Waiter] Session ${sessionId} not found`);
      return;
    }

    const calledByUser = await prisma.user.findUnique({
      where: { id: calledByUserId },
      select: {
        id: true,
        fullName: true,
      },
    });

    if (!calledByUser) {
      console.error(`[Waiter] User ${calledByUserId} not found`);
      return;
    }

    const payload: WaiterCalledPayload = {
      sessionId: session.id,
      tableId: session.table.id,
      tableNumber: session.table.number,
      restaurantId: session.table.restaurantId,
      calledBy: {
        userId: calledByUser.id,
        userName: calledByUser.fullName,
      },
      reason,
      calledAt: new Date().toISOString(),
    };

    // Emit to all waiters in restaurant
    io.to(ROOMS.waiters(session.table.restaurantId)).emit('waiter-called', payload);

    // Emit to restaurant staff
    io.to(ROOMS.restaurant(session.table.restaurantId)).emit('waiter-called', payload);

    console.log(
      `[Waiter] Waiter called by ${calledByUser.fullName} at table ${session.table.number}`
    );

    await prisma.auditLog.create({
      data: {
        userId: calledByUserId,
        action: 'WAITER_CALLED',
        entityType: 'TableSession',
        entityId: session.id,
        newValue: {
          tableNumber: session.table.number,
          reason: reason || 'No reason provided',
        },
      },
    });
  } catch (error) {
    console.error('[Waiter] Error emitting waiter called:', error);
  }
};

/**
 * Emits waiter assigned to table event
 */
export const emitWaiterAssigned = async (
  io: TypedServer,
  sessionId: string,
  waiterId: string
): Promise<void> => {
  try {
    const session = await prisma.tableSession.findUnique({
      where: { id: sessionId },
      include: {
        table: {
          select: {
            id: true,
            number: true,
            restaurantId: true,
          },
        },
      },
    });

    if (!session) {
      console.error(`[Waiter] Session ${sessionId} not found`);
      return;
    }

    const waiter = await prisma.user.findUnique({
      where: { id: waiterId },
      select: {
        id: true,
        fullName: true,
      },
    });

    if (!waiter) {
      console.error(`[Waiter] Waiter ${waiterId} not found`);
      return;
    }

    const payload: WaiterAssignedPayload = {
      sessionId: session.id,
      tableId: session.table.id,
      tableNumber: session.table.number,
      restaurantId: session.table.restaurantId,
      waiter: {
        userId: waiter.id,
        userName: waiter.fullName,
      },
      assignedAt: new Date().toISOString(),
    };

    // Notify the session
    io.to(ROOMS.session(sessionId)).emit('waiter-assigned', payload);

    // Notify the waiter
    io.to(ROOMS.user(waiterId)).emit('waiter-assigned', payload);

    // Notify restaurant staff
    io.to(ROOMS.restaurant(session.table.restaurantId)).emit('waiter-assigned', payload);

    console.log(
      `[Waiter] ${waiter.fullName} assigned to table ${session.table.number}`
    );

    await prisma.auditLog.create({
      data: {
        userId: waiterId,
        action: 'WAITER_ASSIGNED',
        entityType: 'TableSession',
        entityId: session.id,
        newValue: {
          tableNumber: session.table.number,
          waiterName: waiter.fullName,
        },
      },
    });
  } catch (error) {
    console.error('[Waiter] Error emitting waiter assigned:', error);
  }
};

/**
 * Emits table needs attention event
 */
export const emitTableNeedsAttention = async (
  io: TypedServer,
  sessionId: string,
  reason: 'order_ready' | 'payment_request' | 'assistance' | 'complaint',
  priority: 'low' | 'normal' | 'high' = 'normal'
): Promise<void> => {
  try {
    const session = await prisma.tableSession.findUnique({
      where: { id: sessionId },
      include: {
        table: {
          select: {
            id: true,
            number: true,
            restaurantId: true,
          },
        },
      },
    });

    if (!session) {
      console.error(`[Waiter] Session ${sessionId} not found`);
      return;
    }

    const payload: TableNeedsAttentionPayload = {
      sessionId: session.id,
      tableId: session.table.id,
      tableNumber: session.table.number,
      restaurantId: session.table.restaurantId,
      reason,
      priority,
      timestamp: new Date().toISOString(),
    };

    // High priority events go to all staff
    if (priority === 'high') {
      io.to(ROOMS.restaurant(session.table.restaurantId)).emit('table-needs-attention', payload);
      io.to(ROOMS.waiters(session.table.restaurantId)).emit('table-needs-attention', payload);
    } else {
      // Normal/low priority only to waiters
      io.to(ROOMS.waiters(session.table.restaurantId)).emit('table-needs-attention', payload);
    }

    console.log(
      `[Waiter] Table ${session.table.number} needs attention (${reason}, priority: ${priority})`
    );

    await prisma.auditLog.create({
      data: {
        action: 'TABLE_NEEDS_ATTENTION',
        entityType: 'TableSession',
        entityId: session.id,
        newValue: {
          tableNumber: session.table.number,
          reason,
          priority,
        },
      },
    });
  } catch (error) {
    console.error('[Waiter] Error emitting table needs attention:', error);
  }
};

/**
 * Setup waiter event handlers
 */
export const setupWaiterHandlers = (io: TypedServer): void => {
  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    const userRole = socket.data.userRole;
    const restaurantId = socket.data.restaurantId;

    console.log(`[Waiter] Socket ${socket.id} connected (User: ${userId}, Role: ${userRole})`);

    // Join waiters room if user is waiter or staff
    socket.on('join-waiters', (reqRestaurantId: string) => {
      // Verify user has permission to join waiters
      if (
        userRole === 'WAITER' ||
        userRole === 'RESTAURANT_OWNER' ||
        userRole === 'SUPER_ADMIN'
      ) {
        // Verify restaurant ownership for staff
        if (userRole === 'WAITER' && restaurantId !== reqRestaurantId) {
          console.warn(
            `[Waiter] User ${userId} tried to join unauthorized waiters room ${reqRestaurantId}`
          );
          return;
        }

        socket.join(ROOMS.waiters(reqRestaurantId));
        console.log(`[Waiter] Socket ${socket.id} joined waiters room: ${reqRestaurantId}`);
      } else {
        console.warn(`[Waiter] User ${userId} with role ${userRole} cannot join waiters room`);
      }
    });

    // Handle waiter call from client
    socket.on('call-waiter', async (data: { sessionId: string; tableId: string; reason?: string }) => {
      try {
        await emitWaiterCalled(io, data.sessionId, userId, data.reason);
      } catch (error) {
        console.error('[Waiter] Error handling call-waiter event:', error);
      }
    });

    // Handle assistance request
    socket.on('request-assistance', async (data: { sessionId: string; tableId: string; reason: string }) => {
      try {
        await emitTableNeedsAttention(io, data.sessionId, 'assistance', 'normal');
      } catch (error) {
        console.error('[Waiter] Error handling request-assistance event:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Waiter] Socket ${socket.id} disconnected`);
    });
  });
};
