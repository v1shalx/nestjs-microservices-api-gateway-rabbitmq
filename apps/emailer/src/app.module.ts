import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailerModule } from './emailer/emailer.module';

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
    EmailerModule,
  ],
})
export class AppModule {}
