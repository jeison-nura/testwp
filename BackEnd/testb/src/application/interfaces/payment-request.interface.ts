export interface PaymentMethodCard {
  type: string;
  token: string;
  installments: number;
}

export interface CustomerData {
  phone_number: string;
  full_name: string;
  legal_id: string;
  legal_id_type: string;
}

export interface ShippingAddress {
  address_line_1: string;
  address_line_2?: string;
  country: string;
  region: string;
  city: string;
  name: string;
  phone_number: string;
  postal_code: string;
}

export interface CreatePaymentRequest {
  acceptance_token: string;
  amount_in_cents: number;
  currency: string;
  signature: string;
  customer_email: string;
  payment_method: PaymentMethodCard;
  payment_source_id?: number;
  reference: string;
  expiration_time?: string;
  customer_data?: CustomerData;
  shipping_address?: ShippingAddress;
}

export interface CreatePaymentResponse {
  id: string;
  created_at: string;
  amount_in_cents: number;
  reference: string;
  currency: string;
  payment_method_type: string;
  payment_method: {
    type: string;
    installments: number;
  };
  redirect_url?: string;
  status: string;
  status_message?: string;
}