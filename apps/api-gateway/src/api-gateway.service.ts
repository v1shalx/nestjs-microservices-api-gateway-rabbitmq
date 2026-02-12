import { Injectable } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';

@Injectable()
export class ApiGatewayService {
  createRiderCoordinates(coordinates: any) {
    throw new Error('Method not implemented.');
  }
  private riderService: ClientProxy;
  private riderCoordinatesService: ClientProxy;
  private orderService: ClientProxy;

  constructor() {
    this.riderService = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'rider_queue',
        queueOptions: {
          durable: false,
        },
      },
    });
    this.riderCoordinatesService = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'rider_coordinates_queue',
        queueOptions: {
          durable: false,
        },
      },
    });

    this.orderService = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'order_queue',
        queueOptions: { durable: false },
      },
    });
  }

  getRider(payload: any) {
    console.log('called rider microservice get-rider');
    return this.riderService.send(
      { cmd: 'get-rider' },
      { id: parseInt(payload.id, 10) },
    );
  }
  createRider(rider: any) {
    return this.riderService.send({ cmd: 'create-rider' }, rider);
  }
  /**
   * RIDER COORDINATES
   */
  createRiderCoordinate(rider: any) {
    return this.riderCoordinatesService.send(
      { cmd: 'saveRiderCoordinates' },
      rider,
    );
  }

  getRiderCoordinates(id: number) {
    return this.riderCoordinatesService.send(
      { cmd: 'getRiderCoordinates' },
      { id },
    );
  }

  // 4 METHODS (order)
  seedStock(payload: any) {
    return this.orderService.send({ cmd: 'seed-stock' }, payload);
  }

  getStock(sku: string) {
    return this.orderService.send({ cmd: 'get-stock' }, { sku });
  }

  placeOrder(payload: any) {
    return this.orderService.send({ cmd: 'place-order' }, payload);
  }

  getOrder(id: string) {
    return this.orderService.send({ cmd: 'get-order' }, { id });
  }
}
