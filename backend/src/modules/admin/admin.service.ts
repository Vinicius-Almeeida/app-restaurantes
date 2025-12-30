import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler';
import type {
  GetDashboardMetricsInput,
  ListRestaurantsInput,
  ListUsersInput,
  CreatePlanInput,
  UpdatePlanInput,
  ListSubscriptionsInput,
  UpdateSubscriptionInput,
  CreateConsultantInput,
  UpdateConsultantInput,
} from './admin.schema';

export class AdminService {
  async getDashboardMetrics(period: string = '30d') {
    const periodDays = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 }[period] || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    const [
      restaurantStats,
      userStats,
      activeSubscriptions,
      newRestaurants,
      churned,
      gmv,
    ] = await Promise.all([
      prisma.restaurant.groupBy({ by: ['isActive'], _count: true }),
      prisma.user.groupBy({ by: ['role'], _count: true }),
      prisma.subscription.findMany({ where: { status: 'ACTIVE' }, include: { plan: true } }),
      prisma.restaurant.count({ where: { createdAt: { gte: startDate } } }),
      prisma.subscription.count({ where: { status: 'CANCELED', cancelledAt: { gte: startDate } } }),
      prisma.order.aggregate({ where: { createdAt: { gte: startDate }, status: 'DELIVERED' }, _sum: { totalAmount: true } }),
    ]);

    const mrr = activeSubscriptions.reduce((sum, sub) => sum + Number(sub.plan.price), 0);

    return {
      mrr,
      arr: mrr * 12,
      totalRestaurants: restaurantStats,
      totalUsers: userStats,
      newRestaurants,
      churnedSubscriptions: churned,
      gmv: gmv._sum.totalAmount || 0,
      period,
    };
  }

  async listRestaurants(filters: ListRestaurantsInput) {
    const { page = 1, limit = 20, status, planId, search } = filters;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};

    if (status) where.isActive = status === 'active';
    if (planId) where.subscription = { planId };
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const [restaurants, total] = await Promise.all([
      prisma.restaurant.findMany({
        where,
        include: {
          owner: { select: { id: true, fullName: true, email: true } },
          subscription: { include: { plan: true } },
          _count: { select: { orders: true, menuItems: true, staff: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.restaurant.count({ where }),
    ]);

    return { restaurants, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async getRestaurantDetails(id: string) {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, fullName: true, email: true, phone: true } },
        subscription: { include: { plan: true } },
        _count: { select: { orders: true, menuItems: true, staff: true, reviews: true, tables: true } },
      },
    });

    if (!restaurant) throw new AppError(404, 'Restaurant not found');

    const [revenue, nps] = await Promise.all([
      prisma.order.aggregate({ where: { restaurantId: id, status: 'DELIVERED' }, _sum: { totalAmount: true } }),
      this.calculateRestaurantNps(id),
    ]);

    return { ...restaurant, totalRevenue: revenue._sum.totalAmount || 0, nps };
  }

  async listUsers(filters: ListUsersInput) {
    const { page = 1, limit = 20, role, search } = filters;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};

    if (role) where.role = role;
    if (search) where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { fullName: { contains: search, mode: 'insensitive' } },
    ];

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { id: true, email: true, fullName: true, phone: true, role: true, createdAt: true, emailVerified: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async listPlans() {
    return prisma.plan.findMany({ orderBy: { displayOrder: 'asc' } });
  }

  async createPlan(data: CreatePlanInput) {
    const existing = await prisma.plan.findUnique({ where: { slug: data.slug } });
    if (existing) throw new AppError(400, 'Plan slug already exists');

    // TypeScript assertion: CreatePlanInput validation ensures required fields are present
    return prisma.plan.create({
      data: data as any,
    });
  }

  async updatePlan(id: string, data: UpdatePlanInput) {
    const plan = await prisma.plan.findUnique({ where: { id } });
    if (!plan) throw new AppError(404, 'Plan not found');
    return prisma.plan.update({ where: { id }, data });
  }

  async listSubscriptions(filters: ListSubscriptionsInput) {
    const { page = 1, limit = 20, status, planId } = filters;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};

    if (status) where.status = status;
    if (planId) where.planId = planId;

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        include: { restaurant: { select: { id: true, name: true } }, plan: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.subscription.count({ where }),
    ]);

    return { subscriptions, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async updateSubscription(id: string, data: UpdateSubscriptionInput) {
    const subscription = await prisma.subscription.findUnique({ where: { id } });
    if (!subscription) throw new AppError(404, 'Subscription not found');

    const updateData: Record<string, unknown> = { ...data };
    if (data.status === 'CANCELED') updateData.cancelledAt = new Date();

    return prisma.subscription.update({ where: { id }, data: updateData });
  }

  async listConsultants() {
    return prisma.consultant.findMany({
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        _count: { select: { onboardedRestaurants: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createConsultant(data: CreateConsultantInput) {
    const user = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) throw new AppError(404, 'User not found');

    const existing = await prisma.consultant.findUnique({ where: { userId: data.userId } });
    if (existing) throw new AppError(400, 'User is already a consultant');

    await prisma.user.update({ where: { id: data.userId }, data: { role: 'CONSULTANT' } });

    return prisma.consultant.create({
      data: { userId: data.userId, commissionPercent: data.commissionPercent },
      include: { user: { select: { id: true, fullName: true, email: true } } },
    });
  }

  async updateConsultant(id: string, data: UpdateConsultantInput) {
    const consultant = await prisma.consultant.findUnique({ where: { id } });
    if (!consultant) throw new AppError(404, 'Consultant not found');
    return prisma.consultant.update({ where: { id }, data });
  }

  async getConsultantPerformance(id: string) {
    const consultant = await prisma.consultant.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        onboardedRestaurants: { include: { restaurant: { select: { id: true, name: true, createdAt: true } } } },
      },
    });

    if (!consultant) throw new AppError(404, 'Consultant not found');
    return consultant;
  }

  async getEscalatedComplaints() {
    return prisma.complaint.findMany({
      where: { escalatedToSuper: true, status: { not: 'CLOSED' } },
      include: {
        restaurant: { select: { id: true, name: true } },
        user: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
  }

  private async calculateRestaurantNps(restaurantId: string) {
    const responses = await prisma.npsResponse.findMany({ where: { restaurantId }, select: { score: true } });
    if (responses.length === 0) return null;

    const promoters = responses.filter(r => r.score >= 9).length;
    const detractors = responses.filter(r => r.score <= 6).length;
    return Math.round(((promoters - detractors) / responses.length) * 100);
  }
}
