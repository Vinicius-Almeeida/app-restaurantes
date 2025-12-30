import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler';
import type { CreateReviewInput, CreateSuggestionInput, CreateComplaintInput, UpdateComplaintInput, CreateNpsInput } from './reviews.schema';

export class ReviewsService {
  async createReview(userId: string, data: CreateReviewInput) {
    // Check if already reviewed this session
    if (data.tableSessionId) {
      const existing = await prisma.review.findFirst({
        where: { userId, restaurantId: data.restaurantId, tableSessionId: data.tableSessionId },
      });
      if (existing) throw new AppError(400, 'You already reviewed this visit');
    }

    return prisma.review.create({
      data: {
        user: { connect: { id: userId } },
        restaurant: { connect: { id: data.restaurantId } },
        tableSession: data.tableSessionId ? { connect: { id: data.tableSessionId } } : undefined,
        overallRating: data.overallRating,
        foodRating: data.foodRating,
        serviceRating: data.serviceRating,
        ambianceRating: data.ambianceRating,
        waitTimeRating: data.waitTimeRating,
        valueRating: data.valueRating,
        comment: data.comment,
      },
      include: { user: { select: { id: true, fullName: true } } },
    });
  }

  async respondToReview(reviewId: string, userId: string, response: string) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { restaurant: true },
    });

    if (!review) throw new AppError(404, 'Review not found');
    if (review.restaurant.ownerId !== userId) throw new AppError(403, 'Only restaurant owner can respond');

    return prisma.review.update({
      where: { id: reviewId },
      data: { response, respondedAt: new Date() },
    });
  }

  async getRestaurantReviews(restaurantId: string, page: number, limit: number, minRating?: number) {
    const where: any = { restaurantId, isPublic: true };
    if (minRating) where.overallRating = { gte: minRating };

    const [reviews, total, stats] = await Promise.all([
      prisma.review.findMany({
        where,
        include: { user: { select: { id: true, fullName: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where }),
      prisma.review.aggregate({
        where: { restaurantId },
        _avg: { overallRating: true, foodRating: true, serviceRating: true, ambianceRating: true },
        _count: true,
      }),
    ]);

    return { reviews, total, page, pages: Math.ceil(total / limit), averages: stats._avg, totalReviews: stats._count };
  }

  async createSuggestion(userId: string | null, data: CreateSuggestionInput) {
    return prisma.suggestion.create({
      data: {
        restaurant: { connect: { id: data.restaurantId } },
        user: data.isAnonymous || !userId ? undefined : { connect: { id: userId } },
        category: data.category,
        content: data.content,
        isAnonymous: data.isAnonymous,
      },
    });
  }

  async getSuggestions(restaurantId: string, userId: string) {
    const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
    if (!restaurant || restaurant.ownerId !== userId) throw new AppError(403, 'Access denied');

    return prisma.suggestion.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async respondToSuggestion(suggestionId: string, userId: string, response: string) {
    const suggestion = await prisma.suggestion.findUnique({
      where: { id: suggestionId },
      include: { restaurant: true },
    });

    if (!suggestion) throw new AppError(404, 'Suggestion not found');
    if (suggestion.restaurant.ownerId !== userId) throw new AppError(403, 'Access denied');

    return prisma.suggestion.update({
      where: { id: suggestionId },
      data: { response, status: 'RESPONDED', respondedAt: new Date() },
    });
  }

  async createComplaint(userId: string, data: CreateComplaintInput) {
    const complaint = await prisma.complaint.create({
      data: {
        user: { connect: { id: userId } },
        restaurant: { connect: { id: data.restaurantId } },
        tableSession: data.tableSessionId ? { connect: { id: data.tableSessionId } } : undefined,
        category: data.category,
        priority: data.priority,
        subject: data.subject,
        description: data.description,
        escalatedToSuper: data.priority === 'CRITICAL',
      },
    });

    return complaint;
  }

  async getComplaints(restaurantId: string, userId: string) {
    const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
    if (!restaurant || restaurant.ownerId !== userId) throw new AppError(403, 'Access denied');

    return prisma.complaint.findMany({
      where: { restaurantId },
      include: { user: { select: { id: true, fullName: true, email: true } } },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async updateComplaint(complaintId: string, userId: string, data: UpdateComplaintInput) {
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      include: { restaurant: true },
    });

    if (!complaint) throw new AppError(404, 'Complaint not found');
    if (complaint.restaurant.ownerId !== userId) throw new AppError(403, 'Access denied');

    const updateData: any = { ...data };
    if (data.status === 'RESOLVED') updateData.resolvedAt = new Date();
    if (data.response) updateData.respondedAt = new Date();

    return prisma.complaint.update({ where: { id: complaintId }, data: updateData });
  }

  async escalateComplaint(complaintId: string) {
    return prisma.complaint.update({
      where: { id: complaintId },
      data: { escalatedToSuper: true, status: 'ESCALATED' },
    });
  }

  async createNpsResponse(userId: string, data: CreateNpsInput) {
    return prisma.npsResponse.create({
      data: {
        user: { connect: { id: userId } },
        restaurant: { connect: { id: data.restaurantId } },
        tableSession: data.tableSessionId ? { connect: { id: data.tableSessionId } } : undefined,
        score: data.score,
        feedback: data.feedback,
      },
    });
  }

  async getRestaurantNps(restaurantId: string) {
    const responses = await prisma.npsResponse.findMany({
      where: { restaurantId },
      select: { score: true },
    });

    if (responses.length === 0) return { score: null, total: 0, breakdown: { promoters: 0, passives: 0, detractors: 0 } };

    const promoters = responses.filter((r: { score: number }) => r.score >= 9).length;
    const passives = responses.filter((r: { score: number }) => r.score >= 7 && r.score <= 8).length;
    const detractors = responses.filter((r: { score: number }) => r.score <= 6).length;
    const nps = Math.round(((promoters - detractors) / responses.length) * 100);

    return { score: nps, total: responses.length, breakdown: { promoters, passives, detractors } };
  }
}
