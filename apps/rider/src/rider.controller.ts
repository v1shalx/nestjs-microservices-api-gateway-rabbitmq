import { Body, Controller, Post } from '@nestjs/common';
import { RiderService } from './rider.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { CreateRiderDTO } from './dto/create-rider.dto';
import { Rider } from './rider.entity';

@Controller('rider')
export class RiderController {
  constructor(private readonly riderService: RiderService) {}

  @MessagePattern({ cmd: 'create-rider' })
  create(
    @Payload()
    data: CreateRiderDTO,
    @Ctx()
    context: RmqContext,
  ): Promise<Rider> {
    console.log('data', data);
    return this.riderService.create(data);
  }

  // @Get(':id')
  @MessagePattern({ cmd: 'get-rider' })
  async getRiderById(
    // @Param()
    // params: any
    @Payload()
    data: any,
    @Ctx()
    context: RmqContext,
  ) {
    // console.log(`Pattern: ${context.getPattern()}`);
    // console.log(`Message`, JSON.stringify(context.getMessage()));
    // console.log('Channel', context.getChannelRef());
    return await this.riderService.findById(data.id);
  }
}
