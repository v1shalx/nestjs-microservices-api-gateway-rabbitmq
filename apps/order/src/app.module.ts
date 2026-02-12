import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5436,
      username: 'postgres',
      password: 'root',
      database: 'orders_db',
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
    }),
    OrderModule,
  ],
})
export class AppModule {}
