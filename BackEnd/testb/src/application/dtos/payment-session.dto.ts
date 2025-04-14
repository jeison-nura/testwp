import { IsString, IsNumber, IsOptional, IsEmail } from 'class-validator';

export class PaymentSessionDto {
  @IsString()
  sessionId: string;

  @IsString()
  productId: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsEmail()
  userEmail: string;

  @IsString()
  expirationDate: string;

  @IsString()
  transactionId: string;

  @IsNumber()
  amount: number;
}