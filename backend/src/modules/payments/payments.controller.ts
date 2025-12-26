import { Request, Response } from 'express';
import { PaymentsService } from './payments.service';
import { asyncHandler } from '../../utils/asyncHandler';
import type { CreateSplitBillInput, CreatePaymentInput, ProcessSplitPaymentInput } from './payments.schema';

const paymentsService = new PaymentsService();

// ============================================
// SPLIT BILL ENDPOINTS 🔥
// ============================================

export const createSplitBill = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const data: CreateSplitBillInput = req.body;

  const splitPayments = await paymentsService.createSplitBill(orderId, userId, data);

  res.status(201).json({
    message: 'Bill split created successfully',
    data: splitPayments,
  });
});

export const getSplitPaymentsByOrder = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.params;

  const splitPayments = await paymentsService.getSplitPaymentsByOrder(orderId);

  res.status(200).json({
    message: 'Split payments retrieved successfully',
    data: splitPayments,
  });
});

export const getSplitPaymentByToken = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;

  const splitPayment = await paymentsService.getSplitPaymentByToken(token);

  res.status(200).json({
    message: 'Split payment retrieved successfully',
    data: splitPayment,
  });
});

export const processSplitPayment = asyncHandler(async (req: Request, res: Response) => {
  const { splitPaymentId } = req.params;
  const data: ProcessSplitPaymentInput = req.body;

  const result = await paymentsService.processSplitPayment(splitPaymentId, data);

  res.status(200).json({
    message: 'Payment processed successfully',
    data: result,
  });
});

// ============================================
// REGULAR PAYMENT ENDPOINTS
// ============================================

export const createPayment = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const data: CreatePaymentInput = req.body;

  const payment = await paymentsService.createPayment(userId, data);

  res.status(201).json({
    message: 'Payment created successfully',
    data: payment,
  });
});

export const getPaymentsByOrder = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.params;

  const payments = await paymentsService.getPaymentsByOrder(orderId);

  res.status(200).json({
    message: 'Payments retrieved successfully',
    data: payments,
  });
});
