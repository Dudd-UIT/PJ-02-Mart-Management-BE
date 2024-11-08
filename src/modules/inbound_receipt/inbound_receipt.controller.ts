import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { InboundReceiptService } from './inbound_receipt.service';
import { CreateInboundReceiptDto } from './dto/create-inbound_receipt.dto';
import { UpdateInboundReceiptDto } from './dto/update-inbound_receipt.dto';
import { CreateInboundReceiptBatchsDto } from './dto/create-inbound_receipt-batchs.dto';
import { ResponseMessage } from 'src/decorators/customDecorator';
import { UpdateInboundReceiptBatchsDto } from './dto/update-inbound_receipt-batchs.dto';

@Controller('inbound-receipt')
export class InboundReceiptController {
  constructor(private readonly inboundReceiptService: InboundReceiptService) {}

  @ResponseMessage('Tạo mới đơn nhập hàng thành công')
  @Post()
  create(
    @Body(ValidationPipe) createInboundReceiptDto: CreateInboundReceiptDto,
  ) {
    return this.inboundReceiptService.create(createInboundReceiptDto);
  }

  @ResponseMessage('Tạo mới đơn nhập hàng và các lô hàng thành công')
  @Post('inbound-receipt-batchs')
  createInboundReceiptAndBatchs(
    @Body(ValidationPipe)
    createInboundReceiptBatchsDto: CreateInboundReceiptBatchsDto,
  ) {
    return this.inboundReceiptService.createInboundReceiptAndBatchs(
      createInboundReceiptBatchsDto,
    );
  }

  @ResponseMessage('Trả về dánh sách các đơn nhập hàng thành công')
  @Get()
  findAll(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.inboundReceiptService.findAll(query, +current, +pageSize);
  }

  @ResponseMessage('Trả về thông tin chi tiết đơn nhập hàng thành công')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inboundReceiptService.findOne(id);
  }

  @ResponseMessage('Cập nhật thông tin chi tiết đơn nhập hàng thành công')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInboundReceiptDto: UpdateInboundReceiptDto,
  ) {
    return this.inboundReceiptService.update(id, updateInboundReceiptDto);
  }

  @ResponseMessage('Cập nhật thông tin đơn nhập hàng và các lô hàng thành công')
  @Patch('inbound-receipt-batchs/:id')
  updateInboundReceiptAndBatchs(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInboundReceiptBatchsDto: UpdateInboundReceiptBatchsDto,
  ) {
    return this.inboundReceiptService.updateInboundReceiptAndBatchs(
      id,
      updateInboundReceiptBatchsDto,
    );
  }

  @ResponseMessage('Xóa đơn nhập hàng thành công')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inboundReceiptService.remove(id);
  }
}
