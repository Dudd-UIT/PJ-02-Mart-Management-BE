import { IsNotEmpty } from 'class-validator';

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

  @IsNotEmpty()
  staffId: number;
}
