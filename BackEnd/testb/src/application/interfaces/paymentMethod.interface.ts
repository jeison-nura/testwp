export interface PaymentMethod {
  type: string;
  installments: number;
  token: string;
}
