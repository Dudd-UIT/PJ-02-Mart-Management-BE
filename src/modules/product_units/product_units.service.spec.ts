import { Test, TestingModule } from '@nestjs/testing';
import { ProductUnitsService } from './product_units.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductUnit } from './entities/product_unit.entity';
import { NotFoundException } from '@nestjs/common';

describe('ProductUnitsService', () => {
  let service: ProductUnitsService;
  let repository: Repository<ProductUnit>;

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
        ProductUnitsService,
        {
          provide: getRepositoryToken(ProductUnit),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductUnitsService>(ProductUnitsService);
    repository = module.get<Repository<ProductUnit>>(
      getRepositoryToken(ProductUnit),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a product unit successfully', async () => {
      const createProductUnitDto = {
        sellPrice: 1000,
        conversionRate: 1,
        volumne: '1L', // Thêm trường volumne
        image: 'sample.jpg', // Thêm trường image
      };
      const productUnit = { id: 1, ...createProductUnitDto };

      mockRepository.create.mockReturnValue(productUnit);
      mockRepository.save.mockResolvedValue(productUnit);

      const result = await service.create(createProductUnitDto);

      expect(result).toEqual(productUnit);
      expect(mockRepository.create).toHaveBeenCalledWith(createProductUnitDto);
      expect(mockRepository.save).toHaveBeenCalledWith(productUnit);
    });
  });

  describe('findAll', () => {
    it('should return a list of product units', async () => {
      const result = [{ id: 1, sellPrice: 1000 }];
      mockRepository.find.mockResolvedValue(result);
      mockRepository.count.mockResolvedValue(1);

      const response = await service.findAll('', 1, 10, 1);

      expect(response.results).toEqual(result);
      expect(mockRepository.find).toHaveBeenCalled();
      expect(mockRepository.count).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single product unit by ID', async () => {
      const productUnit = { id: 1, sellPrice: 1000 };
      mockRepository.findOne.mockResolvedValue(productUnit);

      const result = await service.findOne(1);

      expect(result).toEqual(productUnit);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['productUnits'],
      });
    });

    it('should throw NotFoundException if product unit not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a product unit successfully', async () => {
      const productUnit = { id: 1, sellPrice: 1000 };
      const updateProductUnitDto = { sellPrice: 1500 };
      const updatedProductUnit = { ...productUnit, ...updateProductUnitDto };

      mockRepository.findOne.mockResolvedValue(productUnit);
      mockRepository.save.mockResolvedValue(updatedProductUnit);

      const result = await service.update(1, updateProductUnitDto);

      expect(result).toEqual(updatedProductUnit);
      expect(mockRepository.save).toHaveBeenCalledWith(updatedProductUnit);
    });
  });

  describe('remove', () => {
    it('should remove a product unit successfully', async () => {
      const productUnit = { id: 1, sellPrice: 1000 };
      mockRepository.findOne.mockResolvedValue(productUnit);

      const result = await service.remove(1);

      expect(result).toEqual(productUnit);
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if product unit not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
