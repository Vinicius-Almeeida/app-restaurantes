/**
 * SmartSplit Controller
 * Handles SmartSplit API endpoints
 */

import { Request, Response } from 'express';
import { SmartSplitService } from './smart-split.service';
import type {
  GetRecommendationInput,
  UpdatePreferencesInput,
  SubmitFeedbackInput,
} from './smart-split.schema';

const smartSplitService = new SmartSplitService();

export class SmartSplitController {
  /**
   * GET /api/payments/split/:orderId/recommend
   * Get split recommendation for an order
   */
  async getRecommendation(
    req: Request<GetRecommendationInput['params'], unknown, GetRecommendationInput['body']>,
    res: Response
  ) {
    const { orderId } = req.params;
    const { participantUserIds } = req.body;
    const userId = req.user!.userId;

    const recommendation = await smartSplitService.getRecommendation(
      orderId,
      userId,
      participantUserIds
    );

    res.json({
      success: true,
      data: recommendation,
    });
  }

  /**
   * GET /api/customers/split-preferences
   * Get user's split preferences
   */
  async getPreferences(req: Request, res: Response) {
    const userId = req.user!.userId;

    const preferences = await smartSplitService.getPreferences(userId);

    res.json({
      success: true,
      data: preferences,
    });
  }

  /**
   * PATCH /api/customers/split-preferences
   * Update user's split preferences
   */
  async updatePreferences(
    req: Request<unknown, unknown, UpdatePreferencesInput['body']>,
    res: Response
  ) {
    const userId = req.user!.userId;

    const preferences = await smartSplitService.updatePreferences(userId, req.body);

    res.json({
      success: true,
      data: preferences,
    });
  }

  /**
   * GET /api/customers/split-insights
   * Get user's split analytics/insights
   */
  async getInsights(req: Request, res: Response) {
    const userId = req.user!.userId;

    const insights = await smartSplitService.getInsights(userId);

    res.json({
      success: true,
      data: insights,
    });
  }

  /**
   * POST /api/payments/split/:decisionId/feedback
   * Submit feedback for a split decision
   */
  async submitFeedback(
    req: Request<SubmitFeedbackInput['params'], unknown, SubmitFeedbackInput['body']>,
    res: Response
  ) {
    const userId = req.user!.userId;
    const { decisionId } = req.params;
    const { rating } = req.body;

    await smartSplitService.submitFeedback(userId, decisionId, rating);

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
    });
  }
}
