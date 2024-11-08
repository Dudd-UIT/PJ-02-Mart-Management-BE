import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import aqp from 'api-query-params';
import { UsersService } from '../users/users.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    private readonly usersService: UsersService,
  ) {}

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

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;
    delete filter.current;
    delete filter.pageSize;

    const totalItems = await this.orderRepository.count(filter);
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * pageSize;

    const options = {
      where: {},
      relations: [],
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
    const order = await this.usersService.findOneById(id);
    if (!order) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    return await this.orderRepository.softDelete(id);
  }
}
