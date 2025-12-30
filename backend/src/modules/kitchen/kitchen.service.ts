/**
 * Kitchen Service - Business Logic for Kitchen Operations
 * FAANG-level implementation with real-time integration
 */

import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler';
import type {
  GetOrdersQuery,
  StartOrderInput,
  MarkOrderReadyInput,
  UpdatePriorityInput,
  KitchenOrder,
  KitchenOrderItem,
  KitchenStats,
  ActiveOrdersResponse,
  OrderPriority,
} from './kitchen.schema';

export class KitchenService {
  /**
   * Verify kitchen staff access to restaurant
   */
  private async verifyKitchenAccess(userId: string, restaurantId: string): Promise<void> {
    // Check if user is restaurant owner
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new AppError(404, 'Restaurante não encontrado');
    }

    if (restaurant.ownerId === userId) {
      return; // Owner has full access
    }

    // Check if user is kitchen staff
    const staff = await prisma.staff.findFirst({
      where: {
        restaurantId,
        userId,
        isActive: true,
        role: { in: ['KITCHEN', 'MANAGER'] },
      },
    });

    if (!staff) {
      throw new AppError(403, 'Acesso negado. Apenas equipe de cozinha pode acessar.');
    }
  }

  /**
   * Transform database order to kitchen order format
   */
  private transformToKitchenOrder(order: any): KitchenOrder {
    const items: KitchenOrderItem[] = order.orderItems.map((item: any) => ({
      id: item.id,
      name: item.menuItem?.name || 'Item desconhecido',
      quantity: item.quantity,
      notes: item.notes,
      customizations: item.customizations,
      status: item.status || 'PENDING',
    }));

    // Calculate priority based on wait time
    const waitTimeMinutes = Math.floor(
      (Date.now() - new Date(order.createdAt).getTime()) / 60000
    );

    let priority: OrderPriority = 'NORMAL';
    if (waitTimeMinutes > 30) priority = 'URGENT';
    else if (waitTimeMinutes > 20) priority = 'HIGH';
    else if (waitTimeMinutes < 5) priority = 'LOW';

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      tableNumber: order.tableNumber,
      status: order.status,
      items,
      priority,
      createdAt: order.createdAt.toISOString(),
      confirmedAt: order.confirmedAt?.toISOString() || null,
      startedAt: order.preparingAt?.toISOString() || null,
      estimatedReadyAt: order.estimatedReadyAt?.toISOString() || null,
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
      customerName: order.participants?.[0]?.user?.fullName || null,
      notes: order.notes,
    };
  }

  /**
   * Get all active orders for kitchen Kanban board
   */
  async getActiveOrders(userId: string, restaurantId: string): Promise<ActiveOrdersResponse> {
    await this.verifyKitchenAccess(userId, restaurantId);

    const orders = await prisma.order.findMany({
      where: {
        restaurantId,
        status: { in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'] },
      },
      include: {
        orderItems: {
          include: {
            menuItem: {
              select: { id: true, name: true, category: true },
            },
          },
        },
        participants: {
          include: {
            user: {
              select: { id: true, fullName: true },
            },
          },
          take: 1,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const kitchenOrders = orders.map(this.transformToKitchenOrder);

    // Group by status
    const grouped: ActiveOrdersResponse = {
      pending: kitchenOrders.filter((o) => o.status === 'PENDING'),
      confirmed: kitchenOrders.filter((o) => o.status === 'CONFIRMED'),
      preparing: kitchenOrders.filter((o) => o.status === 'PREPARING'),
      ready: kitchenOrders.filter((o) => o.status === 'READY'),
      stats: await this.getStats(restaurantId),
    };

    return grouped;
  }

  /**
   * Get orders by specific status
   */
  async getOrdersByStatus(
    userId: string,
    restaurantId: string,
    query: GetOrdersQuery
  ): Promise<{ orders: KitchenOrder[]; total: number; page: number; limit: number }> {
    await this.verifyKitchenAccess(userId, restaurantId);

    const where: any = { restaurantId };
    if (query.status) {
      where.status = query.status;
    } else {
      where.status = { in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'] };
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          orderItems: {
            include: {
              menuItem: {
                select: { id: true, name: true, category: true },
              },
            },
          },
          participants: {
            include: {
              user: {
                select: { id: true, fullName: true },
              },
            },
            take: 1,
          },
        },
        orderBy: { createdAt: 'asc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders: orders.map(this.transformToKitchenOrder),
      total,
      page: query.page,
      limit: query.limit,
    };
  }

  /**
   * Get single order details
   */
  async getOrderById(userId: string, restaurantId: string, orderId: string): Promise<KitchenOrder> {
    await this.verifyKitchenAccess(userId, restaurantId);

    const order = await prisma.order.findFirst({
      where: { id: orderId, restaurantId },
      include: {
        orderItems: {
          include: {
            menuItem: {
              select: { id: true, name: true, category: true },
            },
          },
        },
        participants: {
          include: {
            user: {
              select: { id: true, fullName: true },
            },
          },
          take: 1,
        },
      },
    });

    if (!order) {
      throw new AppError(404, 'Pedido não encontrado');
    }

    return this.transformToKitchenOrder(order);
  }

  /**
   * Start preparing an order (CONFIRMED -> PREPARING)
   */
  async startOrder(
    userId: string,
    restaurantId: string,
    orderId: string,
    data: StartOrderInput
  ): Promise<KitchenOrder> {
    await this.verifyKitchenAccess(userId, restaurantId);

    const order = await prisma.order.findFirst({
      where: { id: orderId, restaurantId },
    });

    if (!order) {
      throw new AppError(404, 'Pedido não encontrado');
    }

    if (order.status !== 'CONFIRMED' && order.status !== 'PENDING') {
      throw new AppError(400, `Não é possível iniciar um pedido com status ${order.status}`);
    }

    const estimatedReadyAt = data.estimatedMinutes
      ? new Date(Date.now() + data.estimatedMinutes * 60000)
      : null;

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PREPARING',
        preparingAt: new Date(),
        estimatedReadyAt,
      },
      include: {
        orderItems: {
          include: {
            menuItem: {
              select: { id: true, name: true, category: true },
            },
          },
        },
        participants: {
          include: {
            user: {
              select: { id: true, fullName: true },
            },
          },
          take: 1,
        },
      },
    });

    return this.transformToKitchenOrder(updatedOrder);
  }

  /**
   * Mark order as ready (PREPARING -> READY)
   */
  async markOrderReady(
    userId: string,
    restaurantId: string,
    orderId: string,
    data: MarkOrderReadyInput
  ): Promise<KitchenOrder> {
    await this.verifyKitchenAccess(userId, restaurantId);

    const order = await prisma.order.findFirst({
      where: { id: orderId, restaurantId },
    });

    if (!order) {
      throw new AppError(404, 'Pedido não encontrado');
    }

    if (order.status !== 'PREPARING') {
      throw new AppError(400, `Não é possível marcar como pronto um pedido com status ${order.status}`);
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'READY',
        readyAt: new Date(),
        notes: data.notes ? `${order.notes || ''}\n[Cozinha]: ${data.notes}`.trim() : order.notes,
      },
      include: {
        orderItems: {
          include: {
            menuItem: {
              select: { id: true, name: true, category: true },
            },
          },
        },
        participants: {
          include: {
            user: {
              select: { id: true, fullName: true },
            },
          },
          take: 1,
        },
      },
    });

    return this.transformToKitchenOrder(updatedOrder);
  }

  /**
   * Confirm order (PENDING -> CONFIRMED)
   */
  async confirmOrder(userId: string, restaurantId: string, orderId: string): Promise<KitchenOrder> {
    await this.verifyKitchenAccess(userId, restaurantId);

    const order = await prisma.order.findFirst({
      where: { id: orderId, restaurantId },
    });

    if (!order) {
      throw new AppError(404, 'Pedido não encontrado');
    }

    if (order.status !== 'PENDING') {
      throw new AppError(400, `Não é possível confirmar um pedido com status ${order.status}`);
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date(),
      },
      include: {
        orderItems: {
          include: {
            menuItem: {
              select: { id: true, name: true, category: true },
            },
          },
        },
        participants: {
          include: {
            user: {
              select: { id: true, fullName: true },
            },
          },
          take: 1,
        },
      },
    });

    return this.transformToKitchenOrder(updatedOrder);
  }

  /**
   * Cancel order
   */
  async cancelOrder(
    userId: string,
    restaurantId: string,
    orderId: string,
    reason?: string
  ): Promise<KitchenOrder> {
    await this.verifyKitchenAccess(userId, restaurantId);

    const order = await prisma.order.findFirst({
      where: { id: orderId, restaurantId },
    });

    if (!order) {
      throw new AppError(404, 'Pedido não encontrado');
    }

    if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
      throw new AppError(400, `Não é possível cancelar um pedido com status ${order.status}`);
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        notes: reason ? `${order.notes || ''}\n[Cancelado]: ${reason}`.trim() : order.notes,
      },
      include: {
        orderItems: {
          include: {
            menuItem: {
              select: { id: true, name: true, category: true },
            },
          },
        },
        participants: {
          include: {
            user: {
              select: { id: true, fullName: true },
            },
          },
          take: 1,
        },
      },
    });

    return this.transformToKitchenOrder(updatedOrder);
  }

  /**
   * Get kitchen statistics
   */
  async getStats(restaurantId: string): Promise<KitchenStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      ordersToday,
      pendingCount,
      preparingCount,
      readyCount,
      deliveredToday,
      cancelledToday,
      completedOrders,
    ] = await Promise.all([
      prisma.order.count({
        where: {
          restaurantId,
          createdAt: { gte: today },
        },
      }),
      prisma.order.count({
        where: { restaurantId, status: 'PENDING' },
      }),
      prisma.order.count({
        where: { restaurantId, status: 'PREPARING' },
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
      prisma.order.count({
        where: {
          restaurantId,
          status: 'CANCELLED',
          cancelledAt: { gte: today },
        },
      }),
      prisma.order.findMany({
        where: {
          restaurantId,
          status: 'DELIVERED',
          completedAt: { gte: today },
          preparingAt: { not: null },
          readyAt: { not: null },
        },
        select: {
          preparingAt: true,
          readyAt: true,
        },
      }),
    ]);

    // Calculate average prep time
    let avgPrepTimeMinutes = 0;
    if (completedOrders.length > 0) {
      const totalPrepTime = completedOrders.reduce((sum, order) => {
        if (order.preparingAt && order.readyAt) {
          return sum + (order.readyAt.getTime() - order.preparingAt.getTime());
        }
        return sum;
      }, 0);
      avgPrepTimeMinutes = Math.round(totalPrepTime / completedOrders.length / 60000);
    }

    // Calculate orders per hour (last 4 hours)
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
    const recentOrders = await prisma.order.count({
      where: {
        restaurantId,
        createdAt: { gte: fourHoursAgo },
      },
    });
    const ordersPerHour = Math.round(recentOrders / 4);

    return {
      ordersToday,
      avgPrepTimeMinutes,
      ordersPerHour,
      pendingCount,
      preparingCount,
      readyCount,
      deliveredToday,
      cancelledToday,
    };
  }
}
