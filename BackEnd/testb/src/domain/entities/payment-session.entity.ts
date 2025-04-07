import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('PaymentSession')
export class PaymentSessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sessionToken: string;

  @Column()
  productId: string;

  @Column({ nullable: true })
  userId: string;

  @Column() // Add this field for the email
  userEmail: string;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  isUsed: boolean;
}
