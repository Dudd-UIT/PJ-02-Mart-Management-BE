import { Test, TestingModule } from '@nestjs/testing';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('SuppliersController', () => {
  let controller: SuppliersController;
  let service: SuppliersService;

  const mockSuppliersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuppliersController],
      providers: [
        {
          provide: SuppliersService,
          useValue: mockSuppliersService,
        },
      ],
    }).compile();

    controller = module.get<SuppliersController>(SuppliersController);
    service = module.get<SuppliersService>(SuppliersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a supplier successfully', async () => {
      const createSupplierDto: CreateSupplierDto = {
        name: 'Supplier A',
        phone: '123456789',
        address: '123 Main St',
        country: 'Vietnam',
        productUnitIds: [1, 2, 3],
      };
      const result = { id: 1, ...createSupplierDto };
      mockSuppliersService.create.mockResolvedValue(result);

      expect(await controller.create(createSupplierDto)).toEqual(result);
      expect(mockSuppliersService.create).toHaveBeenCalledWith(
        createSupplierDto,
      );
    });

    it('should throw ConflictException if supplier name already exists', async () => {
      const createSupplierDto: CreateSupplierDto = {
        name: 'Supplier A',
        phone: '123456789',
        address: '123 Main St',
        country: 'Vietnam',
        productUnitIds: [1, 2, 3],
      };
      mockSuppliersService.create.mockRejectedValue(
        new ConflictException('Tên nhà cung cấp đã tồn tại'),
      );

      await expect(controller.create(createSupplierDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all suppliers', async () => {
      const result = { meta: {}, results: [] };
      mockSuppliersService.findAll.mockResolvedValue(result);

      expect(await controller.findAll('', '1', '10')).toEqual(result);
      expect(mockSuppliersService.findAll).toHaveBeenCalledWith('', 1, 10);
    });
  });

  describe('findOne', () => {
    it('should return a supplier by ID', async () => {
      const result = { id: 1, name: 'Supplier A' };
      mockSuppliersService.findOne.mockResolvedValue(result);

      expect(await controller.findOne(1)).toEqual(result);
      expect(mockSuppliersService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if supplier is not found', async () => {
      mockSuppliersService.findOne.mockRejectedValue(
        new NotFoundException('Không tìm thấy nhà cung cấp'),
      );

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a supplier successfully', async () => {
      const updateSupplierDto: UpdateSupplierDto = { name: 'Updated Supplier' };
      const result = { id: 1, ...updateSupplierDto };
      mockSuppliersService.update.mockResolvedValue(result);

      expect(await controller.update(1, updateSupplierDto)).toEqual(result);
      expect(mockSuppliersService.update).toHaveBeenCalledWith(
        1,
        updateSupplierDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a supplier successfully', async () => {
      const result = { id: 1, name: 'Supplier A' };
      mockSuppliersService.remove.mockResolvedValue(result);

      expect(await controller.remove(1)).toEqual(result);
      expect(mockSuppliersService.remove).toHaveBeenCalledWith(1);
    });
  });
});
