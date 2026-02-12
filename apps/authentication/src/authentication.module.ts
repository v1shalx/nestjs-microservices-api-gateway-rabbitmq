import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { PrismaService } from './prisma';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: 'SECRET_KEY_OADS*&(*&(*7', // Use environment variables instead
      signOptions: { expiresIn: '1h' },
    }),
    ClientsModule.register([
      {
        name: 'RIDER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'rider_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, PrismaService],
})
export class AuthenticationModule {}
