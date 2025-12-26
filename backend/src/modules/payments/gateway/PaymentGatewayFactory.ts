import { IPaymentGateway } from './PaymentGateway.interface';
import { StripeGateway } from './StripeGateway';
import { MercadoPagoGateway } from './MercadoPagoGateway';

export type GatewayType = 'stripe' | 'mercadopago';

/**
 * Payment Gateway Factory
 *
 * Factory pattern to create payment gateway instances
 * This allows easy switching between different payment providers
 */
export class PaymentGatewayFactory {
  private static instances: Map<GatewayType, IPaymentGateway> = new Map();

  /**
   * Get a payment gateway instance
   * Uses singleton pattern to reuse instances
   */
  static getGateway(type: GatewayType): IPaymentGateway {
    // Return existing instance if available
    if (this.instances.has(type)) {
      return this.instances.get(type)!;
    }

    // Create new instance based on type
    let gateway: IPaymentGateway;

    switch (type) {
      case 'stripe':
        gateway = new StripeGateway();
        break;

      case 'mercadopago':
        gateway = new MercadoPagoGateway();
        break;

      default:
        throw new Error(`Unknown payment gateway type: ${type}`);
    }

    // Store and return instance
    this.instances.set(type, gateway);
    return gateway;
  }

  /**
   * Get the default payment gateway
   * Configured via environment variable
   */
  static getDefaultGateway(): IPaymentGateway {
    const defaultType = (process.env.DEFAULT_PAYMENT_GATEWAY || 'stripe') as GatewayType;
    return this.getGateway(defaultType);
  }
}
