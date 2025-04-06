import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductEntity } from './product.entity';
import { Status } from '../transactions/status.enum';

@Entity('Transaction')
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  amount: number;

  @Column()
  productId: string;

  @ManyToOne(() => ProductEntity)
  @JoinColumn({
    name: 'productId',
  })
  product: ProductEntity;

  @Column()
  quantity: number;

  @Column()
  userId: string;

  @Column()
  cardToken: string;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.PENDING,
  })
  status: Status;

  @Column({ nullable: true })
  paymentTransactionId: string;

  @Column({ nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
