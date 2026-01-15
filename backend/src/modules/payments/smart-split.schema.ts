/**
 * SmartSplit Validation Schemas
 * Zod schemas for SmartSplit endpoints
 */

import { z } from 'zod';

export const getRecommendationSchema = z.object({
  params: z.object({
    orderId: z.string().uuid('Invalid order ID'),
  }),
  body: z.object({
    participantUserIds: z.array(z.string().uuid()).min(1, 'At least one participant required'),
  }),
});

export const updatePreferencesSchema = z.object({
  body: z.object({
    preferredSplitMethod: z.enum(['EQUAL', 'BY_ITEM', 'CUSTOM', 'PERCENTAGE']).optional(),
    autoSuggestEnabled: z.boolean().optional(),
    learnFromHistory: z.boolean().optional(),
    preferredPaymentMethod: z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'CASH']).optional(),
  }),
});

export const submitFeedbackSchema = z.object({
  params: z.object({
    decisionId: z.string().uuid('Invalid decision ID'),
  }),
  body: z.object({
    rating: z.number().int().min(1).max(5),
  }),
});

export type GetRecommendationInput = z.infer<typeof getRecommendationSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
export type SubmitFeedbackInput = z.infer<typeof submitFeedbackSchema>;
