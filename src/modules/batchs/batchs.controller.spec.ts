import { Test, TestingModule } from '@nestjs/testing';
import { BatchsController } from './batchs.controller';
import { BatchsService } from './batchs.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';

describe('BatchsController', () => {
  let controller: BatchsController;
  let service: BatchsService;

  const mockBatch = {
    id: 1,
    inboundPrice: 1000.5,
    discount: 10.5,
    inventQuantity: 20,
    inboundQuantity: 50,
    expiredAt: new Date(),
    productUnitId: 1,
    inboundReceiptId: 1,
  };

  const mockBatchsService = {
    create: jest.fn((dto: CreateBatchDto) => ({ ...mockBatch, ...dto })),
    findAll: jest.fn(() => [mockBatch]),
    findOne: jest.fn((id: number) => ({ ...mockBatch, id })),
    update: jest.fn((id: number, dto: UpdateBatchDto) => ({
      ...mockBatch,
      ...dto,
    })),
    remove: jest.fn((id: number) => ({ ...mockBatch, id })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BatchsController],
      providers: [
        {
          provide: BatchsService,
          useValue: mockBatchsService,
        },
      ],
    }).compile();

    controller = module.get<BatchsController>(BatchsController);
    service = module.get<BatchsService>(BatchsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a batch', async () => {
    const dto: CreateBatchDto = {
      inboundPrice: 1000.5,
      discount: 10.5,
      inventQuantity: 20,
      inboundQuantity: 50,
      expiredAt: new Date(),
      productUnitId: 1,
      inboundReceiptId: 1,
    };

    expect(await controller.create(dto)).toEqual({
      ...mockBatch,
      ...dto,
    });
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should return all batches', async () => {
    expect(await controller.findAll('', '1', '10')).toEqual([mockBatch]);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should return a batch by ID', async () => {
    expect(await controller.findOne(1)).toEqual(mockBatch);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('should update a batch', async () => {
    const dto: UpdateBatchDto = { inboundPrice: 1200.5 };
    expect(await controller.update(1, dto)).toEqual({
      ...mockBatch,
      ...dto,
    });
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });

  it('should delete a batch', async () => {
    expect(await controller.remove(1)).toEqual(mockBatch);
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
