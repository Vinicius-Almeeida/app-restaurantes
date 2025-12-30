/**
 * Payments Socket Handler
 * Handles real-time payment events
 */

import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
  PaymentReceivedPayload,
  AllPaymentsCompletePayload,
  SplitCreatedPayload,
  SplitUpdatedPayload,
  ROOMS,
} from '../types/socket.types';

const prisma = new PrismaClient();

export type TypedServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export const emitPaymentReceived = async (
  io: TypedServer,
  paymentId: string
): Promise<void> => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          select: {
            id: true,
            restaurantId: true,
            tableSessionId: true,
          },
        },
      },
    });

    if (!payment) {
      console.error(`[Payments] Payment ${paymentId} not found`);
      return;
    }

    const payload: PaymentReceivedPayload = {
      paymentId: payment.id,
      orderId: payment.orderId,
      amount: Number(payment.amount),
      method: payment.method,
      status: payment.status,
      paidAt: payment.completedAt?.toISOString() || new Date().toISOString(),
    };

    io.to(ROOMS.restaurant(payment.order.restaurantId)).emit('payment-received', payload);

    if (payment.order.tableSessionId) {
      io.to(ROOMS.session(payment.order.tableSessionId)).emit('payment-received', payload);
    }

    console.log(`[Payments] Payment ${paymentId} received`);

    await prisma.auditLog.create({
      data: {
        action: 'PAYMENT_RECEIVED',
        entityType: 'Payment',
        entityId: payment.id,
        newValue: {
          orderId: payment.orderId,
          amount: Number(payment.amount),
          method: payment.method,
        },
      },
    });
  } catch (error) {
    console.error('[Payments] Error emitting payment received:', error);
  }
};

export const emitAllPaymentsComplete = async (
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
        totalAmount: true,
        completedAt: true,
      },
    });

    if (!order) {
      console.error(`[Payments] Order ${orderId} not found`);
      return;
    }

    const paymentsCount = await prisma.payment.count({
      where: { orderId, status: 'COMPLETED' },
    });

    const payload: AllPaymentsCompletePayload = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      sessionId: order.tableSessionId,
      totalAmount: Number(order.totalAmount),
      completedAt: order.completedAt?.toISOString() || new Date().toISOString(),
    };

    io.to(ROOMS.restaurant(order.restaurantId)).emit('all-payments-complete', payload);

    if (order.tableSessionId) {
      io.to(ROOMS.session(order.tableSessionId)).emit('all-payments-complete', payload);
    }

    console.log(`[Payments] All payments complete for order ${order.orderNumber}`);
  } catch (error) {
    console.error('[Payments] Error emitting all payments complete:', error);
  }
};

export const emitSplitCreated = async (
  io: TypedServer,
  orderId: string
): Promise<void> => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        splitPayments: {
          select: {
            userId: true,
            userName: true,
            amountDue: true,
            paymentLink: true,
          },
        },
      },
    });

    if (!order) {
      console.error(`[Payments] Order ${orderId} not found`);
      return;
    }

    const payload: SplitCreatedPayload = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      splitMethod: order.isSplit ? 'BY_ITEM' : 'EQUAL',
      participants: order.splitPayments.map((sp) => ({
        userId: sp.userId,
        userName: sp.userName || 'Unknown',
        amountDue: Number(sp.amountDue),
        paymentLink: sp.paymentLink || '',
      })),
      createdAt: new Date().toISOString(),
    };

    io.to(ROOMS.restaurant(order.restaurantId)).emit('split-created', payload);

    if (order.tableSessionId) {
      io.to(ROOMS.session(order.tableSessionId)).emit('split-created', payload);
    }

    console.log(`[Payments] Split created for order ${order.orderNumber}`);
  } catch (error) {
    console.error('[Payments] Error emitting split created:', error);
  }
};

export const emitSplitUpdated = async (
  io: TypedServer,
  splitPaymentId: string
): Promise<void> => {
  try {
    const splitPayment = await prisma.splitPayment.findUnique({
      where: { id: splitPaymentId },
      include: {
        order: {
          select: {
            id: true,
            restaurantId: true,
            tableSessionId: true,
          },
        },
      },
    });

    if (!splitPayment) {
      console.error(`[Payments] Split payment ${splitPaymentId} not found`);
      return;
    }

    const remainingParticipants = await prisma.splitPayment.count({
      where: {
        orderId: splitPayment.orderId,
        paymentStatus: 'PENDING',
      },
    });

    const payload: SplitUpdatedPayload = {
      orderId: splitPayment.orderId,
      splitPaymentId: splitPayment.id,
      userId: splitPayment.userId,
      userName: splitPayment.userName || 'Unknown',
      amountDue: Number(splitPayment.amountDue),
      paymentStatus: splitPayment.paymentStatus,
      paidAt: splitPayment.paidAt?.toISOString() || null,
      remainingParticipants,
    };

    io.to(ROOMS.restaurant(splitPayment.order.restaurantId)).emit('split-updated', payload);

    if (splitPayment.order.tableSessionId) {
      io.to(ROOMS.session(splitPayment.order.tableSessionId)).emit('split-updated', payload);
    }

    console.log(`[Payments] Split payment updated for user ${splitPayment.userName}`);
  } catch (error) {
    console.error('[Payments] Error emitting split updated:', error);
  }
};

export const setupPaymentHandlers = (io: TypedServer): void => {
  io.on('connection', (socket) => {
    console.log(`[Payments] Socket ${socket.id} connected`);
  });
};
