import { Controller } from '@nestjs/common';
import { CraeteCoordinatesDTO } from './dto/create-coordinates.dto';
import { RiderCoordinatesService } from './rider-coordinates.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('rider-coordinates')
export class RiderCoordinatesController {
  constructor(private coordinatsService: RiderCoordinatesService) {}

  @MessagePattern({ cmd: 'getRiderCoordinates' })
  async getRiderCoordinates(
    @Payload()
    params: {
      id: string;
    },
  ) {
    console.log('params', params);
    return this.coordinatsService.getRiderCoordiantes(params.id);
  }
  @MessagePattern({ cmd: 'saveRiderCoordinates' })
  async saveRiderCoordiantes(
    @Payload()
    createCoordinateDTO: CraeteCoordinatesDTO,
  ) {
    return this.coordinatsService.saveRiderCoordiantes(createCoordinateDTO);
  }
}
