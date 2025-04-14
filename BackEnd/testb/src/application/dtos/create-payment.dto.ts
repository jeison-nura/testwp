import { IsString, IsNumber, IsEmail, IsOptional, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

class PaymentMethod {
  @IsString()
  type: string;

  @IsString()
  token: string;

  @IsNumber()
  installments: number;
}

class CustomerData {
  @IsString()
  phone_number: string;

  @IsString()
  full_name: string;

  @IsString()
  legal_id: string;

  @IsString()
  legal_id_type: string;
}

class ShippingAddress {
  @IsString()
  address_line_1: string;

  @IsOptional()
  @IsString()
  address_line_2?: string;

  @IsString()
  country: string;

  @IsString()
  region: string;

  @IsString()
  city: string;

  @IsString()
  name: string;

  @IsString()
  phone_number: string;

  @IsString()
  postal_code: string;
}

export class CreatePaymentDto {
  @IsString()
  acceptance_token: string;

  @IsNumber()
  amount_in_cents: number;

  @IsString()
  currency: string;

  @IsString()
  @IsOptional()
  signature?: string;

  @IsEmail()
  customer_email: string;

  @IsObject()
  @ValidateNested()
  @Type(() => PaymentMethod)
  payment_method: PaymentMethod;

  @IsString()
  reference: string;

  @IsNumber()
  @IsOptional()
  payment_source_id?: number;

  @IsObject()
  @ValidateNested()
  @Type(() => CustomerData)
  customer_data: CustomerData;

  @IsObject()
  @ValidateNested()
  @Type(() => ShippingAddress)
  shipping_address: ShippingAddress;

  @IsString()
  @IsOptional()
  expiration_time: string;
}