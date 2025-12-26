import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler';
import { generatePaymentToken, generatePaymentLink } from '../../utils/tokens';
import type { CreateSplitBillInput, CreatePaymentInput, ProcessSplitPaymentInput } from './payments.schema';

export class PaymentsService {
  // ============================================
  // SPLIT BILL LOGIC 🔥🔥🔥
  // ============================================

  async createSplitBill(orderId: string, requestingUserId: string, data: CreateSplitBillInput) {
    // Verify order exists and user is participant
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            menuItem: true,
          },
        },
        participants: true,
        restaurant: true,
      },
    });

    if (!order) {
      throw new AppError(404, 'Order not found');
    }

    const isParticipant = order.participants.some((p) => p.userId === requestingUserId);
    if (!isParticipant) {
      throw new AppError(403, 'You are not a participant in this order');
    }

    if (order.isSplit) {
      throw new AppError(400, 'Order has already been split');
    }

    // Calculate split amounts based on method
    const splitPayments = await this.calculateSplitAmounts(order, data);

    // Validate total matches order total
    const totalSplitAmount = splitPayments.reduce((sum, sp) => sum + sp.amountDue, 0);
    const orderTotal = Number(order.totalAmount);

    if (Math.abs(totalSplitAmount - orderTotal) > 0.01) {
      throw new AppError(400, 'Split amounts do not match order total');
    }

    // Create split payments with payment links
    const createdSplitPayments = await Promise.all(
      splitPayments.map(async (sp) => {
        const token = generatePaymentToken();
        const paymentLink = generatePaymentLink(token);

        // Payment expires in 24 hours
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        return prisma.splitPayment.create({
          data: {
            orderId: orderId,
            userId: sp.userId,
            userEmail: sp.userEmail,
            userName: sp.userName,
            splitMethod: data.splitMethod,
            amountDue: sp.amountDue,
            paymentToken: token,
            paymentLink: paymentLink,
            expiresAt: expiresAt,
            paymentStatus: 'PENDING',
          },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        });
      })
    );

    // Mark order as split
    await prisma.order.update({
      where: { id: orderId },
      data: {
        isSplit: true,
        splitCount: data.participants.length,
      },
    });

    return createdSplitPayments;
  }

  private async calculateSplitAmounts(order: any, data: CreateSplitBillInput) {
    const orderTotal = Number(order.totalAmount);

    switch (data.splitMethod) {
      case 'EQUAL':
        // Divide equally among participants
        const equalAmount = orderTotal / data.participants.length;
        return data.participants.map((p) => ({
          ...p,
          amountDue: Math.round(equalAmount * 100) / 100, // Round to 2 decimals
        }));

      case 'BY_ITEM':
        // Each person pays for what they ordered
        return this.calculateByItemSplit(order, data.participants);

      case 'CUSTOM':
        // Use amounts provided by user
        if (!data.participants.every((p) => p.amountDue)) {
          throw new AppError(400, 'All participants must have amountDue for CUSTOM split method');
        }
        return data.participants.map((p) => ({
          ...p,
          amountDue: p.amountDue!,
        }));

      case 'PERCENTAGE':
        // Calculate based on percentages (not implemented in this version)
        throw new AppError(400, 'PERCENTAGE split method not yet implemented');

      default:
        throw new AppError(400, 'Invalid split method');
    }
  }

  private calculateByItemSplit(order: any, participants: any[]) {
    // Calculate amount each participant owes based on their items
    const participantAmounts: Record<string, number> = {};

    // Initialize amounts
    participants.forEach((p) => {
      participantAmounts[p.userId] = 0;
    });

    // Calculate per-item costs
    order.orderItems.forEach((item: any) => {
      const itemTotal = Number(item.unitPrice) * item.quantity;

      if (item.isShared && item.sharedWith.length > 0) {
        // Split among shared users
        const shareCount = item.sharedWith.length;
        const shareAmount = itemTotal / shareCount;

        item.sharedWith.forEach((userId: string) => {
          if (participantAmounts[userId] !== undefined) {
            participantAmounts[userId] += shareAmount;
          }
        });
      } else if (item.userId && participantAmounts[item.userId] !== undefined) {
        // Individual item
        participantAmounts[item.userId] += itemTotal;
      }
    });

    // Add proportional taxes and discounts
    const subtotal = Number(order.subtotal);
    const taxAmount = Number(order.taxAmount);
    const discountAmount = Number(order.discountAmount);

    return participants.map((p) => {
      const baseAmount = participantAmounts[p.userId] || 0;
      const proportion = subtotal > 0 ? baseAmount / subtotal : 0;

      // Apply proportional tax and discount
      const finalAmount = baseAmount + (taxAmount * proportion) - (discountAmount * proportion);

      return {
        ...p,
        amountDue: Math.round(finalAmount * 100) / 100,
      };
    });
  }

  async getSplitPaymentsByOrder(orderId: string) {
    const splitPayments = await prisma.splitPayment.findMany({
      where: { orderId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        payment: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return splitPayments;
  }

  async getSplitPaymentByToken(token: string) {
    const splitPayment = await prisma.splitPayment.findUnique({
      where: { paymentToken: token },
      include: {
        order: {
          include: {
            restaurant: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!splitPayment) {
      throw new AppError(404, 'Payment link not found or expired');
    }

    // Check if expired
    if (splitPayment.expiresAt && new Date() > splitPayment.expiresAt) {
      throw new AppError(400, 'Payment link has expired');
    }

    // Check if already paid
    if (splitPayment.paymentStatus === 'PAID') {
      throw new AppError(400, 'This payment has already been completed');
    }

    return splitPayment;
  }

  // ============================================
  // PAYMENT PROCESSING
  // ============================================

  async processSplitPayment(splitPaymentId: string, data: ProcessSplitPaymentInput) {
    const splitPayment = await prisma.splitPayment.findUnique({
      where: { id: splitPaymentId },
      include: {
        order: true,
      },
    });

    if (!splitPayment) {
      throw new AppError(404, 'Split payment not found');
    }

    if (splitPayment.paymentStatus === 'PAID') {
      throw new AppError(400, 'Payment already completed');
    }

    // TODO: Integrate with actual payment gateway (Stripe/Mercado Pago)
    // For now, we'll create a mock successful payment

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: splitPayment.orderId,
        method: data.method,
        gateway: data.gateway,
        gatewayId: data.paymentToken || `mock_${Date.now()}`,
        amount: splitPayment.amountDue,
        currency: 'BRL',
        status: 'COMPLETED',
        metadata: data.metadata,
        processedAt: new Date(),
        completedAt: new Date(),
      },
    });

    // Update split payment status
    const updatedSplitPayment = await prisma.splitPayment.update({
      where: { id: splitPaymentId },
      data: {
        paymentStatus: 'PAID',
        paymentId: payment.id,
        paidAt: new Date(),
      },
      include: {
        payment: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    // Check if all split payments are complete
    const allSplitPayments = await prisma.splitPayment.findMany({
      where: { orderId: splitPayment.orderId },
    });

    const allPaid = allSplitPayments.every((sp) => sp.paymentStatus === 'PAID');

    if (allPaid) {
      // Mark order as completed
      await prisma.order.update({
        where: { id: splitPayment.orderId },
        data: {
          status: 'DELIVERED',
          completedAt: new Date(),
        },
      });
    }

    return updatedSplitPayment;
  }

  async createPayment(userId: string, data: CreatePaymentInput) {
    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
    });

    if (!order) {
      throw new AppError(404, 'Order not found');
    }

    if (order.isSplit) {
      throw new AppError(400, 'Cannot create regular payment for split order. Use split payment endpoints.');
    }

    // TODO: Integrate with actual payment gateway
    // For now, create mock payment

    const payment = await prisma.payment.create({
      data: {
        orderId: data.orderId,
        method: data.method,
        gateway: data.gateway,
        gatewayId: `mock_${Date.now()}`,
        amount: data.amount,
        currency: 'BRL',
        status: data.method === 'CASH' ? 'COMPLETED' : 'PENDING',
        metadata: data.metadata,
        processedAt: data.method === 'CASH' ? new Date() : undefined,
        completedAt: data.method === 'CASH' ? new Date() : undefined,
      },
    });

    return payment;
  }

  async getPaymentsByOrder(orderId: string) {
    const payments = await prisma.payment.findMany({
      where: { orderId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return payments;
  }
}
