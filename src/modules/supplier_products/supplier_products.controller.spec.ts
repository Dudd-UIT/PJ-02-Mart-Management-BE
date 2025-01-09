import { Test, TestingModule } from '@nestjs/testing';
import { SupplierProductsController } from './supplier_products.controller';
import { SupplierProductsService } from './supplier_products.service';
import { NotFoundException } from '@nestjs/common';

describe('SupplierProductsController', () => {
  let controller: SupplierProductsController;
  let service: SupplierProductsService;

  const mockSupplierProductsService = {
    findAll: jest.fn(),
    // update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupplierProductsController],
      providers: [
        {
          provide: SupplierProductsService,
          useValue: mockSupplierProductsService,
        },
      ],
    }).compile();

    controller = module.get<SupplierProductsController>(
      SupplierProductsController,
    );
    service = module.get<SupplierProductsService>(SupplierProductsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a list of supplier products', async () => {
      const result = {
        meta: { current: 1, pageSize: 10, pages: 1, total: 1 },
        results: [{ id: 1, supplierId: 1, productUnitId: 1, status: 1 }],
      };
      mockSupplierProductsService.findAll.mockResolvedValue(result);

      expect(await controller.findAll('', '1', '10')).toEqual(result);
      expect(mockSupplierProductsService.findAll).toHaveBeenCalledWith(
        '',
        1,
        10,
      );
    });

    it('should return an empty list if no products are found', async () => {
      const result = {
        meta: { current: 1, pageSize: 10, pages: 0, total: 0 },
        results: [],
      };
      mockSupplierProductsService.findAll.mockResolvedValue(result);

      expect(await controller.findAll('', '1', '10')).toEqual(result);
    });
  });

  // Uncomment and modify if the `update` method is enabled in the controller
  // describe('update', () => {
  //   it('should update supplier products successfully', async () => {
  //     const supplierId = 1;
  //     const updateSupplierProductDto = { productUnitIds: [1, 2, 3] };
  //     const result = [
  //       { id: 1, supplierId: 1, productUnitId: 1, status: 1 },
  //       { id: 2, supplierId: 1, productUnitId: 2, status: 1 },
  //       { id: 3, supplierId: 1, productUnitId: 3, status: 1 },
  //     ];
  //     mockSupplierProductsService.update.mockResolvedValue(result);

  //     expect(await controller.update(supplierId, updateSupplierProductDto)).toEqual(result);
  //     expect(mockSupplierProductsService.update).toHaveBeenCalledWith(
  //       supplierId,
  //       updateSupplierProductDto,
  //     );
  //   });

  //   it('should throw NotFoundException if supplier is not found', async () => {
  //     const supplierId = 999;
  //     const updateSupplierProductDto = { productUnitIds: [1, 2, 3] };
  //     mockSupplierProductsService.update.mockRejectedValue(
  //       new NotFoundException('Không tìm thấy nhà cung cấp'),
  //     );

  //     await expect(controller.update(supplierId, updateSupplierProductDto)).rejects.toThrow(
  //       NotFoundException,
  //     );
  //   });
  // });
});
