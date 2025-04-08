import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ProcessPaymentUseCase } from './application/use-cases/process-payment.use-case';
import { UpdateProductUseCase } from './application/use-cases/update-product.use-case';
import { GetProductsUseCase } from './application/use-cases/get-products.use-case';
import { PaymentController } from './infrastructure/controllers/payment.controller';
import { ProductController } from './infrastructure/controllers/product.controller';
import { ValidationPipe } from './infrastructure/pipes/product.pipe';
import { DatabaseModule } from './infrastructure/database/database.module';

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
  ],
  controllers: [PaymentController, ProductController],
  providers: [
    ProcessPaymentUseCase,
    UpdateProductUseCase,
    GetProductsUseCase,
    ValidationPipe,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
