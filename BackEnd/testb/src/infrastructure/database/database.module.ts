import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProductEntity } from '../../domain/entities/product.entity';
import { TransactionEntity } from '../../domain/entities/transaction.entity';
import { PaymentSessionEntity } from '../../domain/entities/payment-session.entity';
import * as fs from 'fs';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'testb'),
        entities: [ProductEntity, TransactionEntity, PaymentSessionEntity],
        synchronize: configService.get('DB_SYNCHRONIZE', true),
        ssl: configService.get('DB_USE_SSL ', false)
        ? {
            rejectUnauthorized: process.env.DB_REJECT_UNAUTHORIZED === 'true',
            ca: fs.readFileSync('/ruta/al/certificado.pem').toString(),
          }
        : false,
      }),
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
