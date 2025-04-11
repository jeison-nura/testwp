import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CheckExpiredTransactionsUseCase } from 'src/application/use-cases/check-expired-transactions.use-case';

@Injectable()
export class ExpiredTransactionsTask {
  private readonly logger = new Logger(ExpiredTransactionsTask.name);

  constructor(
    private readonly checkExpiredTransactionsUseCase: CheckExpiredTransactionsUseCase,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleCron() {
    try {
      this.logger.debug('Running expired transactions check');
      await this.checkExpiredTransactionsUseCase.execute();
    } catch (error) {
      this.logger.error(`Error checking expired transactions: ${error.message}`, error.stack);
      throw error; // Re-throw to let NestJS scheduler handle it
    }
  }
}