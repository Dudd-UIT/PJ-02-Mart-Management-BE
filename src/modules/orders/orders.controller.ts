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
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Public, ResponseMessage } from 'src/decorators/customDecorator';
import { CreateOrderAndOrderDetailsDto } from './dto/create-order_order-detail.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ResponseMessage('Tạo mới đơn hàng thành công')
  @Public()
  @Post('order-details')
  createOrderAndOrderDetails(
    @Body(ValidationPipe)
    createOrderAndOrderDetailsDto: CreateOrderAndOrderDetailsDto,
  ) {
    return this.ordersService.createOrderAndOrderDetails(
      createOrderAndOrderDetailsDto,
    );
  }

  @ResponseMessage('Tạo mới đơn hàng thành công')
  @Public()
  @Post()
  create(@Body(ValidationPipe) createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @ResponseMessage('Trả về danh sách các đơn hàng thành công')
  @Public()
  @Get()
  findAll(
    @Query() query: any,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.ordersService.findAll(query, +current, +pageSize);
  }

  @ResponseMessage('Trả về thông tin chi tiết đơn hàng thành công')
  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  @ResponseMessage('Cập nhật thông tin chi tiết đơn hàng thành công')
  @Public()
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @ResponseMessage('Xóa đơn hàng thành công')
  @Public()
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.remove(id);
  }
}
