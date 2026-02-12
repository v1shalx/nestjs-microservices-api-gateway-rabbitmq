import { Injectable } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  private client: ClientProxy;

  constructor() {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'auth_queue',
        queueOptions: { durable: false },
      },
    });
  }

  async register(user: any) {
    console.log('API GATEWAY AUTH SERVICE USER', user);
    return await firstValueFrom(this.client.send({ cmd: 'register' }, user));
  }

  login(credentials: any) {
    return this.client.send({ cmd: 'login' }, credentials);
  }

  validateToken(token: string) {
    return this.client.send({ cmd: 'validate-token' }, token);
  }
}
