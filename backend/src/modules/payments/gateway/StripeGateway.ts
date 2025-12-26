import {
  IPaymentGateway,
  PaymentMethod,
  PaymentResult,
  RefundResult,
  SplitPaymentParticipant,
  SplitPaymentResult,
} from './PaymentGateway.interface';

/**
 * Stripe Payment Gateway Implementation
 *
 * This is a MOCK implementation for development.
 * Replace with actual Stripe SDK integration for production:
 * npm install stripe
 * import Stripe from 'stripe';
 */
export class StripeGateway implements IPaymentGateway {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock';
  }

  async processPayment(
    amount: number,
    method: PaymentMethod,
    metadata?: Record<string, any>
  ): Promise<PaymentResult> {
    console.log('[Stripe] Processing payment:', { amount, method, metadata });

    // MOCK: Simulate successful payment
    // TODO: Replace with actual Stripe API call
    /*
    const stripe = new Stripe(this.apiKey);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe uses cents
      currency: 'brl',
      payment_method: method.token,
      confirm: true,
      metadata: metadata,
    });

    return {
      success: paymentIntent.status === 'succeeded',
      transactionId: paymentIntent.id,
      amount: amount,
      currency: 'BRL',
      status: paymentIntent.status === 'succeeded' ? 'COMPLETED' : 'PENDING',
      metadata: paymentIntent.metadata,
    };
    */

    // MOCK response
    return {
      success: true,
      transactionId: `stripe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      currency: 'BRL',
      status: 'COMPLETED',
      metadata,
    };
  }

  async refund(transactionId: string, amount?: number): Promise<RefundResult> {
    console.log('[Stripe] Processing refund:', { transactionId, amount });

    // MOCK: Simulate successful refund
    // TODO: Replace with actual Stripe API call
    /*
    const stripe = new Stripe(this.apiKey);
    const refund = await stripe.refunds.create({
      payment_intent: transactionId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });

    return {
      success: refund.status === 'succeeded',
      refundId: refund.id,
      amount: refund.amount / 100,
      status: refund.status === 'succeeded' ? 'COMPLETED' : 'PENDING',
    };
    */

    // MOCK response
    return {
      success: true,
      refundId: `refund_${Date.now()}`,
      amount: amount || 0,
      status: 'COMPLETED',
    };
  }

  async splitPayment(
    totalAmount: number,
    participants: SplitPaymentParticipant[],
    method: PaymentMethod
  ): Promise<SplitPaymentResult> {
    console.log('[Stripe] Processing split payment:', { totalAmount, participants, method });

    // MOCK: Simulate successful split payment
    // TODO: Implement Stripe Connect for split payments
    /*
    For real implementation, use Stripe Connect with transfer destinations:
    - Create a payment intent with transfer_data
    - Specify destination accounts for each participant
    */

    // MOCK response
    const splitTransactions = participants.map((p) => ({
      userId: p.userId,
      transactionId: `stripe_split_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: p.amount,
      status: 'COMPLETED' as const,
    }));

    return {
      success: true,
      splitTransactions,
    };
  }

  verifyWebhook(payload: any, signature: string): boolean {
    console.log('[Stripe] Verifying webhook:', { payload, signature });

    // TODO: Implement actual Stripe webhook verification
    /*
    const stripe = new Stripe(this.apiKey);
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    try {
      const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      return true;
    } catch (err) {
      return false;
    }
    */

    // MOCK: Always return true for development
    return true;
  }

  async getPaymentStatus(transactionId: string): Promise<PaymentResult> {
    console.log('[Stripe] Getting payment status:', transactionId);

    // TODO: Implement actual Stripe payment status check
    /*
    const stripe = new Stripe(this.apiKey);
    const paymentIntent = await stripe.paymentIntents.retrieve(transactionId);

    return {
      success: paymentIntent.status === 'succeeded',
      transactionId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: 'BRL',
      status: paymentIntent.status === 'succeeded' ? 'COMPLETED' : 'PENDING',
      metadata: paymentIntent.metadata,
    };
    */

    // MOCK response
    return {
      success: true,
      transactionId,
      amount: 100,
      currency: 'BRL',
      status: 'COMPLETED',
    };
  }
}
