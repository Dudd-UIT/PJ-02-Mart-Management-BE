import { Test, TestingModule } from '@nestjs/testing';
import { ProductLinesService } from './product_lines.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductLine } from './entities/product_line.entity';
import { Repository } from 'typeorm';
import { ProductTypesService } from '../product_types/product_types.service';
import { CreateProductLineDto } from './dto/create-product_line.dto';
import { UpdateProductLineDto } from './dto/update-product_line.dto';
import {
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('ProductLinesService', () => {
  let service: ProductLinesService;
  let repository: Repository<ProductLine>;
  let productTypesService: ProductTypesService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    find: jest.fn(),
    softDelete: jest.fn(),
  };

  const mockProductTypesService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductLinesService,
        {
          provide: getRepositoryToken(ProductLine),
          useValue: mockRepository,
        },
        {
          provide: ProductTypesService,
          useValue: mockProductTypesService,
        },
      ],
    }).compile();

    service = module.get<ProductLinesService>(ProductLinesService);
    repository = module.get<Repository<ProductLine>>(
      getRepositoryToken(ProductLine),
    );
    productTypesService = module.get<ProductTypesService>(ProductTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a product line successfully', async () => {
      const createDto: CreateProductLineDto = {
        name: 'Line 1',
        productTypeId: 1,
      };
      const productType = { id: 1 };
      const productLine = { id: 1, ...createDto };

      mockRepository.create.mockReturnValue(productLine);
      mockRepository.save.mockResolvedValue(productLine);
      mockProductTypesService.findOne.mockResolvedValue(productType);

      const result = await service.create(createDto);

      expect(result).toEqual(productLine);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(productLine);
      expect(mockProductTypesService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw ConflictException if name already exists', async () => {
      const createDto: CreateProductLineDto = {
        name: 'Line 1',
        productTypeId: 1,
      };
      mockRepository.findOne.mockResolvedValue({ id: 1, name: 'Line 1' });

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw NotFoundException if product type not found', async () => {
      const createDto: CreateProductLineDto = {
        name: 'Line 1',
        productTypeId: 1,
      };
      mockRepository.findOne.mockResolvedValue(null);
      mockProductTypesService.findOne.mockRejectedValue(
        new NotFoundException(),
      );

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return a list of product lines with meta', async () => {
      const result = {
        meta: { current: 1, pageSize: 10, total: 1, pages: 1 },
        results: [{ id: 1, name: 'Line 1' }],
      };
      mockRepository.count.mockResolvedValue(1);
      mockRepository.find.mockResolvedValue(result.results);

      const response = await service.findAll('', 1, 10, 1);

      expect(response.results).toEqual(result.results);
      expect(response.meta).toEqual(result.meta);
    });
  });

  describe('findOne', () => {
    it('should return a single product line by ID', async () => {
      const productLine = { id: 1, name: 'Line 1' };
      mockRepository.findOne.mockResolvedValue(productLine);

      const result = await service.findOne(1);

      expect(result).toEqual(productLine);
    });

    it('should throw NotFoundException if product line not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a product line successfully', async () => {
      const updateDto: UpdateProductLineDto = { name: 'Updated Line' };
      const productLine = { id: 1, name: 'Line 1', productType: { id: 1 } };
      const updatedProductLine = { ...productLine, ...updateDto };

      mockRepository.findOne.mockResolvedValue(productLine);
      mockRepository.save.mockResolvedValue(updatedProductLine);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedProductLine);
    });
  });

  describe('remove', () => {
    it('should remove a product line successfully', async () => {
      const productLine = { id: 1, name: 'Line 1' };
      mockRepository.findOne.mockResolvedValue(productLine);

      const result = await service.remove(1);

      expect(result).toEqual(productLine);
      expect(mockRepository.softDelete).toHaveBeenCalledWith(1);
    });
  });
});
