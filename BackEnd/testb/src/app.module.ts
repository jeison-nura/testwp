import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ProcessPaymentUseCase } from './application/use-cases/process-payment.use-case';
import { UpdateProductUseCase } from './application/use-cases/update-product.use-case';
import { PaymentController } from './infrastructure/controllers/payment.controller';
import { ValidationPipe } from './infrastructure/pipes/product.pipe';
import { DatabaseModule } from './infrastructure/database/database.module';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
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
  controllers: [PaymentController],
  providers: [ProcessPaymentUseCase, UpdateProductUseCase, ValidationPipe],
})
export class AppModule {}
