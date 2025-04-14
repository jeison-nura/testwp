import { Injectable } from '@nestjs/common';
import { PaymentSessionEntity } from '../entities/payment-session.entity';
import { ProductDto } from '../../application/dtos/product.dto';
import { Result } from 'src/common/result';
import * as crypto from 'crypto';

@Injectable()
export class PaymentSessionService {
  createPaymentSession(productDto: ProductDto): Result<PaymentSessionEntity, Error> {
    try {
      if (!productDto.id) {
        return Result.err(new Error('Product ID is required'));
      }
      
      if (!productDto.userEmail) {
        return Result.err(new Error('User email is required'));
      }
      
      const sessionToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30 minutes expiration

      const paymentSession = new PaymentSessionEntity();
      paymentSession.productId = productDto.id;
      paymentSession.userId = productDto.userId ?? '';
      paymentSession.userEmail = productDto.userEmail;
      paymentSession.sessionToken = sessionToken;
      paymentSession.expiresAt = expiresAt;
      paymentSession.isUsed = false;

      return Result.ok(paymentSession);
    } catch (error) {
      return Result.err(
        error instanceof Error 
          ? error 
          : new Error(`Failed to create payment session: ${error}`)
      );
    }
  }
}