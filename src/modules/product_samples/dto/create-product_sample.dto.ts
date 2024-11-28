import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProductSampleDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty()
  productLineId: number;
}
