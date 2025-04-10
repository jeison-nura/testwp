import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { TransactionEntity } from 'src/domain/entities/transaction.entity';
import { PaymentSessionEntity } from 'src/domain/entities/payment-session.entity';
import { ProductEntity } from 'src/domain/entities/product.entity';
import { Status } from 'src/domain/transactions/status.enum';

@Injectable()
export class CheckExpiredTransactionsUseCase {
  private readonly logger = new Logger(CheckExpiredTransactionsUseCase.name);

  constructor(private readonly entityManager: EntityManager) {}

  async execute(): Promise<void> {
    try {
      await this.entityManager.transaction(async (transactionalEntityManager) => {
        // Find all pending transactions with expired payment sessions
        const now = new Date();
        
        const expiredSessions = await transactionalEntityManager
          .createQueryBuilder(PaymentSessionEntity, 'session')
          .innerJoinAndSelect(
            TransactionEntity,
            'transaction',
            'transaction.sessionId = session.id AND transaction.status = :status',
            { status: Status.PENDING }
          )
          .where('session.expiresAt < :now', { now })
          .getMany();

        this.logger.log(`Found ${expiredSessions.length} expired payment sessions with pending transactions`);

        // Process each expired session
        for (const session of expiredSessions) {
          // Find the associated transaction
          const transaction = await transactionalEntityManager
            .createQueryBuilder(TransactionEntity, 'transaction')
            .setLock('pessimistic_write')
            .where('transaction.sessionId = :sessionId AND transaction.status = :status', {
              sessionId: session.id,
              status: Status.PENDING,
            })
            .getOne();

          if (!transaction) {
            continue; // Skip if transaction not found or not in PENDING state
          }

          // Update transaction status to CANCELED
          transaction.status = Status.CANCELED;
          transaction.updatedAt = new Date();
          transaction.errorMessage = 'Payment session expired';

          // Mark the payment session as used
          session.isUsed = true;
          await transactionalEntityManager.save(session);
          
          // Get the product with lock
          const product = await transactionalEntityManager
            .createQueryBuilder(ProductEntity, 'product')
            .setLock('pessimistic_write')
            .where('product.id = :id', { id: session.productId })
            .getOne();

          if (product) {
            // Restore the stock
            product.quantity += transaction.quantity;
            await transactionalEntityManager.save(product);
            this.logger.log(`Restored ${transaction.quantity} items to product ${product.id}`);
          }

          // Save the updated transaction
          await transactionalEntityManager.save(transaction);
          this.logger.log(`Canceled expired transaction ${transaction.id}`);
        }
      });
    } catch (error) {
      this.logger.error(`Error checking expired transactions: ${error.message}`, error.stack);
    }
  }
}