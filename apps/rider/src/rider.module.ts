import { Module } from '@nestjs/common';
import { RiderController } from './rider.controller';
import { RiderService } from './rider.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rider } from './rider.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rider])],
  controllers: [RiderController],
  providers: [RiderService],
})
export class RiderModule {}
