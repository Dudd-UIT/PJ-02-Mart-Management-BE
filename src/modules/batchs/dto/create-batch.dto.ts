import { IsDate, IsDateString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateBatchDto {
  @IsOptional()
  id?: number;

  @IsNotEmpty()
  inbound_price: number;

  @IsNotEmpty()
  discount: number;

  @IsNotEmpty()
  invent_quantity: number;

  @IsNotEmpty()
  inbound_quantity: number;

  @IsNotEmpty()
  @IsDateString()
  expiredAt: Date;

  @IsNotEmpty()
  productUnitId: number;

  @IsNotEmpty()
  inboundReceiptId?: number;
}
