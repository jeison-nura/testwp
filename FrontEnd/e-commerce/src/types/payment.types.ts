// Payment related interfaces
export interface CustomerData {
  email: string;
  fullName: string;
  phoneNumber: string;
  phoneNumberPrefix: string;
  legalId: string;
  legalIdType: string;
}

export interface CardData {
  cardNumber: string;
  cardHolder: string;
  exp_month: string;
  exp_year: string;
  cardCvv: string;
}

// Interfaz para solicitud de token de tarjeta a la pasarela de pago
export interface PaymentCardTokenRequest {
  number: string;
  cvc: string;
  exp_month: string;
  exp_year: string;
  card_holder: string;
}

// Interfaz para respuesta de token de tarjeta de la pasarela de pago
export interface PaymentCardTokenResponse {
  status: string;
  data?: {
    id: string;
    created_at: string;
    brand: string;
    name: string;
    last_four: string;
    bin: string;
    exp_year: string;
    exp_month: string;
    card_holder: string;
  };
  error?: {
    type: string;
    reason: string;
    messages?: string[];
  };
}

export interface PaymentRequest {
  id: string; // ID del producto
  quantity: number;
  userEmail: string;
  userId?: string;
  fullName: string;
  identification: string;
  cardInfo: {
    lastFourDigits: string;
    cardType: string;
  };
  // Campos adicionales requeridos por el backend
  reference?: string; // Generado por el servicio
  amount_in_cents?: number; // Calculado por el servicio
  currency?: string;
  expiration_time?: string;
}

export interface PaymentConfig {
  amount: number;
  reference: string;
  expirationDate: string;
  paymentToken: string;
  publicToken: string;
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

export interface TransactionData {
  id: string;
  quantity: number;
  userEmail: string; 
}

export interface transactionResponse {
  status: string;
  data?: PaymentConfig;
  error?: {
    type: string;
    reason: string;
    messages?: string[];
  };
}

export interface PaymentFormData {
  installments: number;
  fullName: string;
  email: string;
  identification: string;
  cardNumber: string;
  cardExpiry: string;
  cardCVC: string;
  cardType: CardType;
  // Campos de dirección y contacto
  phoneNumber: string;
  address: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  // Campos para aceptación de términos y políticas
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

// Tipos de tarjetas soportadas
export type CardType = 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown';

// Interfaz para los tokens de aceptación
export interface AcceptanceTokens {
  endUserTermsUrl: string;
  personalDataTermsUrl: string;
  termsAndConditionsUrl: string;
}

export interface AcceptanceTokensResponse {
  endUserAcceptanceToken: string,
  endUserTermsUrl: string,
  endUserTermsType: string,
  personalDataAcceptanceToken: string,
  personalDataTermsUrl: string,
  personalDataTermsType: string,
  acceptanceToken: string,
  termsAndConditionsUrl:string
}

// Interfaz para la respuesta de creación de pago
export interface CreatePaymentResponse {
  id: string;
  created_at: string;
  amount_in_cents: number;
  status: string;
  reference: string;
  customer_email: string;
  currency: string;
  payment_method_type: string;
  redirect_url?: string;
  paymentConfig?: {
    publicToken: string;
    paymentToken: string; // JWT para autorizar actualizaciones de transacción
    reference: string;
    expirationDate: string;
  };
}

// Interfaz para la actualización de estado de transacción
export interface UpdateTransactionStatusRequest {
  status: 'APPROVED' | 'CANCELED' | 'REJECTED';
  error_message?: string;
  payment_method?: string;
  card_token?: string;
}
