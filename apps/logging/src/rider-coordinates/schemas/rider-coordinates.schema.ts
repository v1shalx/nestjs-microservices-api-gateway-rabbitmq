import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RiderCoordinateDocument = HydratedDocument<RiderCoordinate>;

@Schema()
export class RiderCoordinate {
  @Prop({ required: true })
  lat: number;

  @Prop({ required: true })
  lng: number;

  @Prop({ required: true })
  rider: number;
}

export const RiderCoordinateSchema =
  SchemaFactory.createForClass(RiderCoordinate);
