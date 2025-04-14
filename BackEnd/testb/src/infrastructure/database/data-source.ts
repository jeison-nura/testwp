import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { config } from 'dotenv';
import { ProductEntity } from '../../domain/entities/product.entity';
import { TransactionEntity } from '../../domain/entities/transaction.entity';
import { PaymentSessionEntity } from '../../domain/entities/payment-session.entity';
import { InitialDataSeeder } from './seeds/initial-data.seed';
import * as fs from 'fs';

// Load environment variables
config();

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'testb',
  entities: [ProductEntity, TransactionEntity, PaymentSessionEntity],
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  ssl: { rejectUnauthorized: false },
  seeds: [InitialDataSeeder],
};

export const AppDataSource = new DataSource(options);
