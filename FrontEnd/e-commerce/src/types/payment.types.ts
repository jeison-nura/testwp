// Payment related interfaces
export interface CustomerData {
  email: string;
  fullName: string;
  phoneNumber: string;
  phoneNumberPrefix: string;
  legalId: string;
  legalIdType: string;
}

export interface PaymentRequest {
  id: string; // ID del producto
  quantity: number;
  userEmail: string;
  userId?: string;
}

export interface PaymentConfig {
  publicKey: string;
  currency: string;
  amountInCents: number;
  reference: string;
  signature: string;
  paymentToken: string;
  redirectUrl: string;
}

export interface TransactionResponse {
  id: string;
  amount: number;
  sessionId: string;
  status: string;
  paymentConfig: PaymentConfig;
  createdAt: string;
  updatedAt: string;
}