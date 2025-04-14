import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProductEntity } from '../../domain/entities/product.entity';
import { TransactionEntity } from '../../domain/entities/transaction.entity';
import { PaymentSessionEntity } from '../../domain/entities/payment-session.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const useSSL = configService.get<string>('DB_USE_SSL') === 'true';
        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: parseInt(configService.get<string>('DB_PORT', '5432'), 10),
          username: configService.get<string>('DB_USERNAME', 'postgres'),
          password: configService.get<string>('DB_PASSWORD', 'postgres'),
          database: configService.get<string>('DB_DATABASE', 'testb'),
          entities: [ProductEntity, TransactionEntity, PaymentSessionEntity],
          synchronize:
            configService.get<string>('DB_SYNCHRONIZE', 'true') === 'true',
          ssl: useSSL ? { rejectUnauthorized: false } : false,
        };
      },
    }),
    TypeOrmModule.forFeature([
      ProductEntity,
      TransactionEntity,
      PaymentSessionEntity,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
