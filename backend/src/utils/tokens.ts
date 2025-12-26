import crypto from 'crypto';

/**
 * Generate a random token for payment links
 */
export const generatePaymentToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Generate a payment link
 */
export const generatePaymentLink = (token: string, baseUrl?: string): string => {
  const base = baseUrl || process.env.FRONTEND_URL || 'http://localhost:3000';
  return `${base}/pay/${token}`;
};
