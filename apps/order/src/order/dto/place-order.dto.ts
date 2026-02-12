import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsString()
  sku: string;

  @IsNotEmpty()
  qty: number;
}

export class PlaceOrderDto {
  @IsString()
  userId: string;

  @IsEmail()
  userEmail: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
