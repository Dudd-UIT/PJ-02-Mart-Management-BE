import { IsDateString, IsNotEmpty, IsOptional } from 'class-validator';

class InboundReceiptDto {
  @IsNotEmpty()
  staffName: string;

  @IsNotEmpty()
  supplierId: number;

  @IsNotEmpty()
  totalPrice: number;

  @IsNotEmpty()
  discount: number;

  @IsNotEmpty()
  vat: number;

  @IsNotEmpty()
  createdAt: Date;
}

class BatchDto {
  @IsNotEmpty()
  inboundPrice: number;

  @IsNotEmpty()
  inboundQuantity: number;

  @IsNotEmpty()
  @IsDateString()
  expiredAt: Date;

  @IsNotEmpty()
  productSampleName: string;

  @IsNotEmpty()
  unitName: string;
}

export class SendMailDto {
  @IsNotEmpty()
  inboundReceiptDto: InboundReceiptDto;

  @IsNotEmpty()
  batchsDto: BatchDto[];
}
