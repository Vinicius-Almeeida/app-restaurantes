import { z } from 'zod';

export const createReviewSchema = z.object({
  body: z.object({
    restaurantId: z.string().uuid(),
    tableSessionId: z.string().uuid().optional(),
    overallRating: z.number().int().min(1).max(5),
    foodRating: z.number().int().min(1).max(5).optional(),
    serviceRating: z.number().int().min(1).max(5).optional(),
    ambianceRating: z.number().int().min(1).max(5).optional(),
    waitTimeRating: z.number().int().min(1).max(5).optional(),
    valueRating: z.number().int().min(1).max(5).optional(),
    comment: z.string().optional(),
  }),
});

export const respondReviewSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ response: z.string().min(1) }),
});

export const createSuggestionSchema = z.object({
  body: z.object({
    restaurantId: z.string().uuid(),
    category: z.enum(['MENU', 'SERVICE', 'AMBIANCE', 'OTHER']),
    content: z.string().min(1),
    isAnonymous: z.boolean().default(false),
  }),
});

export const respondSuggestionSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ response: z.string().min(1) }),
});

export const createComplaintSchema = z.object({
  body: z.object({
    restaurantId: z.string().uuid(),
    tableSessionId: z.string().uuid().optional(),
    category: z.enum(['FOOD_QUALITY', 'SERVICE', 'WAIT_TIME', 'BILLING', 'HYGIENE', 'OTHER']),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
    subject: z.string().min(1),
    description: z.string().min(1),
  }),
});

export const updateComplaintSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED', 'CLOSED']).optional(),
    response: z.string().optional(),
  }),
});

export const createNpsSchema = z.object({
  body: z.object({
    restaurantId: z.string().uuid(),
    tableSessionId: z.string().uuid().optional(),
    score: z.number().int().min(0).max(10),
    feedback: z.string().optional(),
  }),
});

export const getRestaurantReviewsSchema = z.object({
  params: z.object({ restaurantId: z.string().uuid() }),
  query: z.object({
    page: z.string().optional().transform(v => v ? parseInt(v) : 1),
    limit: z.string().optional().transform(v => v ? parseInt(v) : 20),
    minRating: z.string().optional().transform(v => v ? parseInt(v) : undefined),
  }),
});

// Types
export type CreateReviewInput = z.infer<typeof createReviewSchema>['body'];
export type RespondReviewInput = z.infer<typeof respondReviewSchema>['body'];
export type CreateSuggestionInput = z.infer<typeof createSuggestionSchema>['body'];
export type CreateComplaintInput = z.infer<typeof createComplaintSchema>['body'];
export type UpdateComplaintInput = z.infer<typeof updateComplaintSchema>['body'];
export type CreateNpsInput = z.infer<typeof createNpsSchema>['body'];
