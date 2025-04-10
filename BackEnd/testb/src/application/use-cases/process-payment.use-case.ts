import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Result } from 'src/common/result';
import { TransactionEntity } from 'src/domain/entities/transaction.entity';
import { ProductEntity } from 'src/domain/entities/product.entity';
import { PaymentSessionEntity } from 'src/domain/entities/payment-session.entity';
import { Status } from 'src/domain/transactions/status.enum';
import * as crypto from 'crypto';
import { ProductDto } from '../dtos/product.dto';
import { UpdateProductUseCase } from './update-product.use-case';

@Injectable()
export class ProcessPaymentUseCase {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly updateProductStockUseCase: UpdateProductUseCase,
  ) {}

  async execute(dto: ProductDto): Promise<Result<TransactionEntity, Error>> {
    try {
      return await this.entityManager.transaction(
        async (transactionalEntityManager) => {
          // Fetch product with pessimistic lock to prevent race conditions
          const product = await transactionalEntityManager
            .createQueryBuilder(ProductEntity, 'product')
            .setLock('pessimistic_write')
            .where('product.id = :id', { id: dto.id })
            .getOne();

          if (!product) {
            return Result.err(new Error('Product not found'));
          }

          // Update product stock using the dedicated use case
          const stockUpdateResult =
            await this.updateProductStockUseCase.execute({
              productId: dto.id,
              quantity: dto.quantity,
              entityManager: transactionalEntityManager,
            });

          if (stockUpdateResult.isErr()) {
            return Result.err(stockUpdateResult.getError());
          }

          // Create payment session
          const paymentSession = new PaymentSessionEntity();
          paymentSession.productId = dto.id;
          if (dto.userId) paymentSession.userId = dto.userId;
          paymentSession.userEmail = dto.userEmail;
          paymentSession.sessionToken = crypto.randomBytes(16).toString('hex');

          // Set session expiration (30 minutes)
          const expiresAt = new Date();
          expiresAt.setMinutes(expiresAt.getMinutes() + 30);
          paymentSession.expiresAt = expiresAt;

          const savedSession =
            await transactionalEntityManager.save(paymentSession);

          // Calculate amount in cents for payment processor
          const amount = product.price * dto.quantity;
          const amountInCents = Math.round(amount * 100);

          // Create transaction record
          const transaction = new TransactionEntity();
          transaction.sessionId = savedSession.id;
          transaction.amount = amountInCents;
          transaction.quantity = dto.quantity; // Add the quantity
          transaction.status = Status.PENDING;

          const savedTransaction =
            await transactionalEntityManager.save(transaction);

          // Generate signature for payment gateway
          const reference = savedTransaction.id;
          const integritySecret = this.configService.get<string>(
            'INTEGRITY_SECRET',
            '',
          );
          
          // Use the expiration time from the session for consistency
          const expirationDate = Math.floor(expiresAt.getTime() / 1000);
          const concatenatedText = `${reference}${amountInCents}COP${expirationDate}${integritySecret}`;
          
          // Use node crypto since we're in a Node.js environment
          const signature = crypto
            .createHash('sha256')
            .update(concatenatedText)
            .digest('hex');

          // Generate JWT token for payment session
          const payload = {
            sessionId: savedSession.id,
            productId: dto.id,
            userId: dto.userId,
            userEmail: dto.userEmail,
            expirationDate: expirationDate,
          };

          const paymentToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('PAYMENT_TOKEN_SECRET', ''),
          });

          // Prepare payment gateway configuration
          const transactionConfig = {
            publicKey: this.configService.get<string>('PUBLIC_KEY', ''),
            currency: 'COP',
            amountInCents: amountInCents,
            reference: savedTransaction.id,
            signature: signature,
            paymentToken: paymentToken
          };

          // Return transaction with payment configuration
          const result = {
            ...savedTransaction,
            paymentConfig: transactionConfig,
          };

          return Result.ok(result);
        },
      );
    } catch (error) {
      return Result.err(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }
}
