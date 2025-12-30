/**
 * Waiter Service - Business Logic for Waiter Operations
 * FAANG-level implementation with real-time integration
 */

import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler';
import type {
  CreateWaiterCallInput,
  GetCallsQuery,
  GetTablesQuery,
  WaiterCall,
  TableWithSession,
  ReadyOrder,
  WaiterDashboardData,
  WaiterStats,
} from './waiter.schema';

export class WaiterService {
  /**
   * Verify waiter/staff access to restaurant
   */
  private async verifyWaiterAccess(userId: string, restaurantId: string): Promise<void> {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new AppError(404, 'Restaurante não encontrado');
    }

    if (restaurant.ownerId === userId) {
      return; // Owner has full access
    }

    const staff = await prisma.staff.findFirst({
      where: {
        restaurantId,
        userId,
        isActive: true,
        role: { in: ['WAITER', 'MANAGER'] },
      },
    });

    if (!staff) {
      throw new AppError(403, 'Acesso negado. Apenas garçons podem acessar.');
    }
  }

  /**
   * Get full dashboard data for waiter
   */
  async getDashboard(userId: string, restaurantId: string): Promise<WaiterDashboardData> {
    await this.verifyWaiterAccess(userId, restaurantId);

    const [tables, pendingCalls, readyOrders, stats] = await Promise.all([
      this.getTablesWithSessions(restaurantId),
      this.getPendingCalls(restaurantId),
      this.getReadyOrders(restaurantId),
      this.getStats(restaurantId),
    ]);

    return { tables, pendingCalls, readyOrders, stats };
  }

  /**
   * Get all tables with their active sessions
   */
  async getTablesWithSessions(restaurantId: string): Promise<TableWithSession[]> {
    const tables = await prisma.table.findMany({
      where: { restaurantId, isActive: true },
      include: {
        tableSessions: {
          where: { status: 'ACTIVE' },
          include: {
            members: {
              where: { status: 'APPROVED' },
            },
            orders: {
              where: { status: { not: 'CANCELLED' } },
            },
          },
          take: 1,
        },
      },
      orderBy: { number: 'asc' },
    });

    // Get ready orders count per table
    const readyOrdersByTable = await prisma.order.groupBy({
      by: ['tableNumber'],
      where: {
        restaurantId,
        status: 'READY',
      },
      _count: true,
    });

    const readyOrdersMap = new Map(
      readyOrdersByTable.map((r) => [r.tableNumber, r._count])
    );

    // Get pending calls per table
    const pendingCalls = await prisma.waiterCall.findMany({
      where: {
        restaurantId,
        status: 'PENDING',
      },
      select: { tableNumber: true },
    });

    const pendingCallsSet = new Set(pendingCalls.map((c) => c.tableNumber));

    return tables.map((table) => {
      const session = table.tableSessions[0];
      const readyCount = readyOrdersMap.get(String(table.number)) || 0;

      return {
        id: table.id,
        number: table.number,
        capacity: table.capacity,
        isActive: table.isActive,
        qrCode: table.qrCode,
        session: session
          ? {
              id: session.id,
              status: session.status,
              memberCount: session.members.length,
              orderCount: session.orders.length,
              totalAmount: session.orders.reduce(
                (sum, o) => sum + Number(o.totalAmount),
                0
              ),
              startedAt: session.createdAt.toISOString(),
            }
          : null,
        hasPendingCall: pendingCallsSet.has(table.number),
        hasReadyOrders: readyCount > 0,
        readyOrdersCount: readyCount,
      };
    });
  }

  /**
   * Get tables filtered by criteria
   */
  async getTables(
    userId: string,
    restaurantId: string,
    query: GetTablesQuery
  ): Promise<TableWithSession[]> {
    await this.verifyWaiterAccess(userId, restaurantId);

    let tables = await this.getTablesWithSessions(restaurantId);

    if (query.hasActiveSession !== undefined) {
      tables = tables.filter(
        (t) => (t.session !== null) === query.hasActiveSession
      );
    }

    if (query.hasReadyOrders !== undefined) {
      tables = tables.filter((t) => t.hasReadyOrders === query.hasReadyOrders);
    }

    return tables;
  }

  /**
   * Get all ready orders awaiting delivery
   */
  async getReadyOrders(restaurantId: string): Promise<ReadyOrder[]> {
    const orders = await prisma.order.findMany({
      where: {
        restaurantId,
        status: 'READY',
      },
      include: {
        orderItems: {
          include: {
            menuItem: {
              select: { name: true },
            },
          },
        },
        participants: {
          include: {
            user: {
              select: { fullName: true },
            },
          },
          take: 1,
        },
      },
      orderBy: { readyAt: 'asc' },
    });

    return orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      tableNumber: order.tableNumber,
      tableId: order.tableSessionId,
      status: order.status,
      items: order.orderItems.map((item) => ({
        id: item.id,
        name: item.menuItem?.name || 'Item',
        quantity: item.quantity,
      })),
      totalItems: order.orderItems.reduce((sum, item) => sum + item.quantity, 0),
      readyAt: order.readyAt?.toISOString() || order.updatedAt.toISOString(),
      customerName: order.participants[0]?.user?.fullName || null,
    }));
  }

  /**
   * Mark order as delivered
   */
  async deliverOrder(
    userId: string,
    restaurantId: string,
    orderId: string
  ): Promise<ReadyOrder> {
    await this.verifyWaiterAccess(userId, restaurantId);

    const order = await prisma.order.findFirst({
      where: { id: orderId, restaurantId },
    });

    if (!order) {
      throw new AppError(404, 'Pedido não encontrado');
    }

    if (order.status !== 'READY') {
      throw new AppError(400, `Não é possível entregar um pedido com status ${order.status}`);
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'DELIVERED',
        completedAt: new Date(),
      },
      include: {
        orderItems: {
          include: {
            menuItem: {
              select: { name: true },
            },
          },
        },
        participants: {
          include: {
            user: {
              select: { fullName: true },
            },
          },
          take: 1,
        },
      },
    });

    return {
      id: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      tableNumber: updatedOrder.tableNumber,
      tableId: updatedOrder.tableSessionId,
      status: updatedOrder.status,
      items: updatedOrder.orderItems.map((item) => ({
        id: item.id,
        name: item.menuItem?.name || 'Item',
        quantity: item.quantity,
      })),
      totalItems: updatedOrder.orderItems.reduce((sum, item) => sum + item.quantity, 0),
      readyAt: updatedOrder.readyAt?.toISOString() || updatedOrder.updatedAt.toISOString(),
      customerName: updatedOrder.participants[0]?.user?.fullName || null,
    };
  }

  /**
   * Create a waiter call from a table
   */
  async createCall(
    userId: string,
    restaurantId: string,
    data: CreateWaiterCallInput
  ): Promise<WaiterCall> {
    // Verify user is part of the session
    const session = await prisma.tableSession.findFirst({
      where: {
        id: data.sessionId,
        restaurantId,
        status: 'ACTIVE',
        members: {
          some: {
            userId,
            status: 'APPROVED',
          },
        },
      },
    });

    if (!session) {
      throw new AppError(403, 'Você não faz parte desta sessão');
    }

    // Check for existing pending call from this table
    const existingCall = await prisma.waiterCall.findFirst({
      where: {
        restaurantId,
        sessionId: data.sessionId,
        status: 'PENDING',
      },
    });

    if (existingCall) {
      throw new AppError(400, 'Já existe uma chamada pendente para esta mesa');
    }

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    const call = await prisma.waiterCall.create({
      data: {
        restaurantId,
        sessionId: data.sessionId,
        tableNumber: data.tableNumber,
        reason: data.reason,
        priority: data.priority,
        expiresAt,
      },
    });

    return this.transformCall(call);
  }

  /**
   * Get pending waiter calls
   */
  async getPendingCalls(restaurantId: string): Promise<WaiterCall[]> {
    const calls = await prisma.waiterCall.findMany({
      where: {
        restaurantId,
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
      include: {
        waiter: {
          select: { fullName: true },
        },
      },
      orderBy: [{ priority: 'desc' }, { calledAt: 'asc' }],
    });

    return calls.map((call) => this.transformCall(call));
  }

  /**
   * Get waiter calls with filters
   */
  async getCalls(
    userId: string,
    restaurantId: string,
    query: GetCallsQuery
  ): Promise<{ calls: WaiterCall[]; total: number }> {
    await this.verifyWaiterAccess(userId, restaurantId);

    const where: any = { restaurantId };
    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;

    const [calls, total] = await Promise.all([
      prisma.waiterCall.findMany({
        where,
        include: {
          waiter: {
            select: { fullName: true },
          },
        },
        orderBy: [{ priority: 'desc' }, { calledAt: 'desc' }],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.waiterCall.count({ where }),
    ]);

    return {
      calls: calls.map((call) => this.transformCall(call)),
      total,
    };
  }

  /**
   * Acknowledge a waiter call
   */
  async acknowledgeCall(
    userId: string,
    restaurantId: string,
    callId: string
  ): Promise<WaiterCall> {
    await this.verifyWaiterAccess(userId, restaurantId);

    const call = await prisma.waiterCall.findFirst({
      where: { id: callId, restaurantId },
    });

    if (!call) {
      throw new AppError(404, 'Chamada não encontrada');
    }

    if (call.status !== 'PENDING') {
      throw new AppError(400, 'Esta chamada já foi atendida');
    }

    const updatedCall = await prisma.waiterCall.update({
      where: { id: callId },
      data: {
        status: 'ACKNOWLEDGED',
        waiterId: userId,
        acknowledgedAt: new Date(),
      },
      include: {
        waiter: {
          select: { fullName: true },
        },
      },
    });

    return this.transformCall(updatedCall);
  }

  /**
   * Complete a waiter call
   */
  async completeCall(
    userId: string,
    restaurantId: string,
    callId: string
  ): Promise<WaiterCall> {
    await this.verifyWaiterAccess(userId, restaurantId);

    const call = await prisma.waiterCall.findFirst({
      where: { id: callId, restaurantId },
    });

    if (!call) {
      throw new AppError(404, 'Chamada não encontrada');
    }

    if (call.status === 'COMPLETED') {
      throw new AppError(400, 'Esta chamada já foi completada');
    }

    const updatedCall = await prisma.waiterCall.update({
      where: { id: callId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        waiterId: call.waiterId || userId,
      },
      include: {
        waiter: {
          select: { fullName: true },
        },
      },
    });

    return this.transformCall(updatedCall);
  }

  /**
   * Get waiter statistics
   */
  async getStats(restaurantId: string): Promise<WaiterStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalTables,
      activeTables,
      pendingCalls,
      readyOrders,
      deliveredToday,
      completedCalls,
    ] = await Promise.all([
      prisma.table.count({ where: { restaurantId, isActive: true } }),
      prisma.tableSession.count({
        where: { restaurantId, status: 'ACTIVE' },
      }),
      prisma.waiterCall.count({
        where: { restaurantId, status: 'PENDING' },
      }),
      prisma.order.count({
        where: { restaurantId, status: 'READY' },
      }),
      prisma.order.count({
        where: {
          restaurantId,
          status: 'DELIVERED',
          completedAt: { gte: today },
        },
      }),
      prisma.waiterCall.findMany({
        where: {
          restaurantId,
          status: 'COMPLETED',
          completedAt: { gte: today },
          acknowledgedAt: { not: null },
        },
        select: {
          calledAt: true,
          acknowledgedAt: true,
        },
      }),
    ]);

    // Calculate average response time
    let avgResponseTime = 0;
    if (completedCalls.length > 0) {
      const totalResponseTime = completedCalls.reduce((sum, call) => {
        if (call.acknowledgedAt) {
          return sum + (call.acknowledgedAt.getTime() - call.calledAt.getTime());
        }
        return sum;
      }, 0);
      avgResponseTime = Math.round(totalResponseTime / completedCalls.length / 1000); // seconds
    }

    return {
      activeTables,
      totalTables,
      pendingCalls,
      readyOrders,
      deliveredToday,
      avgResponseTime,
    };
  }

  /**
   * Transform database call to API response
   */
  private transformCall(call: any): WaiterCall {
    return {
      id: call.id,
      restaurantId: call.restaurantId,
      sessionId: call.sessionId,
      tableNumber: call.tableNumber,
      reason: call.reason,
      status: call.status,
      priority: call.priority,
      waiterId: call.waiterId,
      waiterName: call.waiter?.fullName || null,
      calledAt: call.calledAt.toISOString(),
      acknowledgedAt: call.acknowledgedAt?.toISOString() || null,
      completedAt: call.completedAt?.toISOString() || null,
      expiresAt: call.expiresAt.toISOString(),
    };
  }
}
