import { z } from 'zod';

// ============================================
// SPLIT BILL SCHEMAS 🔥
// ============================================

export const createSplitBillSchema = z.object({
  params: z.object({
    orderId: z.string().uuid('Invalid order ID'),
  }),
  body: z.object({
    splitMethod: z.enum(['EQUAL', 'BY_ITEM', 'CUSTOM', 'PERCENTAGE']),
    participants: z.array(
      z.object({
        userId: z.string().uuid(),
        userEmail: z.string().email(),
        userName: z.string(),
        amountDue: z.number().positive().optional(), // For CUSTOM method
      })
    ).min(2, 'At least 2 participants required for split payment'),
  }),
});

export const getSplitPaymentSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid split payment ID'),
  }),
});

export const getSplitPaymentByTokenSchema = z.object({
  params: z.object({
    token: z.string().min(10, 'Invalid payment token'),
  }),
});

// ============================================
// PAYMENT SCHEMAS
// ============================================

export const createPaymentSchema = z.object({
  body: z.object({
    orderId: z.string().uuid('Invalid order ID'),
    method: z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'CASH']),
    amount: z.number().positive('Amount must be positive'),
    gateway: z.enum(['stripe', 'mercadopago']).optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

export const processSplitPaymentSchema = z.object({
  params: z.object({
    splitPaymentId: z.string().uuid('Invalid split payment ID'),
  }),
  body: z.object({
    method: z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'PIX']),
    gateway: z.enum(['stripe', 'mercadopago']),
    paymentToken: z.string().optional(), // Gateway payment token
    metadata: z.record(z.any()).optional(),
  }),
});

export type CreateSplitBillInput = z.infer<typeof createSplitBillSchema>['body'];
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>['body'];
export type ProcessSplitPaymentInput = z.infer<typeof processSplitPaymentSchema>['body'];
