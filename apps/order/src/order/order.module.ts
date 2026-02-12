import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderEntity } from './entities/order.entity';
import { StockEntity } from './entities/stock.entity';
// ✅ remove EmailOutboxEntity from order service if you are moving it out
// import { EmailOutboxEntity } from './entities/email-outbox.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, StockEntity]),
    ClientsModule.register([
      {
        name: 'EMAIL',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'email_queue',
          queueOptions: { durable: false },
        },
      },
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
