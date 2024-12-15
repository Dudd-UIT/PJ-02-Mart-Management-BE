import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderDetail } from './entities/order_detail.entity';
import { OrdersService } from '../orders/orders.service';
import { ProductUnitsService } from '../product_units/product_units.service';
import { CreateOrderDetailDto } from './dto/create-order_detail.dto';

@Injectable()
export class OrderDetailsService {
  constructor(
    @InjectRepository(OrderDetail)
    private readonly orderDetailRepository: Repository<OrderDetail>,
    @Inject(forwardRef(() => OrdersService))
    private readonly ordersService: OrdersService,
    private readonly productUnitsService: ProductUnitsService,
  ) {}

  async create(createOrderDetailDto: CreateOrderDetailDto) {
    try {
      const { orderId, productUnitId, ...rest } = createOrderDetailDto;
      const orderDetail = this.orderDetailRepository.create(rest);

      if (orderId) {
        const order = await this.ordersService.findOne(orderId);
        if (!order) {
          throw new NotFoundException('Không tìm thấy đơn hàng');
        }
        orderDetail.order = order;
      }

      if (productUnitId) {
        const productUnit =
          await this.productUnitsService.findOne(productUnitId);
        if (!productUnit) {
          throw new NotFoundException('Không tìm thấy mẫu sản phẩm');
        }
        orderDetail.productUnit = productUnit;
      }

      const savedOrderDetail =
        await this.orderDetailRepository.save(orderDetail);
      return savedOrderDetail;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Lỗi khi tạo chi tiết đơn hàng:', error.message);
      throw new InternalServerErrorException(
        'Không thể tạo chi tiết đơn hàng, vui lòng thử lại sau.',
      );
    }
  }
}
