import { Request, Response } from 'express';
import { ReviewsService } from './reviews.service';
import type { CreateReviewInput, CreateSuggestionInput, CreateComplaintInput, UpdateComplaintInput, CreateNpsInput } from './reviews.schema';

export class ReviewsController {
  private service: ReviewsService;

  constructor() {
    this.service = new ReviewsService();
  }

  async createReview(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const data: CreateReviewInput = req.body;

    const review = await this.service.createReview(userId, data);

    res.status(201).json({
      success: true,
      data: review,
    });
  }

  async getRestaurantReviews(req: Request, res: Response): Promise<void> {
    const { restaurantId } = req.params;
    const { page, limit, minRating } = req.query as any;

    const result = await this.service.getRestaurantReviews(
      restaurantId,
      page || 1,
      limit || 20,
      minRating
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  }

  async respondToReview(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { response } = req.body;

    const review = await this.service.respondToReview(id, userId, response);

    res.status(200).json({
      success: true,
      data: review,
    });
  }

  async createSuggestion(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId || null;
    const data: CreateSuggestionInput = req.body;

    const suggestion = await this.service.createSuggestion(userId, data);

    res.status(201).json({
      success: true,
      data: suggestion,
    });
  }

  async getSuggestions(req: Request, res: Response): Promise<void> {
    const { restaurantId } = req.params;
    const userId = req.user!.userId;

    const suggestions = await this.service.getSuggestions(restaurantId, userId);

    res.status(200).json({
      success: true,
      data: suggestions,
    });
  }

  async respondToSuggestion(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { response } = req.body;

    const suggestion = await this.service.respondToSuggestion(id, userId, response);

    res.status(200).json({
      success: true,
      data: suggestion,
    });
  }

  async createComplaint(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const data: CreateComplaintInput = req.body;

    const complaint = await this.service.createComplaint(userId, data);

    res.status(201).json({
      success: true,
      data: complaint,
    });
  }

  async getComplaints(req: Request, res: Response): Promise<void> {
    const { restaurantId } = req.params;
    const userId = req.user!.userId;

    const complaints = await this.service.getComplaints(restaurantId, userId);

    res.status(200).json({
      success: true,
      data: complaints,
    });
  }

  async updateComplaint(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user!.userId;
    const data: UpdateComplaintInput = req.body;

    const complaint = await this.service.updateComplaint(id, userId, data);

    res.status(200).json({
      success: true,
      data: complaint,
    });
  }

  async escalateComplaint(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const complaint = await this.service.escalateComplaint(id);

    res.status(200).json({
      success: true,
      data: complaint,
    });
  }

  async createNpsResponse(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const data: CreateNpsInput = req.body;

    const npsResponse = await this.service.createNpsResponse(userId, data);

    res.status(201).json({
      success: true,
      data: npsResponse,
    });
  }

  async getRestaurantNps(req: Request, res: Response): Promise<void> {
    const { restaurantId } = req.params;

    const nps = await this.service.getRestaurantNps(restaurantId);

    res.status(200).json({
      success: true,
      data: nps,
    });
  }
}
