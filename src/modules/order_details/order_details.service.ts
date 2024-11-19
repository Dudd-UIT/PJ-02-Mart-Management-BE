import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDetailDto } from './dto/create-order_detail.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderDetail } from './entities/order_detail.entity';
import { OrdersService } from '../orders/orders.service';
import { ProductUnitsService } from '../product_units/product_units.service';

@Injectable()
export class OrderDetailsService {
  constructor(
    @InjectRepository(OrderDetail)
    private readonly orderDetailRepository: Repository<OrderDetail>,
    private readonly ordersService: OrdersService,
    private readonly productUnitsService: ProductUnitsService,
  ) {}

  async addProductsToOrder(createOrderDetailDto: CreateOrderDetailDto) {
    const { orderId, details, ...rest } = createOrderDetailDto;
    const order = await this.ordersService.findOne(orderId);
    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng với id ${orderId}`);
    }
    const orderDetails = [];
    for (const detail of details) {
      const { productUnitId, quantity, currentPrice } = detail;
      const productUnit = await this.productUnitsService.findOne(productUnitId);
      if (!productUnit) {
        throw new NotFoundException(
          `Không tìm thấy mẫu sản phẩm với id ${productUnitId}`,
        );
      }
      const orderDetail = this.orderDetailRepository.create({
        order,
        productUnit,
        quantity,
        currentPrice,
      });
      orderDetails.push(orderDetail);
    }
    return this.orderDetailRepository.save(orderDetails);
  }
}
