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

  async getTopSellingProducts(limit: number, date?: string): Promise<any[]> {
    try {
      const query = this.orderDetailRepository
        .createQueryBuilder('orderDetail')
        .select('productSample.name', 'productName')
        .addSelect('SUM(orderDetail.quantity)', 'totalSold')
        .innerJoin('orderDetail.productUnit', 'productUnit')
        .innerJoin('productUnit.productSample', 'productSample')
        .groupBy('productSample.name')
        .orderBy('totalSold', 'DESC')
        .limit(limit);

      // Filter by date range if provided
      if (date) {
        const startOfDay = new Date(date).setHours(0, 0, 0, 0);
        const endOfDay = new Date(date).setHours(23, 59, 59, 999);
        query.andWhere('orderDetail.createdAt BETWEEN :start AND :end', {
          start: new Date(startOfDay),
          end: new Date(endOfDay),
        });
      }

      const result = await query.getRawMany();
      return result;
    } catch (error) {
      console.error('Error fetching top-selling products:', error);
      throw new InternalServerErrorException(
        'Failed to fetch top-selling products',
      );
    }
  }
}
