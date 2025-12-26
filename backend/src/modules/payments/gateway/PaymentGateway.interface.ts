/**
 * Payment Gateway Interface
 *
 * Abstract interface for payment gateways (Stripe, Mercado Pago, etc.)
 * This allows us to easily switch between payment providers
 */

export interface PaymentMethod {
  type: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'CASH';
  token?: string; // Payment token from gateway
  details?: Record<string, any>;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  metadata?: Record<string, any>;
  error?: string;
}

export interface RefundResult {
  success: boolean;
  refundId: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  error?: string;
}

export interface SplitPaymentParticipant {
  userId: string;
  email: string;
  amount: number;
  description?: string;
}

export interface SplitPaymentResult {
  success: boolean;
  splitTransactions: {
    userId: string;
    transactionId: string;
    amount: number;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
  }[];
  error?: string;
}

export interface IPaymentGateway {
  /**
   * Process a single payment
   */
  processPayment(
    amount: number,
    method: PaymentMethod,
    metadata?: Record<string, any>
  ): Promise<PaymentResult>;

  /**
   * Refund a payment
   */
  refund(transactionId: string, amount?: number): Promise<RefundResult>;

  /**
   * Process split payment (multiple recipients)
   */
  splitPayment(
    totalAmount: number,
    participants: SplitPaymentParticipant[],
    method: PaymentMethod
  ): Promise<SplitPaymentResult>;

  /**
   * Verify webhook signature (for payment notifications)
   */
  verifyWebhook(payload: any, signature: string): boolean;

  /**
   * Get payment status
   */
  getPaymentStatus(transactionId: string): Promise<PaymentResult>;
}
