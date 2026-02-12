import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RiderModule } from './rider.module';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: 'localhost',
            port: 5433,
            username: 'postgres',
            password: 'root',
            database: 'riders_db',
            autoLoadEntities: true,
            synchronize: true,
            logging: true,
        }),
        RiderModule,
    ],
})
export class AppModule { }