import { Router } from 'express';
import * as paymentsController from './payments.controller';
import { validate } from '../../middlewares/validate';
import { authenticate } from '../../middlewares/auth';
import {
  createSplitBillSchema,
  getSplitPaymentByTokenSchema,
  processSplitPaymentSchema,
  createPaymentSchema,
} from './payments.schema';

const router = Router();

// ============================================
// SPLIT BILL ROUTES 🔥
// ============================================

// Create split bill for an order (authenticated)
router.post(
  '/split/:orderId',
  authenticate,
  validate(createSplitBillSchema),
  paymentsController.createSplitBill
);

// Get split payments for an order (authenticated)
router.get(
  '/split/order/:orderId',
  authenticate,
  paymentsController.getSplitPaymentsByOrder
);

// Get split payment by token (public - for payment link)
router.get(
  '/split/token/:token',
  validate(getSplitPaymentByTokenSchema),
  paymentsController.getSplitPaymentByToken
);

// Process split payment (public - for payment link)
router.post(
  '/split/:splitPaymentId/process',
  validate(processSplitPaymentSchema),
  paymentsController.processSplitPayment
);

// ============================================
// REGULAR PAYMENT ROUTES
// ============================================

// Create payment (authenticated)
router.post(
  '/',
  authenticate,
  validate(createPaymentSchema),
  paymentsController.createPayment
);

// Get payments for an order (authenticated)
router.get(
  '/order/:orderId',
  authenticate,
  paymentsController.getPaymentsByOrder
);

export default router;
