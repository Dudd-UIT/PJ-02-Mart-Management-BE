import { Test, TestingModule } from '@nestjs/testing';
import { OrderDetailsController } from './order_details.controller';
import { OrderDetailsService } from './order_details.service';
import { CreateOrderDetailDto } from './dto/create-order_detail.dto';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Public } from 'src/decorators/customDecorator';

describe('OrderDetailsController', () => {
  let controller: OrderDetailsController;
  let orderDetailsService: OrderDetailsService;

  const mockOrderDetailsService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderDetailsController],
      providers: [
        {
          provide: OrderDetailsService,
          useValue: mockOrderDetailsService,
        },
      ],
    }).compile();

    controller = module.get<OrderDetailsController>(OrderDetailsController);
    orderDetailsService = module.get<OrderDetailsService>(OrderDetailsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create an order detail', async () => {
      const createDto: CreateOrderDetailDto = {
        productUnitId: 1,
        quantity: 2,
        currentPrice: 50,
        orderId: 1,
      };

      const result = {
        id: 1,
        ...createDto,
      };

      mockOrderDetailsService.create.mockResolvedValue(result);

      const response = await controller.create(createDto);

      expect(response).toEqual(result);
      expect(mockOrderDetailsService.create).toHaveBeenCalledWith(createDto);
    });

    it('should throw NotFoundException if order is not found', async () => {
      const createDto: CreateOrderDetailDto = {
        productUnitId: 1,
        quantity: 2,
        currentPrice: 50,
        orderId: 1,
      };

      mockOrderDetailsService.create.mockRejectedValue(
        new NotFoundException('Không tìm thấy đơn hàng'),
      );

      await expect(controller.create(createDto)).rejects.toThrowError(
        new NotFoundException('Không tìm thấy đơn hàng'),
      );
    });

    it('should throw InternalServerErrorException if creation fails', async () => {
      const createDto: CreateOrderDetailDto = {
        productUnitId: 1,
        quantity: 2,
        currentPrice: 50,
        orderId: 1,
      };

      mockOrderDetailsService.create.mockRejectedValue(
        new InternalServerErrorException('Không thể tạo chi tiết đơn hàng'),
      );

      await expect(controller.create(createDto)).rejects.toThrowError(
        new InternalServerErrorException('Không thể tạo chi tiết đơn hàng'),
      );
    });
  });
});
