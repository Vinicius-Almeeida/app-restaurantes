/**
 * Tables Socket Handler
 * Handles real-time table session events
 */

import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
  MemberJoinRequestPayload,
  MemberApprovedPayload,
  MemberRejectedPayload,
  MemberLeftPayload,
  SessionClosedPayload,
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
 * Emits member join request to session owner
 */
export const emitMemberJoinRequest = async (
  io: TypedServer,
  sessionId: string,
  memberId: string
): Promise<void> => {
  try {
    const member = await prisma.tableSessionMember.findUnique({
      where: { id: memberId },
      include: {
        user: {
          select: { id: true, fullName: true, email: true },
        },
        session: {
          include: {
            table: {
              select: { id: true, number: true, restaurantId: true },
            },
            members: {
              where: { role: 'OWNER', status: 'APPROVED' },
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!member || !member.session) {
      console.error(`[Tables] Member ${memberId} or session not found`);
      return;
    }

    const payload: MemberJoinRequestPayload = {
      sessionId: member.sessionId,
      tableId: member.session.table.id,
      tableNumber: member.session.table.number,
      restaurantId: member.session.table.restaurantId,
      member: {
        id: member.id,
        userId: member.user.id,
        userName: member.user.fullName,
        userEmail: member.user.email,
        status: member.status,
      },
      requestedAt: member.createdAt.toISOString(),
    };

    // Notify session owner
    const owner = member.session.members[0];
    if (owner) {
      io.to(ROOMS.user(owner.userId)).emit('member-join-request', payload);
    }

    // Notify session room
    io.to(ROOMS.session(sessionId)).emit('member-join-request', payload);

    console.log(`[Tables] Member join request: ${member.user.fullName} -> Session ${sessionId}`);

    await prisma.auditLog.create({
      data: {
        userId: member.userId,
        action: 'TABLE_MEMBER_JOIN_REQUEST',
        entityType: 'TableSessionMember',
        entityId: member.id,
        newValue: {
          sessionId,
          userName: member.user.fullName,
        },
      },
    });
  } catch (error) {
    console.error('[Tables] Error emitting member join request:', error);
  }
};

/**
 * Emits member approved event
 */
export const emitMemberApproved = async (
  io: TypedServer,
  sessionId: string,
  memberId: string
): Promise<void> => {
  try {
    const member = await prisma.tableSessionMember.findUnique({
      where: { id: memberId },
      include: {
        user: {
          select: { id: true, fullName: true },
        },
        session: {
          include: {
            table: {
              select: { id: true, restaurantId: true },
            },
          },
        },
      },
    });

    if (!member || !member.session) {
      console.error(`[Tables] Member ${memberId} or session not found`);
      return;
    }

    const payload: MemberApprovedPayload = {
      sessionId: member.sessionId,
      tableId: member.session.table.id,
      restaurantId: member.session.table.restaurantId,
      member: {
        id: member.id,
        userId: member.user.id,
        userName: member.user.fullName,
        role: member.role,
        status: member.status,
      },
      approvedAt: member.updatedAt.toISOString(),
    };

    // Notify approved user
    io.to(ROOMS.user(member.userId)).emit('member-approved', payload);

    // Notify session room
    io.to(ROOMS.session(sessionId)).emit('member-approved', payload);

    console.log(`[Tables] Member approved: ${member.user.fullName} in session ${sessionId}`);

    await prisma.auditLog.create({
      data: {
        userId: member.userId,
        action: 'TABLE_MEMBER_APPROVED',
        entityType: 'TableSessionMember',
        entityId: member.id,
        newValue: {
          sessionId,
          userName: member.user.fullName,
          status: 'APPROVED',
        },
      },
    });
  } catch (error) {
    console.error('[Tables] Error emitting member approved:', error);
  }
};

/**
 * Emits member rejected event
 */
export const emitMemberRejected = async (
  io: TypedServer,
  sessionId: string,
  userId: string,
  userName: string,
  reason?: string
): Promise<void> => {
  try {
    const session = await prisma.tableSession.findUnique({
      where: { id: sessionId },
      include: {
        table: {
          select: { id: true, restaurantId: true },
        },
      },
    });

    if (!session) {
      console.error(`[Tables] Session ${sessionId} not found`);
      return;
    }

    const payload: MemberRejectedPayload = {
      sessionId,
      tableId: session.table.id,
      restaurantId: session.table.restaurantId,
      userId,
      userName,
      reason,
    };

    // Notify rejected user
    io.to(ROOMS.user(userId)).emit('member-rejected', payload);

    // Notify session room
    io.to(ROOMS.session(sessionId)).emit('member-rejected', payload);

    console.log(`[Tables] Member rejected: ${userName} from session ${sessionId}`);

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'TABLE_MEMBER_REJECTED',
        entityType: 'TableSessionMember',
        newValue: {
          sessionId,
          userName,
          reason: reason || 'No reason provided',
        },
      },
    });
  } catch (error) {
    console.error('[Tables] Error emitting member rejected:', error);
  }
};

/**
 * Emits member left event
 */
export const emitMemberLeft = async (
  io: TypedServer,
  sessionId: string,
  memberId: string
): Promise<void> => {
  try {
    const member = await prisma.tableSessionMember.findUnique({
      where: { id: memberId },
      include: {
        user: {
          select: { id: true, fullName: true },
        },
        session: {
          include: {
            table: {
              select: { id: true, restaurantId: true },
            },
          },
        },
      },
    });

    if (!member || !member.session) {
      console.error(`[Tables] Member ${memberId} or session not found`);
      return;
    }

    const remainingMembers = await prisma.tableSessionMember.count({
      where: {
        sessionId,
        status: 'APPROVED',
        NOT: { id: memberId },
      },
    });

    const payload: MemberLeftPayload = {
      sessionId: member.sessionId,
      tableId: member.session.table.id,
      restaurantId: member.session.table.restaurantId,
      member: {
        id: member.id,
        userId: member.user.id,
        userName: member.user.fullName,
      },
      leftAt: member.leftAt?.toISOString() || new Date().toISOString(),
      remainingMembers,
    };

    // Notify session room
    io.to(ROOMS.session(sessionId)).emit('member-left', payload);

    // Notify restaurant staff
    io.to(ROOMS.restaurant(member.session.table.restaurantId)).emit('member-left', payload);

    console.log(`[Tables] Member left: ${member.user.fullName} from session ${sessionId}`);

    await prisma.auditLog.create({
      data: {
        userId: member.userId,
        action: 'TABLE_MEMBER_LEFT',
        entityType: 'TableSessionMember',
        entityId: member.id,
        newValue: {
          sessionId,
          userName: member.user.fullName,
          remainingMembers,
        },
      },
    });
  } catch (error) {
    console.error('[Tables] Error emitting member left:', error);
  }
};

/**
 * Emits session closed event
 */
export const emitSessionClosed = async (
  io: TypedServer,
  sessionId: string
): Promise<void> => {
  try {
    const session = await prisma.tableSession.findUnique({
      where: { id: sessionId },
      include: {
        table: {
          select: { id: true, number: true, restaurantId: true },
        },
      },
    });

    if (!session) {
      console.error(`[Tables] Session ${sessionId} not found`);
      return;
    }

    const payload: SessionClosedPayload = {
      sessionId: session.id,
      tableId: session.table.id,
      tableNumber: session.table.number,
      restaurantId: session.table.restaurantId,
      totalAmount: Number(session.totalAmount),
      closedAt: session.closedAt?.toISOString() || new Date().toISOString(),
    };

    // Notify session room
    io.to(ROOMS.session(sessionId)).emit('session-closed', payload);

    // Notify restaurant staff
    io.to(ROOMS.restaurant(session.table.restaurantId)).emit('session-closed', payload);

    console.log(`[Tables] Session closed: ${sessionId} (Table ${session.table.number})`);

    await prisma.auditLog.create({
      data: {
        action: 'TABLE_SESSION_CLOSED',
        entityType: 'TableSession',
        entityId: session.id,
        newValue: {
          sessionId,
          tableNumber: session.table.number,
          totalAmount: Number(session.totalAmount),
        },
      },
    });
  } catch (error) {
    console.error('[Tables] Error emitting session closed:', error);
  }
};

/**
 * Setup table event handlers
 */
export const setupTableHandlers = (io: TypedServer): void => {
  io.on('connection', (socket) => {
    const userId = socket.data.userId;

    console.log(`[Tables] Socket ${socket.id} connected (User: ${userId})`);

    // Join personal user room for direct notifications
    socket.join(ROOMS.user(userId));

    // Join session room
    socket.on('join-session', (sessionId: string) => {
      socket.join(ROOMS.session(sessionId));
      console.log(`[Tables] Socket ${socket.id} joined session ${sessionId}`);
    });

    // Leave session room
    socket.on('leave-session', (sessionId: string) => {
      socket.leave(ROOMS.session(sessionId));
      console.log(`[Tables] Socket ${socket.id} left session ${sessionId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Tables] Socket ${socket.id} disconnected`);
    });
  });
};
