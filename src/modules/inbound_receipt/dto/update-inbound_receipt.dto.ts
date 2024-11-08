import { PartialType } from '@nestjs/mapped-types';
import { CreateInboundReceiptDto } from './create-inbound_receipt.dto';

export class UpdateInboundReceiptDto extends PartialType(
  CreateInboundReceiptDto,
) {}
