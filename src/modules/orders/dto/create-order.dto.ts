import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  totalPrice: number;

  @IsNotEmpty()
  paymentMethod: string;

  @IsNotEmpty()
  paymentTime: Date;

  @IsNotEmpty()
  status: string;

  @IsNotEmpty()
  customerId: number;

  @IsOptional()
  staffId?: number;

  @IsOptional()
  orderType?: string;
}
