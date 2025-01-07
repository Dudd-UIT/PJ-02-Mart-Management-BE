import { IsNotEmpty } from 'class-validator';

export class CreateCartDto {
  @IsNotEmpty()
  status: string;

  @IsNotEmpty()
  customerId: number;
}
