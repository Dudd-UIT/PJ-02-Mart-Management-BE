import { Test, TestingModule } from '@nestjs/testing';
import { BatchsService } from './batchs.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Batch } from './entities/batch.entity';
import { Repository } from 'typeorm';
import { InboundReceiptService } from '../inbound_receipt/inbound_receipt.service';
import { ProductUnitsService } from '../product_units/product_units.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('BatchsService', () => {
  let service: BatchsService;
  let repository: Repository<Batch>;
  let inboundReceiptService: InboundReceiptService;
  let productUnitsService: ProductUnitsService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    find: jest.fn(),
    softDelete: jest.fn(),
  };

  const mockInboundReceiptService = {
    findOne: jest.fn(),
  };

  const mockProductUnitsService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BatchsService,
        {
          provide: getRepositoryToken(Batch),
          useValue: mockRepository,
        },
        {
          provide: InboundReceiptService,
          useValue: mockInboundReceiptService,
        },
        {
          provide: ProductUnitsService,
          useValue: mockProductUnitsService,
        },
      ],
    }).compile();

    service = module.get<BatchsService>(BatchsService);
    repository = module.get<Repository<Batch>>(getRepositoryToken(Batch));
    inboundReceiptService = module.get<InboundReceiptService>(
      InboundReceiptService,
    );
    productUnitsService = module.get<ProductUnitsService>(ProductUnitsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a batch successfully', async () => {
      const createDto: CreateBatchDto = {
        inboundPrice: 100,
        discount: 10,
        inventQuantity: 50,
        inboundQuantity: 100,
        expiredAt: new Date('2024-12-15T00:00:00.000Z'),
        productUnitId: 1,
        inboundReceiptId: 1,
      };

      const batch = { id: 1, ...createDto };

      mockRepository.create.mockReturnValue(batch);
      mockRepository.save.mockResolvedValue(batch);
      mockInboundReceiptService.findOne.mockResolvedValue({ id: 1 });
      mockProductUnitsService.findOne.mockResolvedValue({ id: 1 });

      const result = await service.create(createDto);

      expect(result).toEqual(batch);
      expect(mockRepository.create).toHaveBeenCalledWith({
        inboundPrice: 100,
        discount: 10,
        inventQuantity: 50,
        inboundQuantity: 100,
        expiredAt: createDto.expiredAt,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(batch);
    });

    it('should throw NotFoundException if inboundReceipt is not found', async () => {
      const createDto: CreateBatchDto = {
        inboundPrice: 100,
        discount: 10,
        inventQuantity: 50,
        inboundQuantity: 100,
        expiredAt: new Date('2024-12-15T00:00:00.000Z'), // Chuyển thành Date
        productUnitId: 1,
        inboundReceiptId: 999,
      };

      mockInboundReceiptService.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if productUnit is not found', async () => {
      const createDto: CreateBatchDto = {
        inboundPrice: 100,
        discount: 10,
        inventQuantity: 50,
        inboundQuantity: 100,
        expiredAt: new Date('2024-12-15T00:00:00.000Z'),
        productUnitId: 999,
        inboundReceiptId: 1,
      };

      mockProductUnitsService.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException on database error', async () => {
      const createDto: CreateBatchDto = {
        inboundPrice: 100,
        discount: 10,
        inventQuantity: 50,
        inboundQuantity: 100,
        expiredAt: new Date('2024-12-15T00:00:00.000Z'),
        productUnitId: 1,
        inboundReceiptId: 1,
      };

      mockInboundReceiptService.findOne.mockResolvedValue({ id: 1 });
      mockProductUnitsService.findOne.mockResolvedValue({ id: 1 });

      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    it('should return batches with pagination', async () => {
      const result = {
        meta: { current: 1, pageSize: 10, pages: 1, total: 1 },
        results: [{ id: 1, inboundPrice: 100 }],
      };
      mockRepository.count.mockResolvedValue(1);
      mockRepository.find.mockResolvedValue(result.results);

      const response = await service.findAll({}, 1, 10);

      expect(response.results).toEqual(result.results);
      expect(response.meta).toEqual(result.meta);
    });

    it('should throw InternalServerErrorException on database error', async () => {
      mockRepository.count.mockRejectedValue(new Error('Database error'));

      await expect(service.findAll({}, 1, 10)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should return empty array when no batch is found', async () => {
      mockRepository.count.mockResolvedValue(0);
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll({}, 1, 10);

      expect(result.meta.total).toEqual(0);
      expect(result.results).toEqual([]);
    });

    it('should return filtered batches when query includes expiredAt', async () => {
      const mockBatches = [{ id: 1, expiredAt: '2024-05-10' }];
      mockRepository.count.mockResolvedValue(1);
      mockRepository.find.mockResolvedValue(mockBatches);

      const result = await service.findAll({ expiredAt: '2024-05-10' }, 1, 10);

      expect(result.results).toEqual(mockBatches);
      expect(result.meta.total).toEqual(1);
    });

    it('should apply default pagination if current and pageSize are undefined', async () => {
      mockRepository.count.mockResolvedValue(5);
      mockRepository.find.mockResolvedValue([{ id: 1 }]);

      const result = await service.findAll({}, undefined, undefined);

      expect(result.meta.current).toEqual(1);
      expect(result.meta.pageSize).toEqual(10);
      expect(result.results).toEqual([{ id: 1 }]);
    });
  });

  describe('findOne', () => {
    it('should return a single batch by ID', async () => {
      const batch = { id: 1, inboundPrice: 100 };
      mockRepository.findOne.mockResolvedValue(batch);

      const result = await service.findOne(1);

      expect(result).toEqual(batch);
    });

    it('should throw NotFoundException if batch is not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on database error', async () => {
      mockRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.findOne(1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    it('should update a batch successfully', async () => {
      const updateDto: UpdateBatchDto = { inboundPrice: 150, productUnitId: 2 };
      const batch = { id: 1, inboundPrice: 100, productUnit: { id: 1 } };
      const updatedBatch = {
        ...batch,
        inboundPrice: 150,
        productUnit: { id: 2 },
      };

      mockRepository.findOne.mockResolvedValue(batch);
      mockProductUnitsService.findOne.mockResolvedValue({ id: 2 });
      mockRepository.save.mockResolvedValue(updatedBatch);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedBatch);
    });

    it('should throw NotFoundException if batch is not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, { inboundPrice: 150 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if productUnit is not found', async () => {
      const updateDto: UpdateBatchDto = { productUnitId: 999 };
      const batch = { id: 1, inboundPrice: 100, productUnit: { id: 1 } };

      mockRepository.findOne.mockResolvedValue(batch);
      mockProductUnitsService.findOne.mockResolvedValue(null);

      await expect(service.update(1, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if batch ID is invalid ', async () => {
      const updateDto: UpdateBatchDto = { inboundPrice: 100 };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(-1, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: -1 },
      });
    });

    it('should log error message and throw InternalServerErrorException on failure', async () => {
      const updateDto: UpdateBatchDto = { inboundPrice: 200 };
      const existingBatch = { id: 1, inboundPrice: 100 };

      mockRepository.findOne.mockResolvedValue(existingBatch);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.update(1, updateDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a batch successfully', async () => {
      const batch = { id: 1, inboundPrice: 100 };
      mockRepository.findOne.mockResolvedValue(batch);

      const result = await service.remove(1);

      expect(result).toEqual(batch);
      expect(mockRepository.softDelete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if batch is not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on unexpected error during removal', async () => {
      const batch = { id: 1, inboundPrice: 100 };
      mockRepository.findOne.mockResolvedValue(batch);
      mockRepository.softDelete.mockRejectedValue(
        new Error('Unexpected database error'),
      );

      await expect(service.remove(1)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockRepository.softDelete).toHaveBeenCalledWith(1);
    });
  });
});
