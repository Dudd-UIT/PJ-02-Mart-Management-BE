import { Test, TestingModule } from '@nestjs/testing';
import { OrderDetailsService } from './order_details.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrderDetail } from './entities/order_detail.entity';
import { Repository } from 'typeorm';
import { OrdersService } from '../orders/orders.service';
import { ProductUnitsService } from '../product_units/product_units.service';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDetailDto } from './dto/create-order_detail.dto';

describe('OrderDetailsService', () => {
  let service: OrderDetailsService;
  let repository: Repository<OrderDetail>;
  let ordersService: OrdersService;
  let productUnitsService: ProductUnitsService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockOrdersService = {
    findOne: jest.fn(),
  };

  const mockProductUnitsService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderDetailsService,
        {
          provide: getRepositoryToken(OrderDetail),
          useValue: mockRepository,
        },
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
        {
          provide: ProductUnitsService,
          useValue: mockProductUnitsService,
        },
      ],
    }).compile();

    service = module.get<OrderDetailsService>(OrderDetailsService);
    repository = module.get<Repository<OrderDetail>>(
      getRepositoryToken(OrderDetail),
    );
    ordersService = module.get<OrdersService>(OrdersService);
    productUnitsService = module.get<ProductUnitsService>(ProductUnitsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an order detail successfully', async () => {
      const createDto: CreateOrderDetailDto = {
        productUnitId: 1,
        quantity: 2,
        currentPrice: 50,
        orderId: 1,
      };

      const order = { id: 1, totalPrice: 100 };
      const productUnit = { id: 1, name: 'Product A' };
      const orderDetail = {
        id: 1,
        ...createDto,
        order: order,
        productUnit: productUnit,
      };

      mockOrdersService.findOne.mockResolvedValue(order);
      mockProductUnitsService.findOne.mockResolvedValue(productUnit);
      mockRepository.save.mockResolvedValue(orderDetail);

      const result = await service.create(createDto);

      expect(result).toEqual(orderDetail);
      expect(mockOrdersService.findOne).toHaveBeenCalledWith(1);
      expect(mockProductUnitsService.findOne).toHaveBeenCalledWith(1);
      expect(mockRepository.save).toHaveBeenCalledWith(orderDetail);
    });

    it('should throw NotFoundException if order is not found', async () => {
      const createDto: CreateOrderDetailDto = {
        productUnitId: 1,
        quantity: 2,
        currentPrice: 50,
        orderId: 1,
      };

      mockOrdersService.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        new NotFoundException('Không tìm thấy đơn hàng'),
      );
    });

    it('should throw NotFoundException if product unit is not found', async () => {
      const createDto: CreateOrderDetailDto = {
        productUnitId: 1,
        quantity: 2,
        currentPrice: 50,
        orderId: 1,
      };

      const order = { id: 1, totalPrice: 100 };
      mockOrdersService.findOne.mockResolvedValue(order);
      mockProductUnitsService.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        new NotFoundException('Không tìm thấy mẫu sản phẩm'),
      );
    });

    it('should throw InternalServerErrorException if creation fails', async () => {
      const createDto: CreateOrderDetailDto = {
        productUnitId: 1,
        quantity: 2,
        currentPrice: 50,
        orderId: 1,
      };

      const order = { id: 1, totalPrice: 100 };
      const productUnit = { id: 1, name: 'Product A' };
      mockOrdersService.findOne.mockResolvedValue(order);
      mockProductUnitsService.findOne.mockResolvedValue(productUnit);
      mockRepository.save.mockRejectedValue(new Error('Save failed'));

      await expect(service.create(createDto)).rejects.toThrow(
        new InternalServerErrorException(
          'Không thể tạo chi tiết đơn hàng, vui lòng thử lại sau.',
        ),
      );
    });
  });
});
