import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PaymentSessionEntity } from './payment-session.entity';
import { Status } from '../transactions/status.enum';

@Entity('Transaction')
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  amount: number;

  @Column()
  sessionId: string;

  @ManyToOne(() => PaymentSessionEntity)
  @JoinColumn({
    name: 'sessionId',
  })
  paymentSession: PaymentSessionEntity;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.PENDING,
  })
  status: Status;

  @Column({ nullable: true })
  paymentTransactionId: string;

  @Column({ nullable: true })
  paymentMethod: string;

  @Column({ nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
