import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateOrderDetailDto {
  @IsNotEmpty()
  @IsNumber()
  orderId: number;

  @IsNotEmpty()
  details: OrderDetailDto[];
}

export class OrderDetailDto {
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
}
