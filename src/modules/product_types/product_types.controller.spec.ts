import { Test, TestingModule } from '@nestjs/testing';
import { ProductTypesController } from './product_types.controller';
import { ProductTypesService } from './product_types.service';
import { CreateProductTypeDto } from './dto/create-product_type.dto';
import { UpdateProductTypeDto } from './dto/update-product_type.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('ProductTypesController', () => {
  let controller: ProductTypesController;
  let service: ProductTypesService;

  const mockProductTypesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductTypesController],
      providers: [
        {
          provide: ProductTypesService,
          useValue: mockProductTypesService,
        },
      ],
    }).compile();

    controller = module.get<ProductTypesController>(ProductTypesController);
    service = module.get<ProductTypesService>(ProductTypesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a product type successfully', async () => {
      const createProductTypeDto: CreateProductTypeDto = {
        name: 'Electronics',
      };
      const result = { id: 1, ...createProductTypeDto };
      mockProductTypesService.create.mockResolvedValue(result);

      expect(await controller.create(createProductTypeDto)).toEqual(result);
      expect(mockProductTypesService.create).toHaveBeenCalledWith(
        createProductTypeDto,
      );
    });

    it('should throw ConflictException if name already exists', async () => {
      const createProductTypeDto: CreateProductTypeDto = {
        name: 'Electronics',
      };
      mockProductTypesService.create.mockRejectedValue(
        new ConflictException('Tên loại sản phẩm đã tồn tại'),
      );

      await expect(controller.create(createProductTypeDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return a list of product types', async () => {
      const result = {
        meta: { current: 1, pageSize: 10, pages: 1, total: 2 },
        results: [{ id: 1, name: 'Electronics' }],
      };
      mockProductTypesService.findAll.mockResolvedValue(result);

      expect(await controller.findAll('', '1', '10')).toEqual(result);
      expect(mockProductTypesService.findAll).toHaveBeenCalledWith('', 1, 10);
    });
  });

  describe('findOne', () => {
    it('should return a single product type by ID', async () => {
      const result = { id: 1, name: 'Electronics' };
      mockProductTypesService.findOne.mockResolvedValue(result);

      expect(await controller.findOne(1)).toEqual(result);
      expect(mockProductTypesService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if product type not found', async () => {
      mockProductTypesService.findOne.mockRejectedValue(
        new NotFoundException(),
      );

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a product type successfully', async () => {
      const updateProductTypeDto: UpdateProductTypeDto = { name: 'Furniture' };
      const result = { id: 1, name: 'Furniture' };
      mockProductTypesService.update.mockResolvedValue(result);

      expect(await controller.update(1, updateProductTypeDto)).toEqual(result);
      expect(mockProductTypesService.update).toHaveBeenCalledWith(
        1,
        updateProductTypeDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a product type successfully', async () => {
      const result = { id: 1, name: 'Electronics' };
      mockProductTypesService.remove.mockResolvedValue(result);

      expect(await controller.remove(1)).toEqual(result);
      expect(mockProductTypesService.remove).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if product type not found', async () => {
      mockProductTypesService.remove.mockRejectedValue(new NotFoundException());

      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
