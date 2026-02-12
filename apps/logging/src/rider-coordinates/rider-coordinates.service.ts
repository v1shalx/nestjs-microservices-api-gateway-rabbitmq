import { Inject, Injectable } from '@nestjs/common';
import { CraeteCoordinatesDTO } from './dto/create-coordinates.dto';
import { InjectModel } from '@nestjs/mongoose';
import { RiderCoordinate } from './schemas/rider-coordinates.schema';
import { Model } from 'mongoose';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RiderCoordinatesService {
  constructor(
    @InjectModel(RiderCoordinate.name)
    private readonly riderCoodinateModel: Model<RiderCoordinate>,
    @Inject('RIDER_SERVICE') private client: ClientProxy,
  ) {}

  async getRiderCoordiantes(riderId: string) {
    try {
      const rider = Number(riderId);

      const coordinates = await this.riderCoodinateModel.find({ rider }).exec();

      if (!coordinates.length) {
        throw new Error('No coordinates found');
      }

      const pattern = { cmd: 'get-rider' };
      const payload = { id: riderId };
      const riderData = await firstValueFrom(
        this.client.send(pattern, payload),
      );

      return { coordinates, rider: riderData };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async saveRiderCoordiantes(createCoordinateDTO: CraeteCoordinatesDTO) {
    console.log('createCoordinateDTO', createCoordinateDTO);
    return await this.riderCoodinateModel.create(createCoordinateDTO);
  }
}
