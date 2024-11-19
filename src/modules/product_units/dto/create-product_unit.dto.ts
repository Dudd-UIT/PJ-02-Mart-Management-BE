import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProductUnitDto {
  @IsNotEmpty()
  @IsString()
  volumne: string;

  @IsNotEmpty()
  sellPrice: number;

  @IsNotEmpty()
  conversionRate: number;

  @IsOptional()
  @IsString()
  image: string;

  @IsNotEmpty()
  productSampleId?: number;

  @IsNotEmpty()
  unitId?: number;
}
