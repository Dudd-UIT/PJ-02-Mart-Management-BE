import { Test, TestingModule } from '@nestjs/testing';
import { ProductUnitsService } from './product_units.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductUnit } from './entities/product_unit.entity';
import { ProductSamplesService } from '../product_samples/product_samples.service';
import { UnitsService } from '../units/units.service';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateProductUnitDto } from './dto/create-product_unit.dto';

describe('ProductUnitsService', () => {
  let service: ProductUnitsService;
  let productUnitRepository: Repository<ProductUnit>;
  let productSamplesService: ProductSamplesService;
  let unitsService: UnitsService;

  const mockProductUnitRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => {
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
        getCount: jest.fn().mockResolvedValue(0),
      };
      return qb;
    }),
  };
  

  const mockProductSamplesService = {
    findOne: jest.fn(),
  };

  const mockUnitsService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductUnitsService,
        {
          provide: getRepositoryToken(ProductUnit),
          useValue: mockProductUnitRepository,
        },
        {
          provide: ProductSamplesService,
          useValue: mockProductSamplesService,
        },
        {
          provide: UnitsService,
          useValue: mockUnitsService,
        },
      ],
    }).compile();

    service = module.get<ProductUnitsService>(ProductUnitsService);
    productUnitRepository = module.get<Repository<ProductUnit>>(
      getRepositoryToken(ProductUnit),
    );
    productSamplesService = module.get<ProductSamplesService>(
      ProductSamplesService,
    );
    unitsService = module.get<UnitsService>(UnitsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createProductUnitDto: CreateProductUnitDto = {
      volumne: '20ml',
      sellPrice: 1000,
      conversionRate: 10,
      image: 'image.png',
      productSampleId: 1,
      unitId: 2,
      compareUnitId: 3,
    };

    const savedProductUnit = {
      id: 1,
      ...createProductUnitDto,
      productSample: { id: 1 },
      unit: { id: 2 },
      compareUnit: { id: 3 },
    };

    it('UTCID01: should create productUnit successfully', async () => {
      mockProductSamplesService.findOne.mockResolvedValue({ id: 1 });
      mockUnitsService.findOne.mockResolvedValueOnce({ id: 2 }); // unitId
      mockUnitsService.findOne.mockResolvedValueOnce({ id: 3 }); // compareUnitId
      mockProductUnitRepository.create.mockReturnValue(savedProductUnit);
      mockProductUnitRepository.save.mockResolvedValue(savedProductUnit);

      const result = await service.create(createProductUnitDto);

      expect(result).toEqual(savedProductUnit);
      expect(mockProductSamplesService.findOne).toHaveBeenCalledWith(1);
      expect(mockUnitsService.findOne).toHaveBeenCalledWith(2);
      expect(mockUnitsService.findOne).toHaveBeenCalledWith(3);
      expect(mockProductUnitRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(createProductUnitDto),
      );
    });

    it('UTCID02: should throw NotFoundException when productSample does not exist', async () => {
      mockProductSamplesService.findOne.mockResolvedValue(null);

      await expect(
        service.create({ ...createProductUnitDto, productSampleId: 99 }),
      ).rejects.toThrow(new NotFoundException('Không tìm thấy mẫu sản phẩm'));

      expect(mockProductSamplesService.findOne).toHaveBeenCalledWith(99);
      expect(productUnitRepository.save).not.toHaveBeenCalled();
    });

    it('UTCID03: should throw NotFoundException when unitId does not exist', async () => {
      mockProductSamplesService.findOne.mockResolvedValue({ id: 1 });
      mockUnitsService.findOne.mockResolvedValueOnce(null); // unitId

      await expect(
        service.create({ ...createProductUnitDto, unitId: 99 }),
      ).rejects.toThrow(new NotFoundException('Không tìm thấy đơn vị tính'));

      expect(mockUnitsService.findOne).toHaveBeenCalledWith(99);
      expect(productUnitRepository.save).not.toHaveBeenCalled();
    });

    it('UTCID04: should throw NotFoundException when compareUnitId does not exist', async () => {
      mockProductSamplesService.findOne.mockResolvedValue({ id: 1 });
      mockUnitsService.findOne.mockResolvedValueOnce({ id: 2 }); // unitId
      mockUnitsService.findOne.mockResolvedValueOnce(null); // compareUnitId

      await expect(
        service.create({ ...createProductUnitDto, compareUnitId: 99 }),
      ).rejects.toThrow(new NotFoundException('Không tìm thấy đơn vị tính'));

      expect(mockUnitsService.findOne).toHaveBeenCalledWith(99);
      expect(productUnitRepository.save).not.toHaveBeenCalled();
    });

    it('UTCID05: should throw Error when repository save fails', async () => {
      mockProductSamplesService.findOne.mockResolvedValue({ id: 1 });
      mockUnitsService.findOne.mockResolvedValue({ id: 2 });
      mockUnitsService.findOne.mockResolvedValue({ id: 3 });
      mockProductUnitRepository.save.mockRejectedValue(
        new Error('Database Error'),
      );

      await expect(service.create(createProductUnitDto)).rejects.toThrow(
        new Error('Có lỗi xảy ra khi tạo productUnit'),
      );

      expect(productUnitRepository.save).toHaveBeenCalled();
    });

    it('UTCID06: should throw Error when server connection fails', async () => {
      mockProductSamplesService.findOne.mockRejectedValue(
        new Error('Connection error'),
      );

      await expect(service.create(createProductUnitDto)).rejects.toThrow(
        new Error('Có lỗi xảy ra khi tạo productUnit'),
      );

      expect(mockProductSamplesService.findOne).toHaveBeenCalledWith(1);
      expect(productUnitRepository.save).not.toHaveBeenCalled();
    });
  });


  describe('update', () => {
    const updateProductUnitDto = {
      volumne: '20ml',
      sellPrice: 1000,
      conversionRate: 10,
      image: 'image.png',
    };
  
    const existingProductUnit = {
      id: 1,
      volumne: '10ml',
      sellPrice: 500,
      conversionRate: 5,
      image: 'old-image.png',
    };
  
    const updatedProductUnit = {
      ...existingProductUnit,
      ...updateProductUnitDto,
    };
  
    it('UTCID01: should update productUnit successfully', async () => {
      mockProductUnitRepository.findOne.mockResolvedValue(existingProductUnit);
      mockProductUnitRepository.save.mockResolvedValue(updatedProductUnit);
  
      const result = await service.update(1, updateProductUnitDto);
  
      expect(result).toEqual(updatedProductUnit);
      expect(mockProductUnitRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: expect.any(Array), // Chấp nhận thêm relations nếu có
      });
      expect(mockProductUnitRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(updateProductUnitDto),
      );
    });
  
    it('UTCID02: should throw NotFoundException when productUnit does not exist', async () => {
      mockProductUnitRepository.findOne.mockResolvedValue(null);
  
      await expect(service.update(99, updateProductUnitDto)).rejects.toThrow(
        new NotFoundException('Không tìm thấy mẫu sản phẩm'),
      );
  
      expect(mockProductUnitRepository.findOne).toHaveBeenCalledWith({
        where: { id: 99 },
        relations: expect.any(Array),
      });
      expect(mockProductUnitRepository.save).not.toHaveBeenCalled();
    });
  
    it('UTCID03: should throw InternalServerErrorException when repository fails', async () => {
      mockProductUnitRepository.findOne.mockResolvedValue(existingProductUnit);
      mockProductUnitRepository.save.mockRejectedValue(new Error('Lỗi ở server'));
  
      await expect(service.update(1, updateProductUnitDto)).rejects.toThrow(
        new InternalServerErrorException('Lỗi ở server'),
      );
  
      expect(mockProductUnitRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: expect.any(Array),
      });
      expect(mockProductUnitRepository.save).toHaveBeenCalled();
    });
  });
  
  
  describe('remove', () => {
    const existingProductUnit = {
      id: 1,
      volumne: '20ml',
      sellPrice: 1000,
      conversionRate: 10,
      image: 'image.png',
    };
  
    it('UTCID01: should delete productUnit successfully', async () => {
      mockProductUnitRepository.findOne.mockResolvedValue(existingProductUnit);
      mockProductUnitRepository.delete.mockResolvedValue({ affected: 1 });
  
      const result = await service.remove(1);
  
      expect(result).toEqual(existingProductUnit);
      expect(mockProductUnitRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: expect.any(Array),
      });
      expect(mockProductUnitRepository.delete).toHaveBeenCalledWith(1);
    });
  
    it('UTCID02: should throw NotFoundException when productUnit does not exist', async () => {
      mockProductUnitRepository.findOne.mockResolvedValue(null);
  
      await expect(service.remove(99)).rejects.toThrow(
        new NotFoundException('Không tìm thấy mẫu sản phẩm'),
      );
  
      expect(mockProductUnitRepository.findOne).toHaveBeenCalledWith({
        where: { id: 99 },
        relations: expect.any(Array),
      });
      expect(mockProductUnitRepository.delete).not.toHaveBeenCalled();
    });
  
    it('UTCID03: should throw InternalServerErrorException on server error', async () => {
      mockProductUnitRepository.findOne.mockRejectedValue(new Error('Lỗi ở server'));
  
      await expect(service.remove(1)).rejects.toThrow(
        new InternalServerErrorException('Lỗi ở server'),
      );
  
      expect(mockProductUnitRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: expect.any(Array),
      });
      expect(mockProductUnitRepository.delete).not.toHaveBeenCalled();
    });
  });
  
  

  describe('findAll', () => {
    const mockQuery = {};
    const mockCurrent = 1;
    const mockPageSize = 10;
    const productLineId = 1;
  
    const mockResults = [
      { id: 1, name: 'Product Unit 1' },
      { id: 2, name: 'Product Unit 2' },
    ];
  
    const mockMeta = {
      current: mockCurrent,
      pageSize: mockPageSize,
      pages: 1,
      total: 2,
    };
  
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('UTCID01: should return paginated product samples with meta', async () => {
      mockProductUnitRepository.createQueryBuilder.mockImplementation(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockResults),
        getCount: jest.fn().mockResolvedValue(2),
      }));
  
      const result = await service.findAll(mockQuery, mockCurrent, mockPageSize, null);
  
      expect(result).toEqual({
        meta: mockMeta,
        results: mockResults,
      });
      expect(mockProductUnitRepository.createQueryBuilder).toHaveBeenCalledTimes(2);
    });
  
    it('UTCID02: should apply filter for productSample name', async () => {
      const queryWithFilter = { name: 'Sample 1' };
      const filteredResults = [{ id: 1, name: 'Sample 1' }];
  
      mockProductUnitRepository.createQueryBuilder.mockImplementation(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(filteredResults),
        getCount: jest.fn().mockResolvedValue(1),
      }));
  
      const result = await service.findAll(queryWithFilter, mockCurrent, mockPageSize, null);
  
      expect(result.results).toEqual(filteredResults);
      expect(result.meta.total).toEqual(1);
    });
  
    it('UTCID03: should filter by productLineId', async () => {
      const filteredResults = [{ id: 1, name: 'Filtered Unit' }];
  
      mockProductUnitRepository.createQueryBuilder.mockImplementation(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(filteredResults),
        getCount: jest.fn().mockResolvedValue(1),
      }));
  
      const result = await service.findAll(mockQuery, mockCurrent, mockPageSize, productLineId);
  
      expect(result.results).toEqual(filteredResults);
      expect(result.meta.total).toEqual(1);
      expect(mockProductUnitRepository.createQueryBuilder).toHaveBeenCalledTimes(2);
    });
  
    it('UTCID04: should apply default pagination when current and pageSize are undefined', async () => {
      mockProductUnitRepository.createQueryBuilder.mockImplementation(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockResults),
        getCount: jest.fn().mockResolvedValue(2),
      }));
  
      const result = await service.findAll(mockQuery, undefined, undefined, null);
  
      expect(result.meta.current).toEqual(1);
      expect(result.meta.pageSize).toEqual(100);
    });
  
    it('UTCID05: should return empty array when no data is found', async () => {
      mockProductUnitRepository.createQueryBuilder.mockImplementation(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
        getCount: jest.fn().mockResolvedValue(0),
      }));
  
      const result = await service.findAll(mockQuery, mockCurrent, mockPageSize, null);
  
      expect(result.results).toEqual([]);
      expect(result.meta.total).toEqual(0);
      expect(mockProductUnitRepository.createQueryBuilder).toHaveBeenCalledTimes(2);
    });
  
    it('UTCID06: should throw InternalServerErrorException when database fails', async () => {
      mockProductUnitRepository.createQueryBuilder.mockImplementation(() => {
        throw new Error('Database error');
      });
  
      await expect(service.findAll(mockQuery, mockCurrent, mockPageSize, null)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
  
  

  describe('findOne', () => {
    it('UTCID01: should return productUnit successfully when id exists', async () => {
      const mockProductUnit = { id: 1, name: 'Sample Product Unit' };
      mockProductUnitRepository.findOne.mockResolvedValue(mockProductUnit);
  
      const result = await service.findOne(1);
  
      expect(result).toEqual(mockProductUnit);
      expect(mockProductUnitRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['productUnits'],
      });
    });
  
    it('UTCID02: should throw NotFoundException when productUnit does not exist', async () => {
      mockProductUnitRepository.findOne.mockResolvedValue(null);
  
      await expect(service.findOne(99)).rejects.toThrow(
        new NotFoundException('Không tìm thấy mẫu sản phẩm'),
      );
  
      expect(mockProductUnitRepository.findOne).toHaveBeenCalledWith({
        where: { id: 99 },
        relations: ['productUnits'],
      });
    });
  
    it('UTCID03: should throw InternalServerErrorException when repository fails', async () => {
      mockProductUnitRepository.findOne.mockRejectedValue(new Error('Lỗi ở server'));
  
      await expect(service.findOne(1)).rejects.toThrow(
        new InternalServerErrorException('Lỗi ở server'),
      );
  
      expect(mockProductUnitRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['productUnits'],
      });
    });
  });
  
  

  describe('findByIds', () => {
    const mockIds = [1, 2, 3];
    const mockCurrent = 1;
    const mockPageSize = 2;
  
    const mockResults = [
      { id: 1, name: 'Unit 1' },
      { id: 2, name: 'Unit 2' },
    ];
  
    const mockMeta = {
      current: mockCurrent,
      pageSize: mockPageSize,
      pages: 2,
      total: 3,
    };
  
    it('UTCID01: should return paginated productUnits with meta', async () => {
      mockProductUnitRepository.createQueryBuilder.mockImplementation(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(), // Thêm andWhere
        getCount: jest.fn().mockResolvedValue(3),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockResults),
      }));
    
      const result = await service.findByIds(mockIds, mockCurrent, mockPageSize);
    
      expect(result).toEqual({
        meta: mockMeta,
        results: mockResults,
      });
      expect(mockProductUnitRepository.createQueryBuilder).toHaveBeenCalledTimes(2);
    });
    
    it('UTCID02: should return all results when pageSize > total items', async () => {
      mockProductUnitRepository.createQueryBuilder.mockImplementation(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(), // Thêm andWhere
        getCount: jest.fn().mockResolvedValue(3),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockResults),
      }));
    
      const result = await service.findByIds(mockIds, 1, 10);
    
      expect(result.meta.total).toEqual(3);
      expect(result.results).toEqual(mockResults);
    });
    
  
    it('UTCID03: should return correct page when current is 2', async () => {
      const secondPageResults = [{ id: 3, name: 'Unit 3' }];
  
      mockProductUnitRepository.createQueryBuilder.mockImplementation(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(3),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(secondPageResults),
      }));
  
      const result = await service.findByIds(mockIds, 2, 2);
  
      expect(result.results).toEqual(secondPageResults);
      expect(result.meta.current).toEqual(2);
    });
  
    it('UTCID04: should return empty results when ids is empty', async () => {
      const result = await service.findByIds([], 1, 10);
  
      expect(result).toEqual({
        meta: {
          current: 1,
          pageSize: 10,
          pages: 0,
          total: 0,
        },
        results: [],
      });
    });
  
    it('UTCID05: should throw InternalServerErrorException on repository error', async () => {
      mockProductUnitRepository.createQueryBuilder.mockImplementation(() => {
        throw new Error('Database error');
      });
  
      await expect(service.findByIds(mockIds, mockCurrent, mockPageSize)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
  


});
