import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProductUnitDto {
  @IsOptional()
  @IsString()
  volumne: string;

  @IsNotEmpty()
  sell_price: number;

  @IsNotEmpty()
  conversion_rate: number;

  @IsOptional()
  @IsString()
  image: string;

  @IsOptional()
  productSampleId?: number;

  @IsNotEmpty()
  unitId?: number;
}
