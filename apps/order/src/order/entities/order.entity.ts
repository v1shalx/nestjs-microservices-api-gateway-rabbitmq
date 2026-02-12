import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  userEmail: string;

  // store items in a single table (you asked 1 table order-related)
  @Column({ type: 'jsonb' })
  items: Array<{ sku: string; qty: number; price?: number }>;

  @Column({ type: 'numeric', default: 0 })
  totalAmount: number;

  @Column({ default: 'PLACED' })
  status: 'PLACED' | 'CANCELLED';

  @CreateDateColumn()
  createdAt: Date;
}
