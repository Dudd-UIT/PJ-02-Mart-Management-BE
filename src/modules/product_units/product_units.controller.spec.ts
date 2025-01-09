import { Test, TestingModule } from '@nestjs/testing';
import { ProductUnitsController } from './product_units.controller';
import { ProductUnitsService } from './product_units.service';
import { CreateProductUnitDto } from './dto/create-product_unit.dto';
import { UpdateProductUnitDto } from './dto/update-product_unit.dto';
import { FindProductUnitsByIdsDto } from './dto/find-product_units-by-ids.dto';
import { NotFoundException } from '@nestjs/common';

describe('ProductUnitsController', () => {
  let controller: ProductUnitsController;
  let service: ProductUnitsService;

  const mockProductUnitsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByIds: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductUnitsController],
      providers: [
        {
          provide: ProductUnitsService,
          useValue: mockProductUnitsService,
        },
      ],
    }).compile();

    controller = module.get<ProductUnitsController>(ProductUnitsController);
    service = module.get<ProductUnitsService>(ProductUnitsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a product unit successfully', async () => {
      const createProductUnitDto: CreateProductUnitDto = {
        volumne: '1L', // Thêm thuộc tính volumne
        image: 'sample.jpg', // Thêm thuộc tính image
        sellPrice: 1000,
        conversionRate: 1,
        unitId: 1,
        compareUnitId: 2,
      };
      const result = { id: 1, ...createProductUnitDto };
      mockProductUnitsService.create.mockResolvedValue(result);

      expect(await controller.create(createProductUnitDto)).toEqual(result);
      expect(mockProductUnitsService.create).toHaveBeenCalledWith(
        createProductUnitDto,
      );
    });
  });

  describe('findAll', () => {
    it('should return a list of product units', async () => {
      const result = {
        meta: { current: 1, pageSize: 10, pages: 1, total: 2 },
        results: [{ id: 1, sellPrice: 1000 }],
      };
      mockProductUnitsService.findAll.mockResolvedValue(result);

      expect(await controller.findAll('', '1', '10', '1')).toEqual(result);
      expect(mockProductUnitsService.findAll).toHaveBeenCalledWith(
        '',
        1,
        10,
        1,
      );
    });
  });

  describe('findOne', () => {
    it('should return a single product unit by ID', async () => {
      const result = { id: 1, sellPrice: 1000 };
      mockProductUnitsService.findOne.mockResolvedValue(result);

      expect(await controller.findOne(1)).toEqual(result);
      expect(mockProductUnitsService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if product unit not found', async () => {
      mockProductUnitsService.findOne.mockRejectedValue(
        new NotFoundException(),
      );

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a product unit successfully', async () => {
      const updateProductUnitDto: UpdateProductUnitDto = { sellPrice: 1500 };
      const result = { id: 1, sellPrice: 1500 };
      mockProductUnitsService.update.mockResolvedValue(result);

      expect(await controller.update(1, updateProductUnitDto)).toEqual(result);
      expect(mockProductUnitsService.update).toHaveBeenCalledWith(
        1,
        updateProductUnitDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a product unit successfully', async () => {
      const result = { id: 1, sellPrice: 1000 };
      mockProductUnitsService.remove.mockResolvedValue(result);

      expect(await controller.remove(1)).toEqual(result);
      expect(mockProductUnitsService.remove).toHaveBeenCalledWith(1);
    });
  });
});
