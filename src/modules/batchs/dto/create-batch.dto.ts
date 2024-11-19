import { IsDate, IsDateString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateBatchDto {
  @IsOptional()
  id?: number;

  @IsNotEmpty()
  inboundPrice: number;

  @IsNotEmpty()
  discount: number;

  @IsNotEmpty()
  inventQuantity: number;

  @IsNotEmpty()
  inboundQuantity: number;

  @IsNotEmpty()
  @IsDateString()
  expiredAt: Date;

  @IsNotEmpty()
  productUnitId: number;

  @IsNotEmpty()
  inboundReceiptId?: number;
}
