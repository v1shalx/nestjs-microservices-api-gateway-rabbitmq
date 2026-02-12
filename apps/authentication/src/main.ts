import 'dotenv/config'; 

import { NestFactory } from '@nestjs/core';
import { AuthenticationModule } from './authentication.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthenticationModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'auth_queue',
        queueOptions: {
          durable: false,
        },
      },
    },
  );

  await app.listen();
  console.log('🚀 Authentication Microservice is running...');
}

bootstrap();
