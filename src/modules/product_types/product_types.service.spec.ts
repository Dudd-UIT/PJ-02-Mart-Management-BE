import { Test, TestingModule } from '@nestjs/testing';
import { ProductTypesService } from './product_types.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductType } from './entities/product_type.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('ProductTypesService', () => {
  let service: ProductTypesService;
  let repository: Repository<ProductType>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductTypesService,
        {
          provide: getRepositoryToken(ProductType),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductTypesService>(ProductTypesService);
    repository = module.get<Repository<ProductType>>(
      getRepositoryToken(ProductType),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a product type successfully', async () => {
      const createProductTypeDto = { name: 'Electronics' };
      const productType = { id: 1, ...createProductTypeDto };

      mockRepository.create.mockReturnValue(productType);
      mockRepository.save.mockResolvedValue(productType);

      const result = await service.create(createProductTypeDto);

      expect(result).toEqual(productType);
      expect(mockRepository.create).toHaveBeenCalledWith(createProductTypeDto);
      expect(mockRepository.save).toHaveBeenCalledWith(productType);
    });

    it('should throw ConflictException if name already exists', async () => {
      mockRepository.findOne.mockResolvedValue({ id: 1, name: 'Electronics' });

      const createProductTypeDto = { name: 'Electronics' };
      await expect(service.create(createProductTypeDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return a list of product types', async () => {
      const result = [{ id: 1, name: 'Electronics' }];
      mockRepository.find.mockResolvedValue(result);
      mockRepository.count.mockResolvedValue(1);

      const response = await service.findAll('', 1, 10);

      expect(response.results).toEqual(result);
      expect(mockRepository.find).toHaveBeenCalled();
      expect(mockRepository.count).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single product type by ID', async () => {
      const productType = { id: 1, name: 'Electronics' };
      mockRepository.findOne.mockResolvedValue(productType);

      const result = await service.findOne(1);

      expect(result).toEqual(productType);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if product type not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a product type successfully', async () => {
      const productType = { id: 1, name: 'Electronics' };
      const updateProductTypeDto = { name: 'Furniture' };
      const updatedProductType = { ...productType, ...updateProductTypeDto };

      mockRepository.findOne.mockResolvedValue(productType);
      mockRepository.save.mockResolvedValue(updatedProductType);

      const result = await service.update(1, updateProductTypeDto);

      expect(result).toEqual(updatedProductType);
      expect(mockRepository.save).toHaveBeenCalledWith(updatedProductType);
    });
  });

  describe('remove', () => {
    it('should remove a product type successfully', async () => {
      const productType = { id: 1, name: 'Electronics' };
      mockRepository.findOne.mockResolvedValue(productType);

      const result = await service.remove(1);

      expect(result).toEqual(productType);
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if product type not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
