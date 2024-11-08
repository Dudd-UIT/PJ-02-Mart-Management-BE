import { IsNotEmpty } from 'class-validator';

export class CreateInboundReceiptDto {
  @IsNotEmpty()
  staffId: number;

  @IsNotEmpty()
  supplierId: number;

  @IsNotEmpty()
  totalPrice: number;

  @IsNotEmpty()
  isReceived: number;

  @IsNotEmpty()
  isPaid: number;

  @IsNotEmpty()
  discount: number;

  @IsNotEmpty()
  vat: number;

  @IsNotEmpty()
  createdAt: Date;
}
