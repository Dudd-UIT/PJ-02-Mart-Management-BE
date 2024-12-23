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
import { Between, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import aqp from 'api-query-params';
import { UsersService } from '../users/users.service';
import { OrderDetailsService } from '../order_details/order_details.service';
import { CreateOrderAndOrderDetailsDto } from './dto/create-order_order-detail.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => OrderDetailsService))
    private readonly orderDetailsService: OrderDetailsService,
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

    const totalItems = await this.orderRepository.count({
      where: filter,
    });
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * pageSize;

    const options = {
      where: {},
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

  async getRevenueByDate(date: string): Promise<number> {
    const startOfDay = new Date(date).setHours(0, 0, 0, 0);
    const endOfDay = new Date(date).setHours(23, 59, 59, 999);

    const revenue = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalPrice)', 'total')
      .where('order.isPaid = :isPaid', { isPaid: true })
      .andWhere('order.createdAt BETWEEN :start AND :end', {
        start: new Date(startOfDay),
        end: new Date(endOfDay),
      })
      .getRawOne();

    return revenue.total || 0;
  }

  async getRevenueByMonth(year: number, month: number): Promise<number> {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    const revenue = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalPrice)', 'total')
      .where('order.isPaid = :isPaid', { isPaid: true })
      .andWhere('order.createdAt BETWEEN :start AND :end', {
        start: startOfMonth,
        end: endOfMonth,
      })
      .getRawOne();

    return revenue.total || 0;
  }

  async getRevenueByYear(year: number): Promise<number> {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31);

    const revenue = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalPrice)', 'total')
      .where('order.isPaid = :isPaid', { isPaid: true })
      .andWhere('order.createdAt BETWEEN :start AND :end', {
        start: startOfYear,
        end: endOfYear,
      })
      .getRawOne();

    return revenue.total || 0;
  }

  async getOrderCountByDate(date: string): Promise<number> {
    const startOfDay = new Date(date).setHours(0, 0, 0, 0);
    const endOfDay = new Date(date).setHours(23, 59, 59, 999);

    return this.orderRepository.count({
      where: {
        createdAt: Between(new Date(startOfDay), new Date(endOfDay)),
      },
    });
  }

  async getOrderCountByMonth(year: number, month: number): Promise<number> {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    return this.orderRepository.count({
      where: {
        createdAt: Between(startOfMonth, endOfMonth),
      },
    });
  }

  async getOrderCountByYear(year: number): Promise<number> {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31);

    return this.orderRepository.count({
      where: {
        createdAt: Between(startOfYear, endOfYear),
      },
    });
  }

  async getYearsWithOrders(): Promise<number[]> {
    const result = await this.orderRepository
      .createQueryBuilder('order')
      .select('DISTINCT(YEAR(order.createdAt))', 'year')
      .getRawMany();
    return result.map((item) => item.year);
  }
}
