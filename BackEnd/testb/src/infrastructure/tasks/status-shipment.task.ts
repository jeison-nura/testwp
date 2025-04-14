import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { ExpiredTransactionsTask } from "./expired-transactions.task";
import { CheckTransactionStatusUseCase } from "src/application/use-cases/check-transaction-status.use-case";

@Injectable()
export class StatusShipmentTask {
    private readonly logger = new Logger(ExpiredTransactionsTask.name);

    constructor(
      private readonly checkTransactionStatusUseCase: CheckTransactionStatusUseCase,
    ) {}
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCron() {
    try {
        this.logger.debug('Running status payment transactions check');
        await this.checkTransactionStatusUseCase.execute();
        this.logger.log('Completed transaction status check');
      } catch (error) {
        this.logger.error(`Error checking expired transactions: ${error.message}`, error.stack);
        this.logger.error(`Error in transaction status check cron job: ${error.message}`, error.stack);
      }
  }
}