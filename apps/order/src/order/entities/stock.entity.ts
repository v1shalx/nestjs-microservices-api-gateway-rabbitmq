import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('stock')
export class StockEntity {
  @PrimaryColumn()
  sku: string;

  @Column()
  name: string;

  @Column({ type: 'int', default: 0 })
  qty: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
