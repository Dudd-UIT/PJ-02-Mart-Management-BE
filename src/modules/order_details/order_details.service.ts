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
import { ProductUnit } from '../product_units/entities/product_unit.entity';

@Injectable()
export class OrderDetailsService {
  constructor(
    @InjectRepository(OrderDetail)
    private readonly orderDetailRepository: Repository<OrderDetail>,
    @Inject(forwardRef(() => OrdersService))
    private readonly ordersService: OrdersService,
    private readonly productUnitsService: ProductUnitsService,
    @InjectRepository(ProductUnit)
    private readonly productUnitRepository: Repository<ProductUnit>,
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

  async getTopSellingProducts(
    limit: number,
    startDate?: string,
    endDate?: string,
    searchProductTypeId?: number,
    searchProductLineId?: number,
  ): Promise<any[]> {
    try {
      const query = this.orderDetailRepository
        .createQueryBuilder('orderDetail')
        .select('productSample.name', 'productSampleName')
        .addSelect('productUnit.id', 'productUnitId') // Lấy productUnitId
        .addSelect('unit.name', 'unitName')
        .addSelect(
          `SUM(
            CASE
              WHEN productUnit.conversionRate IS NOT NULL THEN orderDetail.quantity * productUnit.conversionRate
              ELSE orderDetail.quantity
            END
          )`,
          'totalSold',
        )
        .addSelect('MIN(productUnit.conversionRate) AS minConversionRate') // Xác định đơn vị nhỏ nhất
        .innerJoin('orderDetail.productUnit', 'productUnit')
        .innerJoin('productUnit.productSample', 'productSample')
        .innerJoin('productSample.productLine', 'productLine')
        .innerJoin('productLine.productType', 'productType')
        .innerJoin('productUnit.unit', 'unit')
        .innerJoin('orderDetail.order', 'order') // Kết nối với bảng order
        .groupBy('productSample.id')
        .addGroupBy('productUnit.id')
        .addGroupBy('unit.id')
        .orderBy('productSample.name', 'ASC');

      // Thêm điều kiện lọc theo ngày sử dụng order.createdAt
      if (startDate && endDate) {
        query.andWhere('order.createdAt BETWEEN :startDate AND :endDate', {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        });
      } else if (startDate) {
        query.andWhere('order.createdAt >= :startDate', {
          startDate: new Date(startDate),
        });
      } else if (endDate) {
        query.andWhere('order.createdAt <= :endDate', {
          endDate: new Date(endDate),
        });
      }

      // Thêm điều kiện lọc theo searchProductTypeId
      if (searchProductTypeId) {
        query.andWhere('productType.id = :searchProductTypeId', {
          searchProductTypeId,
        });
      }

      // Thêm điều kiện lọc theo searchProductLineId
      if (searchProductLineId) {
        query.andWhere('productLine.id = :searchProductLineId', {
          searchProductLineId,
        });
      }

      const rawResults = await query.getRawMany();

      // Gộp kết quả theo productSampleName và chọn đơn vị nhỏ nhất
      const mergedResults = rawResults.reduce((acc, curr) => {
        const existing = acc.find(
          (item) => item.productSampleName === curr.productSampleName,
        );

        if (existing) {
          // Cộng dồn totalSold
          existing.totalSold += parseFloat(curr.totalSold);

          // Kiểm tra và cập nhật unitName theo đơn vị nhỏ nhất
          const currentConversionRate = parseFloat(
            curr.minConversionRate || '0',
          );
          if (
            existing.minConversionRate === null ||
            currentConversionRate < existing.minConversionRate
          ) {
            existing.unitName = curr.unitName;
            existing.minConversionRate = currentConversionRate;
          }
        } else {
          acc.push({
            productSampleName: curr.productSampleName,
            totalSold: parseFloat(curr.totalSold),
            unitName: curr.unitName,
            minConversionRate: parseFloat(curr.minConversionRate || '0'), // Lưu để so sánh
          });
        }

        return acc;
      }, []);

      // Sắp xếp giảm dần theo totalSold
      mergedResults.sort((a, b) => b.totalSold - a.totalSold);

      // Xóa `minConversionRate` trước khi trả kết quả
      const finalResults = mergedResults.map((item) => {
        delete item.minConversionRate;
        return item;
      });

      return finalResults.slice(0, limit);
    } catch (error) {
      console.error('Error fetching top-selling products:', error);
      throw new InternalServerErrorException(
        'Failed to fetch top-selling products',
      );
    }
  }
}
