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
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Public, ResponseMessage } from 'src/decorators/customDecorator';
import { CreateOrderAndOrderDetailsDto } from './dto/create-order_order-detail.dto';
import { RoleGuard } from '../auths/passport/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ResponseMessage('Tạo mới đơn hàng thành công')
  @Post('order-details')
  @UseGuards(RoleGuard)
  @Roles('c_order')
  createOrderAndOrderDetails(
    @Body(ValidationPipe)
    createOrderAndOrderDetailsDto: CreateOrderAndOrderDetailsDto,
  ) {
    console.log('createOrderAndOrderDetailsDto', createOrderAndOrderDetailsDto);
    return this.ordersService.createOrderAndOrderDetails(
      createOrderAndOrderDetailsDto,
    );
  }

  @ResponseMessage('Tạo mới đơn hàng thành công')
  @Post()
  @UseGuards(RoleGuard)
  @Roles('c_order')
  create(@Body(ValidationPipe) createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @ResponseMessage('Trả về danh sách các đơn hàng thành công')
  @Get()
  @UseGuards(RoleGuard)
  @Roles('v_orders')
  findAll(
    @Query() query: any,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.ordersService.findAll(query, +current, +pageSize);
  }

  @ResponseMessage('Trả về thông tin chi tiết đơn hàng thành công')
  @Get(':id')
  @UseGuards(RoleGuard)
  @Roles('v_orders')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  @ResponseMessage('Cập nhật thông tin chi tiết đơn hàng thành công')
  @Patch(':id')
  @UseGuards(RoleGuard)
  @Roles('u_order')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @ResponseMessage('Xóa đơn hàng thành công')
  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles('d_order')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.remove(id);
  }
}
