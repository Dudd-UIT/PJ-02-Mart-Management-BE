import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateCartDto {
  // @IsNotEmpty()
  // status: string;

  @IsNotEmpty()
  @IsNumber()
  customerId: number;
}
