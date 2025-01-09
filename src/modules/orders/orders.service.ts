import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, MoreThan, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import aqp from 'api-query-params';
import { UsersService } from '../users/users.service';
import { OrderDetailsService } from '../order_details/order_details.service';
import { CreateOrderAndOrderDetailsDto } from './dto/create-order_order-detail.dto';
import { CartDetailsService } from '../cart_details/cart_details.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => OrderDetailsService))
    private readonly orderDetailsService: OrderDetailsService,
    private readonly cartDetailsService: CartDetailsService,
  ) {}

  async createOrderAndOrderDetails(
    createOrderAndOrderDetailsDto: CreateOrderAndOrderDetailsDto,
  ) {
    try {
      const { orderDto, orderDetailsDto } = createOrderAndOrderDetailsDto;
      const order = await this.create(orderDto);

      const orderId = order.id;

      for (const orderDetail of orderDetailsDto) {
        await this.orderDetailsService.create({
          ...orderDetail,
          orderId,
        });
      }

      if (orderDto.orderType === 'Online') {
        for (const orderDetail of orderDetailsDto) {
          if (orderDetail.cartDetailId) {
            await this.cartDetailsService.remove(orderDetail?.cartDetailId);
          }
        }
      }

      return await this.orderRepository.save(order);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Lỗi khi tạo đơn hàng:', error.message);
      throw new InternalServerErrorException(
        'Có lỗi xảy ra trong quá trình tạo đơn hàng.',
      );
    }
  }

  async create(createOrderDto: CreateOrderDto) {
    const order = this.orderRepository.create(createOrderDto);
    if (createOrderDto.customerId) {
      const customer = await this.usersService.findOneById(
        createOrderDto.customerId,
      );
      if (!customer) {
        throw new NotFoundException('Không tìm thấy mã khách hàng');
      }
      order.customer = customer;
    }

    if (createOrderDto.staffId) {
      const staff = await this.usersService.findOneById(createOrderDto.staffId);
      if (!staff) {
        throw new NotFoundException('Không tìm thấy mã nhân viên');
      }
      order.staff = staff;
    }
    const savedOrder = this.orderRepository.save(order);
    return savedOrder;
  }

  async findAll(query: any, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;
    delete filter.current;
    delete filter.pageSize;

    const { customerName, staffName, startDate, endDate } = query;

    const where: any = {};

    if (customerName) {
      where.customer = { name: Like(`%${customerName}%`) };
    }

    if (staffName) {
      where.staff = { name: Like(`%${staffName}%`) };
    }

    if (startDate || endDate) {
      where.createdAt = Between(
        startDate ? new Date(startDate) : new Date('1970-01-01'),
        endDate ? new Date(endDate) : new Date(),
      );
    }

    const totalItems = await this.orderRepository.count({
      where,
    });
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * pageSize;

    const options = {
      where,
      relations: [
        'customer',
        'staff',
        'orderDetails',
        'orderDetails.productUnit',
        'orderDetails.productUnit.productSample',
        'orderDetails.productUnit.unit',
      ],
      take: pageSize,
      skip: skip,
    };

    const results = await this.orderRepository.find(options);

    return {
      meta: {
        current,
        pageSize,
        pages: totalPages,
        total: totalItems,
      },
      results,
    };
  }

  async findOne(id: number) {
    const order = await this.orderRepository.findOne({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const order = await this.findOne(id);

    if (!order) {
      throw new NotFoundException(`Không tìm thấy người dùng ${id}`);
    }

    if (updateOrderDto.customerId) {
      const customer = await this.usersService.findOneById(
        updateOrderDto.customerId,
      );
      if (!customer) {
        throw new NotFoundException('Không tìm thấy mã khách hàng');
      }
      order.customer = customer;
    }

    if (updateOrderDto.staffId) {
      const staff = await this.usersService.findOneById(updateOrderDto.staffId);
      if (!staff) {
        throw new NotFoundException('Không tìm thấy mã nhân viên');
      }
      order.staff = staff;
    }
    Object.assign(order, updateOrderDto);

    return this.orderRepository.save(order);
  }

  async remove(id: number) {
    const order = await this.findOne(id);
    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    return await this.orderRepository.softDelete(id);
  }

  async getRevenueByRange(start?: Date, end?: Date): Promise<number> {
    const query = this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalPrice)', 'total')
      .where('order.isPaid = :isPaid', { isPaid: 1 });

    if (start) {
      query.andWhere('order.createdAt >= :start', { start });
    }
    if (end) {
      query.andWhere('order.createdAt <= :end', { end });
    }

    const result = await query.getRawOne();
    return parseFloat(result.total || '0');
  }

  async getOrderCountByRange(start?: Date, end?: Date): Promise<number> {
    const query = this.orderRepository.createQueryBuilder('order');
    if (start) {
      query.andWhere('order.createdAt >= :start', { start });
    }
    if (end) {
      query.andWhere('order.createdAt <= :end', { end });
    }
    return query.getCount();
  }

  async getYearsWithOrders(
    startDate?: Date,
    endDate?: Date,
  ): Promise<number[]> {
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .select('DISTINCT(YEAR(order.createdAt))', 'year');

    if (startDate) {
      queryBuilder.andWhere('order.createdAt >= :start', { start: startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('order.createdAt <= :end', { end: endDate });
    }

    const result = await queryBuilder.getRawMany();
    return result.map((item) => item.year);
  }

  async getOrderValueDistribution(
    level: string,
    startDate?: string,
    endDate?: string,
  ) {
    const date = new Date();
    const currentYear = date.getFullYear();
    const currentMonth = date.getMonth() + 1;

    // Chuyển đổi startDate và endDate thành đối tượng Date
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    // Định nghĩa các khoảng giá trị
    const ranges = [
      { label: '<200', min: 0, max: 200000 },
      { label: '200k-400k', min: 200001, max: 400000 },
      { label: '400k-600k', min: 400001, max: 600000 },
      { label: '600k-800k', min: 600001, max: 800000 },
      { label: '800k-1M', min: 800001, max: 1000000 },
      { label: '>1m', min: 1000001, max: Number.MAX_SAFE_INTEGER },
    ];

    const results = [];

    if (level === '1') {
      // Thống kê theo năm
      const years =
        start || end
          ? Array.from(
              {
                length:
                  (end?.getFullYear() || currentYear) -
                  (start?.getFullYear() || currentYear) +
                  1,
              },
              (_, i) => (start?.getFullYear() || currentYear) + i,
            )
          : await this.getYearsWithOrders();

      for (const year of years) {
        for (const range of ranges) {
          const yearStart = new Date(year, 0, 1);
          const yearEnd = new Date(year, 11, 31, 23, 59, 59);

          const adjustedStart = start && start > yearStart ? start : yearStart;
          const adjustedEnd = end && end < yearEnd ? end : yearEnd;

          const count = await this.orderRepository.count({
            where: {
              createdAt: Between(adjustedStart, adjustedEnd),
              totalPrice:
                range.max === Number.MAX_SAFE_INTEGER
                  ? MoreThan(range.min)
                  : Between(range.min, range.max),
            },
          });

          results.push({
            time: `${year}`,
            range: range.label,
            orders: count,
          });
        }
      }
    } else if (level === '2') {
      // Thống kê theo tháng
      const months = [];
      if (start || end) {
        const startYear = start?.getFullYear() || currentYear;
        const endYear = end?.getFullYear() || currentYear;
        const startMonth = start?.getMonth() + 1 || 1;
        const endMonth = end?.getMonth() + 1 || 12;

        for (let year = startYear; year <= endYear; year++) {
          const firstMonth = year === startYear ? startMonth : 1;
          const lastMonth = year === endYear ? endMonth : 12;
          for (let month = firstMonth; month <= lastMonth; month++) {
            months.push({ year, month });
          }
        }
      } else {
        for (let month = 1; month <= 12; month++) {
          months.push({ year: currentYear, month });
        }
      }

      for (const { year, month } of months) {
        for (const range of ranges) {
          const monthStart = new Date(year, month - 1, 1);
          const monthEnd = new Date(year, month, 0, 23, 59, 59);

          const adjustedStart =
            start && start > monthStart ? start : monthStart;
          const adjustedEnd = end && end < monthEnd ? end : monthEnd;

          const count = await this.orderRepository.count({
            where: {
              createdAt: Between(adjustedStart, adjustedEnd),
              totalPrice:
                range.max === Number.MAX_SAFE_INTEGER
                  ? MoreThan(range.min)
                  : Between(range.min, range.max),
            },
          });

          results.push({
            time: `${month}/${year}`,
            range: range.label,
            orders: count,
          });
        }
      }
    } else if (level === '3') {
      // Thống kê theo ngày
      const days = [];
      if (start || end) {
        const currentDate = new Date(start || new Date());
        const endDate = end || new Date();

        while (currentDate <= endDate) {
          days.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else {
        const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
          days.push(new Date(currentYear, currentMonth - 1, day));
        }
      }

      for (const day of days) {
        for (const range of ranges) {
          const dayStart = new Date(day.setHours(0, 0, 0, 0));
          const dayEnd = new Date(day.setHours(23, 59, 59, 999));

          const count = await this.orderRepository.count({
            where: {
              createdAt: Between(dayStart, dayEnd),
              totalPrice:
                range.max === Number.MAX_SAFE_INTEGER
                  ? MoreThan(range.min)
                  : Between(range.min, range.max),
            },
          });

          results.push({
            time: `${dayStart.getDate()}/${dayStart.getMonth() + 1}/${dayStart.getFullYear()}`,
            range: range.label,
            orders: count,
          });
        }
      }
    } else {
      throw new Error('Invalid level. Level must be 1, 2, or 3.');
    }

    return results;
  }
}
