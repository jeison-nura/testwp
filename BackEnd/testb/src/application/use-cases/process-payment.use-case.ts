import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Result } from 'src/common/result';
import { ProductDto } from '../dtos/product.dto';
import { ProductEntity } from 'src/domain/entities/product.entity';
import { TransactionEntity } from 'src/domain/entities/transaction.entity';
import { Status } from 'src/domain/transactions/status.enum';
import { UpdateProductUseCase } from './update-product.use-case';
import { PaymentConfig } from '../interfaces/payment-config.interface';
import { PaymentSessionService } from 'src/domain/services/payment-session.service';
import { PaymentTokenService } from 'src/domain/services/payment-token.service';
import { ProcessPaymentResponse } from '../interfaces/process-payment-response.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProcessPaymentUseCase {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly updateProductStockUseCase: UpdateProductUseCase,
    private readonly paymentTokenService: PaymentTokenService,
    private readonly paymentSessionService: PaymentSessionService,
    private readonly configService: ConfigService,
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

        // Create payment session using the service
        const sessionResult = this.paymentSessionService.createPaymentSession(productDto);
        
        if (sessionResult.isErr()) {
          return Result.err(sessionResult.getError());
        }
        
        const paymentSession = sessionResult.getValue();
        const savedSession = await entityManager.save(paymentSession);
        const expDate = new Date(Date.now() + 30 * 60 * 1000).toISOString();
        
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

        // Generate payment token
        const paymentToken = this.paymentTokenService.generateToken({
          transactionId: savedTransaction.id,
          amount: amountInCents,
          productId: productDto.id,
          expirationDate: expDate,
          sessionId: savedSession.id,
          userEmail: productDto.userEmail,
        });

        // Create simplified payment config with only what the frontend needs
        const paymentConfig: PaymentConfig = {
          amount: amountInCents,
          reference,
          expirationDate: expDate,
          paymentToken,
          publicToken: this.configService.get('PUBLIC_KEY', '')
        };

        // At the end of the execute method, update the return statement:
        return Result.ok({
          paymentConfig,
        });
      });
    } catch (error) {
      return Result.err(
        error instanceof Error 
          ? error 
          : new Error(`Failed to process payment: ${error}`)
      );
    }
  }
}
