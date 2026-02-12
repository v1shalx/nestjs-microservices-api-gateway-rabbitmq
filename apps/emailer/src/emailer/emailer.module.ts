import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailerController } from './emailer.controller';
import { EmailerService } from './emailer.service';
import { EmailOutboxEntity } from './entities/email-outbox.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmailOutboxEntity])],
  controllers: [EmailerController],
  providers: [EmailerService],
})
export class EmailerModule {}
