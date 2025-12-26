import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler';
import { generateOrderNumber } from '../../utils/orderNumber';
import type { CreateOrderInput, AddItemToOrderInput, UpdateOrderStatusInput, AddParticipantInput } from './orders.schema';

export class OrdersService {
  async create(userId: string, data: CreateOrderInput) {
    // Verify restaurant exists and accepts orders
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: data.restaurantId },
    });

    if (!restaurant) {
      throw new AppError(404, 'Restaurant not found');
    }

    if (!restaurant.acceptsOrders) {
      throw new AppError(400, 'Restaurant is not accepting orders at the moment');
    }

    // Fetch menu items and validate
    const menuItemIds = data.items.map((item) => item.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
        restaurantId: data.restaurantId,
        isAvailable: true,
      },
    });

    if (menuItems.length !== menuItemIds.length) {
      throw new AppError(400, 'Some menu items are not available or do not belong to this restaurant');
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = data.items.map((item) => {
      const menuItem = menuItems.find((mi) => mi.id === item.menuItemId);
      if (!menuItem) {
        throw new AppError(400, `Menu item ${item.menuItemId} not found`);
      }

      const itemTotal = Number(menuItem.price) * item.quantity;
      subtotal += itemTotal;

      return {
        menuItemId: item.menuItemId,
        userId: userId,
        quantity: item.quantity,
        unitPrice: menuItem.price,
        customizations: item.customizations,
        notes: item.notes,
        isShared: item.isShared || false,
        sharedWith: item.sharedWith || [],
      };
    });

    const totalAmount = subtotal + data.taxAmount - data.discountAmount;

    // Generate unique order number
    let orderNumber = generateOrderNumber();
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const existing = await prisma.order.findUnique({
        where: { orderNumber },
      });

      if (!existing) {
        isUnique = true;
      } else {
        orderNumber = generateOrderNumber();
        attempts++;
      }
    }

    if (!isUnique) {
      throw new AppError(500, 'Failed to generate unique order number');
    }

    // Create order with items and participant
    const order = await prisma.order.create({
      data: {
        restaurantId: data.restaurantId,
        orderNumber,
        tableNumber: data.tableNumber,
        status: 'PENDING',
        subtotal,
        taxAmount: data.taxAmount,
        discountAmount: data.discountAmount,
        totalAmount,
        notes: data.notes,
        orderItems: {
          create: orderItems,
        },
        participants: {
          create: {
            userId: userId,
            role: 'creator',
          },
        },
      },
      include: {
        orderItems: {
          include: {
            menuItem: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return order;
  }

  async findById(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        orderItems: {
          include: {
            menuItem: true,
            user: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
        payments: true,
        splitPayments: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new AppError(404, 'Order not found');
    }

    return order;
  }

  async findAll(userId: string, role: string, restaurantId?: string) {
    let where: any = {};

    // If customer, show only their orders
    if (role === 'CUSTOMER') {
      where.participants = {
        some: {
          userId: userId,
        },
      };
    }

    // If restaurant owner, show only their restaurant's orders
    if (role === 'RESTAURANT_OWNER') {
      if (!restaurantId) {
        // Get all restaurants owned by this user
        const restaurants = await prisma.restaurant.findMany({
          where: { ownerId: userId },
          select: { id: true },
        });

        where.restaurantId = {
          in: restaurants.map((r) => r.id),
        };
      } else {
        // Verify ownership
        const restaurant = await prisma.restaurant.findUnique({
          where: { id: restaurantId },
        });

        if (!restaurant || restaurant.ownerId !== userId) {
          throw new AppError(403, 'You do not have permission to view these orders');
        }

        where.restaurantId = restaurantId;
      }
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            orderItems: true,
            participants: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders;
  }

  async addItem(orderId: string, userId: string, data: AddItemToOrderInput) {
    // Verify order exists and user is participant
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        participants: true,
        restaurant: true,
      },
    });

    if (!order) {
      throw new AppError(404, 'Order not found');
    }

    const isParticipant = order.participants.some((p) => p.userId === userId);
    if (!isParticipant) {
      throw new AppError(403, 'You are not a participant in this order');
    }

    if (order.status !== 'PENDING') {
      throw new AppError(400, 'Cannot add items to a confirmed order');
    }

    // Verify menu item
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: data.menuItemId },
    });

    if (!menuItem || menuItem.restaurantId !== order.restaurantId) {
      throw new AppError(400, 'Invalid menu item for this restaurant');
    }

    if (!menuItem.isAvailable) {
      throw new AppError(400, 'Menu item is not available');
    }

    // Add item to order
    const orderItem = await prisma.orderItem.create({
      data: {
        orderId: orderId,
        menuItemId: data.menuItemId,
        userId: userId,
        quantity: data.quantity,
        unitPrice: menuItem.price,
        customizations: data.customizations,
        notes: data.notes,
        isShared: data.isShared || false,
        sharedWith: data.sharedWith || [],
      },
      include: {
        menuItem: true,
      },
    });

    // Recalculate order total
    const itemTotal = Number(menuItem.price) * data.quantity;
    const newSubtotal = Number(order.subtotal) + itemTotal;
    const newTotal = newSubtotal + Number(order.taxAmount) - Number(order.discountAmount);

    await prisma.order.update({
      where: { id: orderId },
      data: {
        subtotal: newSubtotal,
        totalAmount: newTotal,
      },
    });

    return orderItem;
  }

  async updateStatus(orderId: string, userId: string, role: string, data: UpdateOrderStatusInput) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        restaurant: true,
      },
    });

    if (!order) {
      throw new AppError(404, 'Order not found');
    }

    // Only restaurant owner or admin can update status
    if (role !== 'ADMIN' && order.restaurant.ownerId !== userId) {
      throw new AppError(403, 'You do not have permission to update this order');
    }

    const updateData: any = {
      status: data.status,
    };

    if (data.status === 'CONFIRMED' && !order.confirmedAt) {
      updateData.confirmedAt = new Date();
    }

    if (data.status === 'DELIVERED' && !order.completedAt) {
      updateData.completedAt = new Date();
    }

    if (data.status === 'CANCELLED' && !order.cancelledAt) {
      updateData.cancelledAt = new Date();
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
          },
        },
        orderItems: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    return updatedOrder;
  }

  async addParticipant(orderId: string, requestingUserId: string, data: AddParticipantInput) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        participants: true,
      },
    });

    if (!order) {
      throw new AppError(404, 'Order not found');
    }

    // Verify requesting user is already a participant
    const isParticipant = order.participants.some((p) => p.userId === requestingUserId);
    if (!isParticipant) {
      throw new AppError(403, 'You are not a participant in this order');
    }

    if (order.status !== 'PENDING') {
      throw new AppError(400, 'Cannot add participants to a confirmed order');
    }

    // Check if user is already a participant
    if (data.userId) {
      const alreadyParticipant = order.participants.some((p) => p.userId === data.userId);
      if (alreadyParticipant) {
        throw new AppError(400, 'User is already a participant');
      }
    }

    const participant = await prisma.orderParticipant.create({
      data: {
        orderId: orderId,
        userId: data.userId,
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        role: 'participant',
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

    return participant;
  }
}
