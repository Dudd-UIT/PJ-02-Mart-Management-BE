import { Test, TestingModule } from '@nestjs/testing';
import { ProductLinesController } from './product_lines.controller';
import { ProductLinesService } from './product_lines.service';
import { CreateProductLineDto } from './dto/create-product_line.dto';
import { UpdateProductLineDto } from './dto/update-product_line.dto';

describe('ProductLinesController', () => {
  let controller: ProductLinesController;
  let service: ProductLinesService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductLinesController],
      providers: [
        {
          provide: ProductLinesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ProductLinesController>(ProductLinesController);
    service = module.get<ProductLinesService>(ProductLinesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a product line successfully', async () => {
      const createDto: CreateProductLineDto = {
        name: 'Line 1',
        productTypeId: 1,
      };
      const result = { id: 1, ...createDto };

      mockService.create.mockResolvedValue(result);

      expect(await controller.create(createDto)).toEqual(result);
    });
  });

  describe('findAll', () => {
    it('should return a list of product lines', async () => {
      const result = {
        meta: { current: 1, pageSize: 10, pages: 1, total: 1 },
        results: [{ id: 1, name: 'Line 1' }],
      };
      mockService.findAll.mockResolvedValue(result);

      expect(await controller.findAll('', '1', '10', '1')).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should return a single product line by ID', async () => {
      const result = { id: 1, name: 'Line 1' };
      mockService.findOne.mockResolvedValue(result);

      expect(await controller.findOne(1)).toEqual(result);
    });
  });

  describe('update', () => {
    it('should update a product line successfully', async () => {
      const updateDto: UpdateProductLineDto = { name: 'Updated Line' };
      const result = { id: 1, ...updateDto };

      mockService.update.mockResolvedValue(result);

      expect(await controller.update(1, updateDto)).toEqual(result);
    });
  });

  describe('remove', () => {
    it('should remove a product line successfully', async () => {
      const result = { id: 1, name: 'Line 1' };
      mockService.remove.mockResolvedValue(result);

      expect(await controller.remove(1)).toEqual(result);
    });
  });
});
