import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ProcessPaymentUseCase } from './application/use-cases/process-payment.use-case';
import { UpdateProductUseCase } from './application/use-cases/update-product.use-case';
import { GetProductsUseCase } from './application/use-cases/get-products.use-case';
import { UpdateTransactionStatusUseCase } from './application/use-cases/update-transaction-status.use-case';
import { PaymentController } from './infrastructure/controllers/payment.controller';
import { ProductController } from './infrastructure/controllers/product.controller';
import { TransactionController } from './infrastructure/controllers/transaction.controller';
import { ValidationPipe } from './infrastructure/pipes/product.pipe';
import { PaymentTokenGuard } from './infrastructure/guards/payment-token.guard';
import { DatabaseModule } from './infrastructure/database/database.module';
import { CheckExpiredTransactionsUseCase } from './application/use-cases/check-expired-transactions.use-case';
import { ExpiredTransactionsTask } from './infrastructure/tasks/expired-transactions.task';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: parseInt(config.get('THROTTLE_TTL', '60'), 10),
            limit: parseInt(config.get('THROTTLE_LIMIT', '10'), 10),
          },
        ],
      }),
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'secret'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', '1h'),
        },
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [PaymentController, ProductController, TransactionController],
  providers: [
    ProcessPaymentUseCase,
    UpdateProductUseCase,
    GetProductsUseCase,
    UpdateTransactionStatusUseCase,
    ValidationPipe,
    PaymentTokenGuard,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    CheckExpiredTransactionsUseCase,
    ExpiredTransactionsTask,
  ],
})
export class AppModule {}
