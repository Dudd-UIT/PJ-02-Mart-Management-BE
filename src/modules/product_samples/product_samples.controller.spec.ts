import { Test, TestingModule } from '@nestjs/testing';
import { ProductSamplesController } from './product_samples.controller';
import { ProductSamplesService } from './product_samples.service';
import { CreateProductSampleAndProductUnitDto } from './dto/create-productSample_productUnit.dto';
import { UpdateProductSampleDto } from './dto/update-product_sample.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('ProductSamplesController', () => {
  let controller: ProductSamplesController;
  let service: ProductSamplesService;

  const mockProductSamplesService = {
    createProductSampleAndProductUnits: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    updateProductSampleAndProductUnits: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductSamplesController],
      providers: [
        {
          provide: ProductSamplesService,
          useValue: mockProductSamplesService,
        },
      ],
    }).compile();

    controller = module.get<ProductSamplesController>(ProductSamplesController);
    service = module.get<ProductSamplesService>(ProductSamplesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a product sample with units successfully', async () => {
      const createDto: CreateProductSampleAndProductUnitDto = {
        productSampleDto: {
          name: 'Sample 1',
          description: 'A sample product description',
          productLineId: 1,
        },
        productUnitsDto: [
          {
            sellPrice: 1000,
            unitId: 1,
            conversionRate: 1,
            volumne: '1L', // Đảm bảo trường volumne có giá trị
            image: 'sample-image-url.jpg', // Đảm bảo trường image có giá trị
          },
        ],
      };
      const result = { id: 1, ...createDto.productSampleDto };
      mockProductSamplesService.createProductSampleAndProductUnits.mockResolvedValue(
        result,
      );

      expect(await controller.create(createDto)).toEqual(result);
      expect(
        mockProductSamplesService.createProductSampleAndProductUnits,
      ).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return a list of product samples', async () => {
      const result = {
        meta: { current: 1, pageSize: 10, pages: 1, total: 1 },
        results: [{ id: 1, name: 'Sample 1' }],
      };
      mockProductSamplesService.findAll.mockResolvedValue(result);

      expect(await controller.findAll('', '1', '10')).toEqual(result);
      expect(mockProductSamplesService.findAll).toHaveBeenCalledWith('', 1, 10);
    });
  });

  describe('findOne', () => {
    it('should return a single product sample by ID', async () => {
      const result = { id: 1, name: 'Sample 1' };
      mockProductSamplesService.findOne.mockResolvedValue(result);

      expect(await controller.findOne(1)).toEqual(result);
      expect(mockProductSamplesService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if product sample not found', async () => {
      mockProductSamplesService.findOne.mockRejectedValue(
        new NotFoundException(),
      );

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a product sample successfully', async () => {
      const updateDto: UpdateProductSampleDto = { name: 'Updated Sample' };
      const result = { id: 1, name: 'Updated Sample' };
      mockProductSamplesService.update.mockResolvedValue(result);

      expect(await controller.update(1, updateDto)).toEqual(result);
      expect(mockProductSamplesService.update).toHaveBeenCalledWith(
        1,
        updateDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a product sample successfully', async () => {
      const result = { id: 1, name: 'Sample 1' };
      mockProductSamplesService.remove.mockResolvedValue(result);

      expect(await controller.remove(1)).toEqual(result);
      expect(mockProductSamplesService.remove).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if product sample not found', async () => {
      mockProductSamplesService.remove.mockRejectedValue(
        new NotFoundException(),
      );

      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
