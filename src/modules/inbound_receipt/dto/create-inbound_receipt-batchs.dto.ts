import { IsNotEmpty } from 'class-validator';
import { CreateInboundReceiptDto } from './create-inbound_receipt.dto';
import { CreateBatchDto } from 'src/modules/batchs/dto/create-batch.dto';

export class CreateInboundReceiptBatchsDto {
  @IsNotEmpty()
  inboundReceiptDto: CreateInboundReceiptDto;

  @IsNotEmpty()
  batchesDto: CreateBatchDto[];
}
