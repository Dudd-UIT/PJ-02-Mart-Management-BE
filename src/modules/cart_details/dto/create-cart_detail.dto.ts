import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class BatchDto {
  id: number;
}

export class CreateCartDetailDto {
  @IsNotEmpty()
  @IsNumber()
  productUnitId: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  cartId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchDto)
  batch: BatchDto[];
}
