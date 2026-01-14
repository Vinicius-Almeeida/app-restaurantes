import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler';
import bcrypt from 'bcryptjs';

interface OnboardRestaurantInput {
  name: string;
  slug: string;
  description?: string;
  phone?: string;
  email?: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
}

export class ConsultantService {
  async getConsultantByUserId(userId: string) {
    const consultant = await prisma.consultant.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!consultant) {
      throw new AppError(404, 'Consultant profile not found');
    }

    return consultant;
  }

  async getDashboard(userId: string) {
    const consultant = await this.getConsultantByUserId(userId);

    const [restaurants, recentOnboardings] = await Promise.all([
      prisma.consultantRestaurant.findMany({
        where: { consultantId: consultant.id },
        include: {
          restaurant: {
            select: {
              id: true,
              name: true,
              slug: true,
              isActive: true,
              createdAt: true,
              _count: { select: { orders: true, staff: true } },
            },
          },
        },
        orderBy: { onboardedAt: 'desc' },
      }),
      prisma.consultantRestaurant.findMany({
        where: { consultantId: consultant.id },
        include: {
          restaurant: { select: { id: true, name: true } },
        },
        orderBy: { onboardedAt: 'desc' },
        take: 5,
      }),
    ]);

    // Calculate total revenue from consultant's restaurants
    const restaurantIds = restaurants.map(r => r.restaurantId);
    const totalRevenue = await prisma.order.aggregate({
      where: {
        restaurantId: { in: restaurantIds },
        status: 'DELIVERED',
      },
      _sum: { totalAmount: true },
    });

    return {
      consultant: {
        id: consultant.id,
        name: consultant.user.fullName,
        email: consultant.user.email,
        commissionPercent: consultant.commissionPercent,
        totalOnboardings: consultant.totalOnboardings,
        totalEarnings: consultant.totalEarnings,
      },
      stats: {
        totalRestaurants: restaurants.length,
        activeRestaurants: restaurants.filter(r => r.restaurant.isActive).length,
        totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
        estimatedCommission: Number(totalRevenue._sum.totalAmount || 0) * (Number(consultant.commissionPercent) / 100),
      },
      restaurants: restaurants.map(r => ({
        id: r.restaurant.id,
        name: r.restaurant.name,
        slug: r.restaurant.slug,
        isActive: r.restaurant.isActive,
        onboardedAt: r.onboardedAt,
        ordersCount: r.restaurant._count.orders,
        staffCount: r.restaurant._count.staff,
      })),
      recentOnboardings,
    };
  }

  async getMyRestaurants(userId: string) {
    const consultant = await this.getConsultantByUserId(userId);

    const restaurants = await prisma.consultantRestaurant.findMany({
      where: { consultantId: consultant.id },
      include: {
        restaurant: {
          include: {
            owner: { select: { id: true, fullName: true, email: true, phone: true } },
            subscription: { include: { plan: true } },
            _count: { select: { orders: true, menuItems: true, staff: true, tables: true } },
          },
        },
      },
      orderBy: { onboardedAt: 'desc' },
    });

    return restaurants.map(r => ({
      ...r.restaurant,
      onboardedAt: r.onboardedAt,
    }));
  }

  async getRestaurantDetails(userId: string, restaurantId: string) {
    const consultant = await this.getConsultantByUserId(userId);

    // Verify consultant has access to this restaurant
    const consultantRestaurant = await prisma.consultantRestaurant.findFirst({
      where: {
        consultantId: consultant.id,
        restaurantId,
      },
    });

    if (!consultantRestaurant) {
      throw new AppError(403, 'You do not have access to this restaurant');
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: {
        owner: { select: { id: true, fullName: true, email: true, phone: true } },
        subscription: { include: { plan: true } },
        _count: { select: { orders: true, menuItems: true, staff: true, tables: true, reviews: true } },
      },
    });

    if (!restaurant) {
      throw new AppError(404, 'Restaurant not found');
    }

    // Get revenue stats
    const [totalRevenue, monthlyRevenue, avgRating] = await Promise.all([
      prisma.order.aggregate({
        where: { restaurantId, status: 'DELIVERED' },
        _sum: { totalAmount: true },
      }),
      prisma.order.aggregate({
        where: {
          restaurantId,
          status: 'DELIVERED',
          createdAt: { gte: new Date(new Date().setDate(1)) },
        },
        _sum: { totalAmount: true },
      }),
      prisma.review.aggregate({
        where: { restaurantId },
        _avg: { overallRating: true },
      }),
    ]);

    return {
      ...restaurant,
      onboardedAt: consultantRestaurant.onboardedAt,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      monthlyRevenue: monthlyRevenue._sum.totalAmount || 0,
      avgRating: avgRating._avg.overallRating || 0,
    };
  }

  async getMyPerformance(userId: string) {
    const consultant = await this.getConsultantByUserId(userId);

    // Get monthly onboardings for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const onboardings = await prisma.consultantRestaurant.findMany({
      where: {
        consultantId: consultant.id,
        onboardedAt: { gte: sixMonthsAgo },
      },
      select: { onboardedAt: true },
    });

    // Group by month
    const monthlyOnboardings: Record<string, number> = {};
    onboardings.forEach(o => {
      const month = o.onboardedAt.toISOString().slice(0, 7);
      monthlyOnboardings[month] = (monthlyOnboardings[month] || 0) + 1;
    });

    // Get restaurant performance
    const restaurants = await prisma.consultantRestaurant.findMany({
      where: { consultantId: consultant.id },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
      },
    });

    const restaurantIds = restaurants.map(r => r.restaurantId);

    const revenueByRestaurant = await prisma.order.groupBy({
      by: ['restaurantId'],
      where: {
        restaurantId: { in: restaurantIds },
        status: 'DELIVERED',
      },
      _sum: { totalAmount: true },
      _count: true,
    });

    const restaurantPerformance = restaurants.map(r => {
      const revenue = revenueByRestaurant.find(rev => rev.restaurantId === r.restaurantId);
      return {
        id: r.restaurant.id,
        name: r.restaurant.name,
        isActive: r.restaurant.isActive,
        totalRevenue: revenue?._sum.totalAmount || 0,
        ordersCount: revenue?._count || 0,
      };
    });

    return {
      consultant: {
        id: consultant.id,
        name: consultant.user.fullName,
        commissionPercent: consultant.commissionPercent,
        totalOnboardings: consultant.totalOnboardings,
        totalEarnings: consultant.totalEarnings,
      },
      monthlyOnboardings,
      restaurantPerformance,
    };
  }

  async onboardRestaurant(userId: string, data: OnboardRestaurantInput) {
    const consultant = await this.getConsultantByUserId(userId);

    // Check if slug already exists
    const existingSlug = await prisma.restaurant.findUnique({
      where: { slug: data.slug },
    });

    if (existingSlug) {
      throw new AppError(400, 'Este slug ja esta em uso');
    }

    // Check if owner email already exists
    const existingOwner = await prisma.user.findUnique({
      where: { email: data.ownerEmail },
    });

    // Generate temporary password for owner
    const tempPassword = `Temp${Math.random().toString(36).slice(-8)}!`;
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Use transaction to create owner, restaurant, and link to consultant
    const result = await prisma.$transaction(async (tx) => {
      // Create owner user if doesn't exist
      let owner = existingOwner;
      if (!owner) {
        owner = await tx.user.create({
          data: {
            email: data.ownerEmail,
            passwordHash: hashedPassword,
            fullName: data.ownerName,
            phone: data.ownerPhone,
            role: 'RESTAURANT_OWNER',
          },
        });
      }

      // Create restaurant
      const restaurant = await tx.restaurant.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          phone: data.phone,
          email: data.email,
          ownerId: owner.id,
          isActive: true,
          acceptsOrders: true,
        },
      });

      // Link restaurant to consultant
      await tx.consultantRestaurant.create({
        data: {
          consultantId: consultant.id,
          restaurantId: restaurant.id,
        },
      });

      // Update consultant stats
      await tx.consultant.update({
        where: { id: consultant.id },
        data: {
          totalOnboardings: { increment: 1 },
        },
      });

      return {
        restaurant,
        owner,
        tempPassword: existingOwner ? null : tempPassword,
      };
    });

    return {
      restaurant: {
        id: result.restaurant.id,
        name: result.restaurant.name,
        slug: result.restaurant.slug,
      },
      owner: {
        id: result.owner.id,
        fullName: result.owner.fullName,
        email: result.owner.email,
        isNew: !existingOwner,
        tempPassword: result.tempPassword,
      },
    };
  }
}
