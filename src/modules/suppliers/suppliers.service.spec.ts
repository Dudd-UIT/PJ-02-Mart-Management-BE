import { Test, TestingModule } from '@nestjs/testing';
import { SuppliersService } from './suppliers.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Supplier } from './entities/supplier.entity';
import { SupplierProductsService } from '../supplier_products/supplier_products.service';
import { Repository } from 'typeorm';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

describe('SuppliersService', () => {
  let service: SuppliersService;
  let supplierRepository: Repository<Supplier>;
  let supplierProductsService: SupplierProductsService;

  const mockSupplierRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
    find: jest.fn(),
    softDelete: jest.fn(),
  };

  const mockSupplierProductsService = {
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuppliersService,
        {
          provide: getRepositoryToken(Supplier),
          useValue: mockSupplierRepository,
        },
        {
          provide: SupplierProductsService,
          useValue: mockSupplierProductsService,
        },
      ],
    }).compile();

    service = module.get<SuppliersService>(SuppliersService);
    supplierRepository = module.get<Repository<Supplier>>(
      getRepositoryToken(Supplier),
    );
    supplierProductsService = module.get<SupplierProductsService>(
      SupplierProductsService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createSupplierDto: CreateSupplierDto = {
      name: 'Supplier 1',
      phone: '0987654321',
      address: '123 Main St',
      country: 'Viet Nam',
      productUnitIds: [1, 2],
    };

    it('should create a supplier successfully', async () => {
      const supplierEntity = { id: 1, ...createSupplierDto };

      mockSupplierRepository.findOne.mockResolvedValue(null); // No conflict
      mockSupplierRepository.create.mockReturnValue(supplierEntity);
      mockSupplierRepository.save.mockResolvedValue(supplierEntity);
      mockSupplierProductsService.update.mockResolvedValue([
        { supplierId: 1, productUnitId: 1, status: 1 },
        { supplierId: 1, productUnitId: 2, status: 1 },
      ]);

      const result = await service.create(createSupplierDto);

      expect(result).toEqual([
        { supplierId: 1, productUnitId: 1, status: 1 },
        { supplierId: 1, productUnitId: 2, status: 1 },
      ]);

      expect(mockSupplierRepository.findOne).toHaveBeenCalledTimes(2);
      expect(mockSupplierRepository.create).toHaveBeenCalledWith(
        createSupplierDto,
      );
      expect(mockSupplierRepository.save).toHaveBeenCalledWith(supplierEntity);
      expect(mockSupplierProductsService.update).toHaveBeenCalledWith(1, {
        productUnitIds: [1, 2],
      });
    });

    it('should throw ConflictException if supplier name already exists', async () => {
      mockSupplierRepository.findOne.mockResolvedValueOnce({
        name: 'Supplier 1',
      });

      await expect(service.create(createSupplierDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockSupplierRepository.findOne).toHaveBeenCalledWith({
        where: { name: 'Supplier 1' },
      });
    });

    it('should throw ConflictException if supplier phone already exists', async () => {
      mockSupplierRepository.findOne
        .mockResolvedValueOnce(null) // Name does not exist
        .mockResolvedValueOnce({ phone: '0987654321' });

      await expect(service.create(createSupplierDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockSupplierRepository.findOne).toHaveBeenCalledWith({
        where: { phone: '0987654321' },
      });
    });

    it('should throw NotFoundException if product unit ids do not exist', async () => {
      const supplierEntity = { id: 1, ...createSupplierDto };

      mockSupplierRepository.findOne.mockResolvedValue(null); // No conflicts
      mockSupplierRepository.create.mockReturnValue(supplierEntity);
      mockSupplierRepository.save.mockResolvedValue(supplierEntity);
      mockSupplierProductsService.update.mockRejectedValue(
        new NotFoundException('Không tìm thấy một số mẫu sản phẩm'),
      );

      await expect(service.create(createSupplierDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockSupplierProductsService.update).toHaveBeenCalledWith(1, {
        productUnitIds: [1, 2],
      });
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      mockSupplierRepository.findOne.mockRejectedValue(
        new Error('Database Error'),
      );

      await expect(service.create(createSupplierDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockSupplierRepository.findOne).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated suppliers with meta', async () => {
      const query = { name: 'Supplier 1' };
      const current = 1;
      const pageSize = 10;

      const mockSuppliers = [
        {
          id: 1,
          name: 'Supplier 1',
          phone: '0987654321',
          address: '123 Main St',
          country: 'Viet Nam',
          supplierProducts: [],
        },
      ];

      // Cấu hình mock giá trị trả về cho count và find
      mockSupplierRepository.count.mockResolvedValueOnce(1);
      mockSupplierRepository.find.mockResolvedValueOnce(mockSuppliers);

      const result = await service.findAll(query, current, pageSize);

      expect(result).toEqual({
        meta: {
          current: 1,
          pageSize: 10,
          pages: 1,
          total: 1,
        },
        results: mockSuppliers,
      });

      // Kiểm tra mock được gọi đúng với tham số
      expect(mockSupplierRepository.count).toHaveBeenCalledWith({
        where: { name: 'Supplier 1' },
      });
      expect(mockSupplierRepository.find).toHaveBeenCalledWith({
        where: { name: 'Supplier 1' },
        relations: ['supplierProducts'],
        take: pageSize,
        skip: 0,
        order: undefined,
      });
    });

    it('should apply default pagination when current and pageSize are undefined', async () => {
      const query = {};
      const current = undefined;
      const pageSize = undefined;

      const mockSuppliers = [
        {
          id: 1,
          name: 'Supplier 1',
          phone: '0987654321',
          address: '123 Main St',
          country: 'Viet Nam',
          supplierProducts: [],
        },
      ];

      // Mock trả về giá trị hợp lệ
      mockSupplierRepository.count.mockResolvedValueOnce(1);
      mockSupplierRepository.find.mockResolvedValueOnce(mockSuppliers);

      const result = await service.findAll(query, current, pageSize);

      expect(result).toEqual({
        meta: {
          current: 1,
          pageSize: 10,
          pages: 1,
          total: 1,
        },
        results: mockSuppliers,
      });

      // Kiểm tra mock được gọi đúng với tham số
      expect(mockSupplierRepository.count).toHaveBeenCalledWith({
        where: {},
      });
      expect(mockSupplierRepository.find).toHaveBeenCalledWith({
        where: {},
        relations: ['supplierProducts'],
        take: 10,
        skip: 0,
        order: undefined,
      });
    });

    it('should return empty array when no suppliers match the query', async () => {
      const query = { name: 'NonExistingSupplier' };
      const current = 1;
      const pageSize = 10;

      mockSupplierRepository.count.mockResolvedValue(0);
      mockSupplierRepository.find.mockResolvedValue([]);

      const result = await service.findAll(query, current, pageSize);

      expect(result).toEqual({
        meta: {
          current: 1,
          pageSize: 10,
          pages: 0,
          total: 0,
        },
        results: [],
      });

      expect(mockSupplierRepository.count).toHaveBeenCalledWith({
        where: { name: 'NonExistingSupplier' },
      });
      expect(mockSupplierRepository.find).toHaveBeenCalledWith({
        where: { name: 'NonExistingSupplier' },
        relations: ['supplierProducts'],
        take: 10,
        skip: 0,
        order: undefined,
      });
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      const query = {};
      const current = 1;
      const pageSize = 10;

      mockSupplierRepository.count.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.findAll(query, current, pageSize)).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(mockSupplierRepository.count).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return supplier successfully', async () => {
      const supplier = { id: 1, name: 'Supplier 1' };
      mockSupplierRepository.findOne.mockResolvedValue(supplier);

      const result = await service.findOne(1);

      expect(result).toEqual(supplier);
      expect(mockSupplierRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException if supplier not found', async () => {
      mockSupplierRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on error', async () => {
      mockSupplierRepository.findOne.mockRejectedValue(new Error('DB Error'));

      await expect(service.findOne(1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('remove', () => {
    it('should remove supplier successfully', async () => {
      const supplier = { id: 1, name: 'Supplier 1' };
      mockSupplierRepository.findOne.mockResolvedValue(supplier);

      const result = await service.remove(1);

      expect(result).toEqual(supplier);
      expect(mockSupplierRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockSupplierRepository.softDelete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if supplier not found', async () => {
      mockSupplierRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);

      expect(mockSupplierRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw InternalServerErrorException on error', async () => {
      mockSupplierRepository.findOne.mockRejectedValue(new Error('DB Error'));

      await expect(service.remove(1)).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(mockSupplierRepository.findOne).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update supplier successfully', async () => {
      const updateSupplierDto: UpdateSupplierDto = {
        name: 'Supplier 2',
        phone: '0123456789',
        productUnitIds: [1, 2],
      };

      const existingSupplier = {
        id: 1,
        name: 'Supplier 1',
        phone: '0987654321',
        address: '123 Main St',
        country: 'Viet Nam',
      };

      mockSupplierRepository.findOne
        .mockResolvedValueOnce(existingSupplier)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      mockSupplierProductsService.update.mockResolvedValue([
        { supplierId: 1, productUnitId: 1, status: 1 },
        { supplierId: 1, productUnitId: 2, status: 1 },
      ]);

      mockSupplierRepository.save.mockResolvedValue({
        ...existingSupplier,
        ...updateSupplierDto,
      });

      const result = await service.update(1, updateSupplierDto);

      expect(result).toEqual({
        ...existingSupplier,
        ...updateSupplierDto,
      });

      expect(mockSupplierRepository.findOne).toHaveBeenCalledTimes(3);
      expect(mockSupplierProductsService.update).toHaveBeenCalledWith(1, {
        productUnitIds: [1, 2],
      });
      expect(mockSupplierRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if supplier does not exist', async () => {
      const updateSupplierDto: UpdateSupplierDto = {
        name: 'Supplier 2',
        phone: '0123456789',
        productUnitIds: [1, 2],
      };

      const existingSupplier = {
        id: 1,
        name: 'Supplier 1',
        phone: '0987654321',
        address: '123 Main St',
        country: 'Viet Nam',
      };
      mockSupplierRepository.findOne.mockResolvedValue(null);

      await expect(service.update(1, updateSupplierDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if supplier name already exists', async () => {
      const updateSupplierDto: UpdateSupplierDto = {
        name: 'Supplier 2',
        phone: '0123456789',
        productUnitIds: [1, 2],
      };

      const existingSupplier = {
        id: 1,
        name: 'Supplier 1',
        phone: '0987654321',
        address: '123 Main St',
        country: 'Viet Nam',
      };
      mockSupplierRepository.findOne
        .mockResolvedValueOnce(existingSupplier)
        .mockResolvedValueOnce({ id: 2, name: 'Supplier 2' });

      await expect(service.update(1, updateSupplierDto)).rejects.toThrow(
        ConflictException,
      );

      expect(mockSupplierRepository.findOne).toHaveBeenCalledTimes(2);
    });

    it('should throw ConflictException if supplier phone already exists', async () => {
      const updateSupplierDto: UpdateSupplierDto = {
        name: 'Supplier 2',
        phone: '0123456789',
        productUnitIds: [1, 2],
      };

      const existingSupplier = {
        id: 1,
        name: 'Supplier 1',
        phone: '0987654321',
        address: '123 Main St',
        country: 'Viet Nam',
      };
      mockSupplierRepository.findOne
        .mockResolvedValueOnce(existingSupplier) // Existing supplier
        .mockResolvedValueOnce(null) // No name conflict
        .mockResolvedValueOnce({ id: 3, phone: '0123456789' }); // Conflict phone

      await expect(service.update(1, updateSupplierDto)).rejects.toThrow(
        ConflictException,
      );

      expect(mockSupplierRepository.findOne).toHaveBeenCalledTimes(3);
    });

    it('should throw NotFoundException if product units do not exist', async () => {
      const updateSupplierDto: UpdateSupplierDto = {
        name: 'Supplier 2',
        phone: '0123456789',
        productUnitIds: [1, 2],
      };

      const existingSupplier = {
        id: 1,
        name: 'Supplier 1',
        phone: '0987654321',
        address: '123 Main St',
        country: 'Viet Nam',
      };
      mockSupplierRepository.findOne
        .mockResolvedValueOnce(existingSupplier) // Find supplier by ID
        .mockResolvedValueOnce(null) // No name conflict
        .mockResolvedValueOnce(null); // No phone conflict

      mockSupplierProductsService.update.mockRejectedValue(
        new NotFoundException(),
      );

      await expect(service.update(1, updateSupplierDto)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockSupplierProductsService.update).toHaveBeenCalledWith(1, {
        productUnitIds: [1, 2],
      });
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      const updateSupplierDto: UpdateSupplierDto = {
        name: 'Supplier 2',
        phone: '0123456789',
        productUnitIds: [1, 2],
      };

      const existingSupplier = {
        id: 1,
        name: 'Supplier 1',
        phone: '0987654321',
        address: '123 Main St',
        country: 'Viet Nam',
      };
      mockSupplierRepository.findOne.mockRejectedValue(
        new Error('Unexpected error'),
      );

      await expect(service.update(1, updateSupplierDto)).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(mockSupplierRepository.findOne).toHaveBeenCalled();
    });
  });
});
