import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProductUnitDto {
  @IsOptional()
  @IsString()
  volumne: string;

  @IsNotEmpty()
  sellPrice: number;

  @IsNotEmpty()
  conversionRate: number;

  @IsOptional()
  @IsString()
  image: string;

  @IsOptional()
  productSampleId?: number;

  @IsNotEmpty()
  unitId?: number;

  @IsNotEmpty()
  compareUnitId?: number;
}
