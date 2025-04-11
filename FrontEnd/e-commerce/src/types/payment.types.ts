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
  expDate: string;
  sessionId: string;
  status: string;
  quantity: number;
  paymentTransactionId?: string;
  paymentMethod?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentResponse {
 transaction: TransactionResponse;
 paymentConfig: PaymentConfig; 
}