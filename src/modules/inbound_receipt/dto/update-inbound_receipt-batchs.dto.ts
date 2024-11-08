import { IsNotEmpty } from 'class-validator';
import { UpdateInboundReceiptDto } from './update-inbound_receipt.dto';
import { UpdateBatchDto } from 'src/modules/batchs/dto/update-batch.dto';

export class UpdateInboundReceiptBatchsDto {
  @IsNotEmpty()
  inboundReceiptDto: UpdateInboundReceiptDto;

  @IsNotEmpty()
  batchsDto: UpdateBatchDto[];
}
