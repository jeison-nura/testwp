export interface PaymentMethodResponse {
  type: string;
  phone_number?: number;
  installments?: number;
}

export interface ShippingAddressResponse {
  address_line_1: string;
  country: string;
  region: string;
  city: string;
  phone_number: number;
}

export interface TransactionData {
  id: string;
  created_at: string;
  amount_in_cents: number;
  status: string;
  reference: string;
  customer_email: string;
  currency: string;
  payment_method_type: string;
  payment_method: PaymentMethodResponse;
  shipping_address?: ShippingAddressResponse;
  redirect_url?: string;
  payment_link_id?: string | null;
}

export interface TransactionResponse {
  data: TransactionData;
}