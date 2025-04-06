import { PaymentMethod } from './paymentMethod.interface';

export interface PaymentRequest {
  acceptance_token: string;
  amount_cents: number;
  currency: string;
  signature: string;
  customer_email: string;
  pyment_method: PaymentMethod;
  reference: string;
}
