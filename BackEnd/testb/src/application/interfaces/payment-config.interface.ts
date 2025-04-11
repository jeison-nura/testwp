export interface PaymentConfig {
  publicKey: string;
  currency: string;
  amountInCents: number;
  reference: string;
  signature: string;
  paymentToken: string;
  redirectUrl: string;
}