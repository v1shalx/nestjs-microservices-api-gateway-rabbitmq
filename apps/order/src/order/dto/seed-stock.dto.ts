import { IsArray, IsInt, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class StockSeedItemDto {
  @IsString()
  sku: string;

  @IsString()
  name: string;

  @IsInt()
  @Min(0)
  qty: number;
}

export class SeedStockDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockSeedItemDto)
  items: StockSeedItemDto[];
}
