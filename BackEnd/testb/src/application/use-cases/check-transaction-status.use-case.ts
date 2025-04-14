import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { TransactionEntity } from 'src/domain/entities/transaction.entity';
import { PaymentSessionEntity } from 'src/domain/entities/payment-session.entity';
import { Status } from 'src/domain/transactions/status.enum';
import { PaymentGatewayService } from 'src/infrastructure/services/payment-gateway.service';

@Injectable()
export class CheckTransactionStatusUseCase {
  private readonly logger = new Logger(CheckTransactionStatusUseCase.name);

  constructor(
    private readonly entityManager: EntityManager,
    private readonly paymentGatewayService: PaymentGatewayService,
  ) {}

  async execute(): Promise<void> {
    try {
      await this.entityManager.transaction(async (transactionalEntityManager) => {
        // Find all pending transactions that have a payment transaction ID
        const pendingTransactions = await transactionalEntityManager
          .createQueryBuilder(TransactionEntity, 'transaction')
          .where('transaction.status = :status AND transaction.paymentTransactionId IS NOT NULL', {
            status: Status.PENDING,
          })
          .getMany();

        this.logger.log(`Found ${pendingTransactions.length} pending transactions to check status`);

        // Process each pending transaction
        for (const transaction of pendingTransactions) {
          try {
            // Get the transaction status from the payment gateway
            const statusResult = await this.paymentGatewayService.getTransactionStatus(
              transaction.paymentTransactionId
            );

            if (statusResult.isErr()) {
              this.logger.error(
                `Error checking status for transaction ${transaction.id}: ${statusResult.getError().message}`
              );
              continue;
            }

            const paymentData = statusResult.getValue();
            
            // Map payment gateway status to our system status
            let newStatus = Status.PENDING;
            
            switch (paymentData.status) {
              case 'APPROVED':
                newStatus = Status.APPROVED;
                break;
              case 'DECLINED':
              case 'REJECTED':
              case 'ERROR':
                newStatus = Status.REJECTED;
                break;
              case 'VOIDED':
              case 'CANCELED':
                newStatus = Status.CANCELED;
                break;
              case 'PENDING':
              default:
                // Keep as pending
                newStatus = Status.PENDING;
                break;
            }

            // Only update if status has changed
            if (newStatus !== transaction.status) {
              // Update transaction status
              transaction.status = newStatus;
              transaction.updatedAt = new Date();
              transaction.paymentMethod = paymentData.payment_method_type;
              
              // Add error message if transaction was rejected
              if (newStatus === Status.REJECTED) {
                transaction.errorMessage = 'Payment was rejected by the payment gateway';
              }
              
              // Save the updated transaction
              await transactionalEntityManager.save(transaction);
              
              // If transaction is now approved, mark the payment session as used
              if (newStatus === Status.APPROVED) {
                const session = await transactionalEntityManager.findOne(PaymentSessionEntity, {
                  where: { id: transaction.sessionId }
                });
                
                if (session) {
                  session.isUsed = true;
                  await transactionalEntityManager.save(session);
                  this.logger.log(`Marked payment session ${session.id} as used`);
                }
              }
              
              this.logger.log(
                `Updated transaction ${transaction.id} status from ${Status[transaction.status]} to ${Status[newStatus]}`
              );
            }
          } catch (error) {
            this.logger.error(
              `Error processing transaction ${transaction.id}: ${error.message}`,
              error.stack
            );
          }
        }
      });
    } catch (error) {
      this.logger.error(`Error checking transaction statuses: ${error.message}`, error.stack);
    }
  }
}