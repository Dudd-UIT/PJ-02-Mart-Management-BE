import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { UsersService } from '../users/users.service';
import { OrderDetailsService } from '../order_details/order_details.service';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateOrderAndOrderDetailsDto } from './dto/create-order_order-detail.dto';

describe('OrdersService', () => {
  let service: OrdersService;
  let repository: Repository<Order>;
  let usersService: UsersService;
  let orderDetailsService: OrderDetailsService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    softDelete: jest.fn(),
  };

  const mockUsersService = {
    findOneById: jest.fn(),
  };

  const mockOrderDetailsService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: OrderDetailsService,
          useValue: mockOrderDetailsService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    repository = module.get<Repository<Order>>(getRepositoryToken(Order));
    usersService = module.get<UsersService>(UsersService);
    orderDetailsService = module.get<OrderDetailsService>(OrderDetailsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrderAndOrderDetails', () => {
    it('should create an order with details successfully', async () => {
      const createDto: CreateOrderAndOrderDetailsDto = {
        orderDto: {
          totalPrice: 100,
          paymentMethod: 'Cash',
          paymentTime: new Date(),
          status: 'Pending',
          customerId: 1,
          staffId: 2,
        },
        orderDetailsDto: [{ productUnitId: 1, quantity: 2, currentPrice: 50 }],
      };

      const user = {
        id: 1,
        name: 'Customer A',
        email: 'customer@domain.com',
        password: 'hashed_password',
        score: 10,
        address: 'Customer Address',
        phone: '1234567890',
        isActive: 1,
        codeId: '123456',
        codeExpired: new Date(),
        createdAt: new Date(),
        deletedAt: null,
      };

      const order = {
        id: 1,
        totalPrice: 100,
        paymentMethod: 'Cash',
        paymentTime: new Date(),
        status: 'Pending',
        orderType: 'Online',
        isReceived: 0,
        isPaid: 0,
        createdAt: new Date(),
        deletedAt: null,
        customer: user, // Using the complete `user` object
        staff: { id: 2, name: 'Staff B' },
        orderDetails: [
          { id: 1, productUnitId: 1, quantity: 2, currentPrice: 50 },
        ],
      };

      jest.spyOn(service, 'create').mockResolvedValue(order);
      mockOrderDetailsService.create.mockResolvedValue(order.orderDetails[0]);

      const result = await service.createOrderAndOrderDetails(createDto);

      expect(result).toEqual(order);
      expect(service.create).toHaveBeenCalledWith(createDto.orderDto);
      expect(mockOrderDetailsService.create).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if creating order or details fails', async () => {
      const createDto: CreateOrderAndOrderDetailsDto = {
        orderDto: {
          totalPrice: 100,
          paymentMethod: 'Cash',
          paymentTime: new Date(),
          status: 'Pending',
          customerId: 1,
          staffId: 2,
        },
        orderDetailsDto: [{ productUnitId: 1, quantity: 2, currentPrice: 50 }],
      };

      jest
        .spyOn(service, 'create')
        .mockRejectedValue(new Error('Order creation failed'));

      await expect(
        service.createOrderAndOrderDetails(createDto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAll', () => {
    it('should return all orders with pagination', async () => {
      const result = {
        meta: { current: 1, pageSize: 10, pages: 1, total: 1 },
        results: [{ id: 1, totalPrice: 100 }],
      };
      mockRepository.find.mockResolvedValue(result.results);
      mockRepository.count.mockResolvedValue(1);

      const response = await service.findAll('', 1, 10);

      expect(response).toEqual(result);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single order by ID', async () => {
      const order = { id: 1, totalPrice: 100 };
      mockRepository.findOne.mockResolvedValue(order);

      const result = await service.findOne(1);

      expect(result).toEqual(order);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if order not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an order successfully', async () => {
      const updateDto = { totalPrice: 200 };
      const order = {
        id: 1,
        totalPrice: 100,
        paymentMethod: 'Cash',
        paymentTime: new Date(),
        status: 'Pending',
        orderType: 'Online',
        isReceived: 0,
        isPaid: 0,
        createdAt: new Date(),
        deletedAt: null,
        customer: { id: 1, name: 'Customer A' },
        staff: { id: 2, name: 'Staff B' },
        orderDetails: [
          { id: 1, productUnitId: 1, quantity: 2, currentPrice: 50 },
        ],
      };
      const updatedOrder = { ...order, totalPrice: 200 };

      mockRepository.findOne.mockResolvedValue(order);
      mockRepository.save.mockResolvedValue(updatedOrder);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedOrder);
      expect(mockRepository.save).toHaveBeenCalledWith(updatedOrder);
    });

    it('should throw NotFoundException if order not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove an order successfully', async () => {
      const order = {
        id: 1,
        totalPrice: 100,
        paymentMethod: 'Cash',
        paymentTime: new Date(),
        status: 'Pending',
        orderType: 'Online',
        isReceived: 0,
        isPaid: 0,
        createdAt: new Date(),
        deletedAt: null,
        customer: { id: 1, name: 'Customer A' },
        staff: { id: 2, name: 'Staff B' },
        orderDetails: [
          { id: 1, productUnitId: 1, quantity: 2, currentPrice: 50 },
        ],
      };
      mockRepository.findOne.mockResolvedValue(order);

      const result = await service.remove(1);

      expect(result).toBeUndefined();
      expect(mockRepository.softDelete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if order not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
