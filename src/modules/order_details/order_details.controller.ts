import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { OrderDetailsService } from './order_details.service';
import { CreateOrderDetailDto } from './dto/create-order_detail.dto';
import { Public } from 'src/decorators/customDecorator';
import { RoleGuard } from '../auths/passport/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('order-details')
export class OrderDetailsController {
  constructor(private readonly orderDetailsService: OrderDetailsService) {}

  @Post()
  @UseGuards(RoleGuard)
  @Roles('create_order')
  create(@Body() createOrderDetailDto: CreateOrderDetailDto) {
    return this.orderDetailsService.create(createOrderDetailDto);
  }
}
