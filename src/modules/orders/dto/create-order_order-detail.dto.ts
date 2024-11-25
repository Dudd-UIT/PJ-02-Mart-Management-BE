import { IsNotEmpty } from 'class-validator';
import { CreateOrderDto } from './create-order.dto';
import { CreateOrderDetailDto } from 'src/modules/order_details/dto/create-order_detail.dto';

export class CreateOrderAndOrderDetailsDto {
  @IsNotEmpty()
  orderDto: CreateOrderDto;

  @IsNotEmpty()
  orderDetailsDto: CreateOrderDetailDto[];
}
