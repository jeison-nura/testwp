import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CheckExpiredTransactionsUseCase } from 'src/application/use-cases/check-expired-transactions.use-case';

@Injectable()
export class ExpiredTransactionsTask {
  private readonly logger = new Logger(ExpiredTransactionsTask.name);

  constructor(
    private readonly checkExpiredTransactionsUseCase: CheckExpiredTransactionsUseCase,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.debug('Running expired transactions check');
    await this.checkExpiredTransactionsUseCase.execute();
  }
}