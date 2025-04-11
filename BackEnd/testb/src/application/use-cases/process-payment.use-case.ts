import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Result } from 'src/common/result';
import { ProductDto } from '../dtos/product.dto';
import { ProductEntity } from 'src/domain/entities/product.entity';
import { PaymentSessionEntity } from 'src/domain/entities/payment-session.entity';
import { TransactionEntity } from 'src/domain/entities/transaction.entity';
import { Status } from 'src/domain/transactions/status.enum';
import { UpdateProductUseCase } from './update-product.use-case';
import { PaymentConfig } from '../interfaces/payment-config.interface';
import * as crypto from 'crypto';

export interface ProcessPaymentResponse {
  transaction: TransactionEntity;
  paymentConfig: PaymentConfig;
}

@Injectable()
export class ProcessPaymentUseCase {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly updateProductStockUseCase: UpdateProductUseCase,
  ) {}

  async execute(productDto: ProductDto): Promise<Result<ProcessPaymentResponse, Error>> {
    try {
      return await this.entityManager.transaction(async (entityManager) => {
        // Get product with pessimistic lock
        const product = await entityManager
          .createQueryBuilder(ProductEntity, 'product')
          .setLock('pessimistic_write')
          .where('product.id = :id', { id: productDto.id })
          .getOne();

        if (!product) {
          return Result.err(new Error('Product not found'));
        }

        // Update product stock
        const updateStockResult = await this.updateProductStockUseCase.execute({
          productId: productDto.id,
          quantity: productDto.quantity,
          entityManager,
        });

        if (updateStockResult.isErr()) {
          return Result.err(updateStockResult.getError());
        }

        // Calculate amount in cents
        const amountInCents = Math.round(product.price * productDto.quantity * 100);

        // Create payment session
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

        const savedSession = await entityManager.save(paymentSession);
        const expDate = new Date(Date.now() + 30 * 60 * 1000).toISOString()
        // Create transaction
        const transaction = new TransactionEntity();
        transaction.sessionId = savedSession.id;
        transaction.amount = amountInCents;
        transaction.status = Status.PENDING;
        transaction.quantity = productDto.quantity;
        transaction.expDate = expDate;

        const savedTransaction = await entityManager.save(transaction);

        // Use transaction ID as reference
        const reference = savedTransaction.id;
        // Generate integrity signature
        const privateKey = this.configService.get('INTEGRITY_SECRET', '');
        
        const integrityConcatenation = `${reference}${amountInCents}COP${expDate}${privateKey}`;
        const signature = crypto
          .createHash('sha256')
          .update(integrityConcatenation)
          .digest('hex');

        // Generate payment token
        const paymentToken = this.jwtService.sign(
          {
            transactionId: savedTransaction.id,
            amount: amountInCents,
            productId: reference,
            expirationDate: expDate,
            sessionId: savedSession.id,
            userEmail: productDto.userEmail,
          },
          {
            secret: this.configService.get('PAYMENT_TOKEN_SECRET'),
            expiresIn: '30m',
          },
        );

        // Create payment config
        const paymentConfig: PaymentConfig = {
          publicKey: this.configService.get('PUBLIC_KEY', ''),
          currency: 'COP',
          amountInCents,
          reference,
          signature,
          paymentToken,
          redirectUrl: this.configService.get('REDIRECT_URL', ''),
        };

        return Result.ok({
          transaction: savedTransaction,
          paymentConfig,
        });
      });
    } catch (error) {
      return Result.err(error);
    }
  }
}
