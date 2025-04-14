import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface PaymentTokenParams {
  transactionId: string;
  amount: number;
  productId: string;
  expirationDate: string;
  sessionId: string;
  userEmail: string;
}

@Injectable()
export class PaymentTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateToken(params: PaymentTokenParams): string {
    return this.jwtService.sign(
      {
        transactionId: params.transactionId,
        amount: params.amount,
        productId: params.productId,
        expirationDate: params.expirationDate,
        sessionId: params.sessionId,
        userEmail: params.userEmail,
      },
      {
        secret: this.configService.get('PAYMENT_TOKEN_SECRET'),
        expiresIn: '30m',
      },
    );
  }
}