import { Test, TestingModule } from '@nestjs/testing';
import { OrderDetailsService } from './order_details.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderDetail } from './entities/order_detail.entity';
import { OrdersService } from '../orders/orders.service';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateOrderDetailDto } from './dto/create-order_detail.dto';
import { ProductUnitsService } from '../product_units/product_units.service';

describe('OrderDetailsService', () => {
  let service: OrderDetailsService;
  let orderDetailRepository: Repository<OrderDetail>;
  let ordersService: OrdersService;
  let productUnitsService: ProductUnitsService;

  const mockOrderDetailRepository = {
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
        { provide: getRepositoryToken(OrderDetail), useValue: mockOrderDetailRepository },
        { provide: OrdersService, useValue: mockOrdersService },
        { provide: ProductUnitsService, useValue: mockProductUnitsService },
      ],
    }).compile();

    service = module.get<OrderDetailsService>(OrderDetailsService);
    orderDetailRepository = module.get<Repository<OrderDetail>>(getRepositoryToken(OrderDetail));
    ordersService = module.get<OrdersService>(OrdersService);
    productUnitsService = module.get<ProductUnitsService>(ProductUnitsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const mockCreateDto: CreateOrderDetailDto = {
      orderId: 1,
      productUnitId: 1,
      quantity: 10,
      currentPrice: 100,
    };

    const mockOrderDetail = {
      id: 1,
      ...mockCreateDto,
      order: { id: 1 },
      productUnit: { id: 1 },
    };

    it('UTCID01: should create orderDetail successfully', async () => {
      mockOrdersService.findOne.mockResolvedValue({ id: 1 });
      mockProductUnitsService.findOne.mockResolvedValue({ id: 1 });
      mockOrderDetailRepository.create.mockReturnValue(mockOrderDetail);
      mockOrderDetailRepository.save.mockResolvedValue(mockOrderDetail);

      const result = await service.create(mockCreateDto);

      expect(result).toEqual(mockOrderDetail);
      expect(mockOrdersService.findOne).toHaveBeenCalledWith(1);
      expect(mockProductUnitsService.findOne).toHaveBeenCalledWith(1);
      expect(mockOrderDetailRepository.save).toHaveBeenCalledWith(mockOrderDetail);
    });

    it('UTCID02: should throw NotFoundException when order does not exist', async () => {
      mockOrdersService.findOne.mockResolvedValue(null);

      await expect(service.create({ ...mockCreateDto, orderId: 99 })).rejects.toThrow(
        new NotFoundException('Không tìm thấy đơn hàng'),
      );

      expect(mockOrdersService.findOne).toHaveBeenCalledWith(99);
      expect(orderDetailRepository.save).not.toHaveBeenCalled();
    });

    it('UTCID03: should throw NotFoundException when productUnit does not exist', async () => {
      mockOrdersService.findOne.mockResolvedValue({ id: 1 });
      mockProductUnitsService.findOne.mockResolvedValue(null);

      await expect(
        service.create({ ...mockCreateDto, productUnitId: 99 }),
      ).rejects.toThrow(new NotFoundException('Không tìm thấy mẫu sản phẩm'));

      expect(productUnitsService.findOne).toHaveBeenCalledWith(99);
      expect(orderDetailRepository.save).not.toHaveBeenCalled();
    });

    it('UTCID04: should throw InternalServerErrorException when repository fails', async () => {
      mockOrdersService.findOne.mockResolvedValue({ id: 1 });
      mockProductUnitsService.findOne.mockResolvedValue({ id: 1 });
      mockOrderDetailRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(mockCreateDto)).rejects.toThrow(
        new InternalServerErrorException(
          'Không thể tạo chi tiết đơn hàng, vui lòng thử lại sau.',
        ),
      );

      expect(orderDetailRepository.save).toHaveBeenCalled();
    });

    it('UTCID05: should throw InternalServerErrorException when server connection fails', async () => {
      mockOrdersService.findOne.mockRejectedValue(new Error('Connection error'));

      await expect(service.create(mockCreateDto)).rejects.toThrow(
        new InternalServerErrorException(
          'Không thể tạo chi tiết đơn hàng, vui lòng thử lại sau.',
        ),
      );

      expect(ordersService.findOne).toHaveBeenCalledWith(1);
      expect(orderDetailRepository.save).not.toHaveBeenCalled();
    });
  });
});
