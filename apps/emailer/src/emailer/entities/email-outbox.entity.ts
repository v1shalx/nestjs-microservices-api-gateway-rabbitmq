import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('email_outbox')
export class EmailOutboxEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderId: string;

  @Column()
  toEmail: string;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ default: 'PENDING' })
  status: 'PENDING' | 'SENDING' | 'SENT' | 'FAILED';

  @Column({ type: 'int', default: 0 })
  attempts: number;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
