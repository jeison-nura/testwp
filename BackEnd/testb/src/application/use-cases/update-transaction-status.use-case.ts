import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Result } from 'src/common/result';
import { TransactionEntity } from 'src/domain/entities/transaction.entity';
import { Status } from 'src/domain/transactions/status.enum';
import { UpdateTransactionStatusDto } from '../dtos/update-transaction-status.dto';
import { ProductEntity } from 'src/domain/entities/product.entity';
import { PaymentSessionEntity } from 'src/domain/entities/payment-session.entity';

@Injectable()
export class UpdateTransactionStatusUseCase {
  constructor(
    private readonly entityManager: EntityManager,
  ) {}

  async execute(
    transactionId: string,
    dto: UpdateTransactionStatusDto,
  ): Promise<Result<TransactionEntity, Error>> {
    try {
      return await this.entityManager.transaction(async (transactionalEntityManager) => {
        // Validate status is a final state (not PENDING)
        const finalStates = [Status.APPROVED, Status.CANCELED, Status.REJECTED];
        if (!finalStates.includes(dto.status)) {
          return Result.err(
            new Error('Transaction status must be a final state (APPROVED, CANCELED, or REJECTED)'),
          );
        }

        // Find the transaction with a lock to prevent race conditions
        const transaction = await transactionalEntityManager
          .createQueryBuilder(TransactionEntity, 'transaction')
          .setLock('pessimistic_write')
          .where('transaction.id = :id', { id: transactionId })
          .getOne();

        if (!transaction) {
          return Result.err(new Error('Transaction not found'));
        }

        // Check if transaction is already in a final state
        if (finalStates.includes(transaction.status)) {
          return Result.err(
            new Error(
              `Transaction is already in ${transaction.status} state and cannot be updated`,
            ),
          );
        }

        // Update transaction status
        transaction.status = dto.status;

        // Add timestamp for the appropriate status
        transaction.updatedAt = new Date();

        // Get the payment session
        const paymentSession = await transactionalEntityManager
          .createQueryBuilder(PaymentSessionEntity, 'session')
          .setLock('pessimistic_write')
          .where('session.id = :sessionId', { sessionId: transaction.sessionId })
          .getOne();

        if (paymentSession) {
          // Mark the payment session as used
          paymentSession.isUsed = true;
          await transactionalEntityManager.save(paymentSession);
          
          // If the transaction is being canceled or rejected, restore the product stock
          if (dto.status === Status.CANCELED || dto.status === Status.REJECTED) {
            // Get the product with lock
            const product = await transactionalEntityManager
              .createQueryBuilder(ProductEntity, 'product')
              .setLock('pessimistic_write')
              .where('product.id = :id', { id: paymentSession.productId })
              .getOne();

            if (product) {
              // Use the quantity directly from the transaction
              product.quantity += transaction.quantity;
              await transactionalEntityManager.save(product);
            }
          }
        }

        // Save the updated transaction
        const updatedTransaction = await transactionalEntityManager.save(transaction);

        return Result.ok(updatedTransaction);
      });
    } catch (error) {
      return Result.err(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }
}