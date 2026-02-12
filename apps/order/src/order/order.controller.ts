import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { OrderService } from './order.service';
import { PlaceOrderDto } from './dto/place-order.dto';
import { SeedStockDto } from './dto/seed-stock.dto';

@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @MessagePattern({ cmd: 'seed-stock' })
  seedStock(dto: SeedStockDto) {
    return this.orderService.seedStock(dto);
  }

  @MessagePattern({ cmd: 'get-stock' })
  getStock(payload: { sku: string }) {
    return this.orderService.getStock(payload.sku);
  }

  @MessagePattern({ cmd: 'place-order' })
  placeOrder(dto: PlaceOrderDto) {
    return this.orderService.placeOrder(dto);
  }

  @MessagePattern({ cmd: 'get-order' })
  getOrder(payload: { id: string }) {
    return this.orderService.getOrder(payload.id);
  }
}
