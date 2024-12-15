import { Test, TestingModule } from '@nestjs/testing';
import { BatchsService } from './batchs.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Batch } from './entities/batch.entity';
import { InboundReceiptService } from '../inbound_receipt/inbound_receipt.service';
import { ProductUnitsService } from '../product_units/product_units.service';

describe('BatchsService', () => {
  let service: BatchsService;
  let repository: Repository<Batch>;

  const mockBatch = {
    id: 1,
    inboundPrice: 1000.5,
    discount: 10.5,
    inventQuantity: 20,
    inboundQuantity: 50,
    expiredAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn().mockReturnValue(mockBatch),
    save: jest.fn().mockResolvedValue(mockBatch),
    find: jest.fn().mockResolvedValue([mockBatch]),
    findOne: jest.fn().mockResolvedValue(mockBatch),
    count: jest.fn().mockResolvedValue(1),
    softDelete: jest.fn().mockResolvedValue(mockBatch),
  };

  const mockInboundReceiptService = {
    findOne: jest.fn().mockResolvedValue({ id: 1 }),
  };

  const mockProductUnitsService = {
    findOne: jest.fn().mockResolvedValue({ id: 1 }),
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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a batch', async () => {
    const result = await service.create({
      inboundPrice: 1000.5,
      discount: 10.5,
      inventQuantity: 20,
      inboundQuantity: 50,
      expiredAt: new Date(),
      inboundReceiptId: 1,
      productUnitId: 1,
    });

    expect(repository.save).toHaveBeenCalled();
    expect(result).toEqual(mockBatch);
  });

  it('should return all batches', async () => {
    const result = await service.findAll('', 1, 10);
    expect(repository.find).toHaveBeenCalled();
    expect(result.results).toEqual([mockBatch]);
  });

  it('should return a batch by ID', async () => {
    const result = await service.findOne(1);
    expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toEqual(mockBatch);
  });

  it('should update a batch', async () => {
    const result = await service.update(1, { inboundPrice: 1200.5 });
    expect(repository.save).toHaveBeenCalled();
    expect(result.inboundPrice).toEqual(1200.5);
  });

  it('should delete a batch', async () => {
    const result = await service.remove(1);
    expect(repository.softDelete).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockBatch);
  });
});
