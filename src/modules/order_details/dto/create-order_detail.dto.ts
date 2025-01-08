import { IsNotEmpty, IsNumber, IsOptional, IsPositive } from 'class-validator';

export class CreateOrderDetailDto {
  @IsNotEmpty()
  @IsNumber()
  productUnitId: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  currentPrice: number;

  @IsNotEmpty()
  @IsNumber()
  orderId?: number;

  @IsOptional()
  @IsNumber()
  batchId?: number;

  @IsOptional()
  @IsNumber()
  cartDetailId?: number;
}
