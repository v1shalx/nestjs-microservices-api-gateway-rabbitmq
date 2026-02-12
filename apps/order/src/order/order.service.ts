import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { OrderEntity } from './entities/order.entity';
import { StockEntity } from './entities/stock.entity';
import { PlaceOrderDto } from './dto/place-order.dto';
import { SeedStockDto } from './dto/seed-stock.dto';

@Injectable()
export class OrderService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(OrderEntity)
    private readonly ordersRepo: Repository<OrderEntity>,
    @InjectRepository(StockEntity)
    private readonly stockRepo: Repository<StockEntity>,
    @Inject('EMAIL')
    private readonly emailClient: ClientProxy,
  ) {}

  async seedStock(dto: SeedStockDto) {
    const saved = await this.stockRepo.save(dto.items);
    return { ok: true, count: saved.length };
  }

  async getStock(sku: string) {
    return this.stockRepo.findOne({ where: { sku } });
  }

  async getOrder(id: string) {
    return this.ordersRepo.findOne({ where: { id } });
  }

  async placeOrder(dto: PlaceOrderDto) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      // 1) ✅ sync stock decrement (keep exactly as is)
      for (const item of dto.items) {
        const stockRow = await qr.manager
          .getRepository(StockEntity)
          .createQueryBuilder('s')
          .setLock('pessimistic_write')
          .where('s.sku = :sku', { sku: item.sku })
          .getOne();

        if (!stockRow) throw new Error(`SKU not found: ${item.sku}`);
        if (stockRow.qty < item.qty) {
          throw new Error(`Insufficient stock for ${item.sku}`);
        }

        stockRow.qty = stockRow.qty - item.qty;
        await qr.manager.getRepository(StockEntity).save(stockRow);
      }

      const totalAmount = 0;

      // 2) create order
      const order = await qr.manager.getRepository(OrderEntity).save({
        userId: dto.userId,
        userEmail: dto.userEmail,
        items: dto.items,
        totalAmount,
        status: 'PLACED',
      });

      await qr.commitTransaction();

      // 3) ✅ async email event AFTER commit (important)
      this.emailClient.emit('order.placed', {
        orderId: order.id,
        userEmail: order.userEmail,
      });

      return { ok: true, orderId: order.id, status: order.status };
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }
}
