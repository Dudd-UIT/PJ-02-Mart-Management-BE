import { Test, TestingModule } from '@nestjs/testing';
import { SupplierProductsService } from './supplier_products.service';
import { Repository } from 'typeorm';
import { SupplierProduct } from './entities/supplier_product.entity';
import { ProductUnitsService } from '../product_units/product_units.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('update', () => {
  let service: SupplierProductsService;
  let supplierProductRepository: Repository<SupplierProduct>;
  let productUnitsService: ProductUnitsService;
  let suppliersService: SuppliersService;

  const mockSupplierProductRepository = {
    update: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockProductUnitsService = {
    findOne: jest.fn(),
  };

  const mockSuppliersService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupplierProductsService,
        {
          provide: getRepositoryToken(SupplierProduct),
          useValue: mockSupplierProductRepository,
        },
        {
          provide: ProductUnitsService,
          useValue: mockProductUnitsService,
        },
        {
          provide: SuppliersService,
          useValue: mockSuppliersService,
        },
      ],
    }).compile();

    service = module.get<SupplierProductsService>(SupplierProductsService);
    supplierProductRepository = module.get<Repository<SupplierProduct>>(
      getRepositoryToken(SupplierProduct),
    );
    productUnitsService = module.get<ProductUnitsService>(ProductUnitsService);
    suppliersService = module.get<SuppliersService>(SuppliersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /** Test Case 1: Normal - Update thành công */
  it('should update supplier products successfully', async () => {
    const supplierId = 1;
    const updateDto = { productUnitIds: [1, 2, 3] };

    mockSuppliersService.findOne.mockResolvedValue({ id: 1 });
    mockProductUnitsService.findOne.mockResolvedValue({ id: 1 }); // Product exists
    mockSupplierProductRepository.findOne.mockResolvedValue(null); // No existing product
    mockSupplierProductRepository.save.mockResolvedValue('saved');

    const result = await service.update(supplierId, updateDto);

    expect(result).toEqual(expect.any(Array));
    expect(suppliersService.findOne).toHaveBeenCalledWith(supplierId);
    expect(productUnitsService.findOne).toHaveBeenCalledTimes(3);
    expect(supplierProductRepository.update).toHaveBeenCalledWith(
      { supplierId },
      { status: 0 },
    );
    expect(supplierProductRepository.save).toHaveBeenCalled();
  });

  /** Test Case 2: Abnormal - SupplierId không tồn tại */
  it('should throw NotFoundException if supplier is not found', async () => {
    const supplierId = 999;
    const updateDto = { productUnitIds: [1, 2] };

    mockSuppliersService.findOne.mockResolvedValue(null);

    await expect(service.update(supplierId, updateDto)).rejects.toThrow(
      NotFoundException,
    );
    expect(suppliersService.findOne).toHaveBeenCalledWith(supplierId);
  });

  /** Test Case 3: Abnormal - productUnitIds chứa ID không tồn tại */
  it('should throw NotFoundException if any product unit is not found', async () => {
    const supplierId = 1;
    const updateDto = { productUnitIds: [1, -1] };

    mockSuppliersService.findOne.mockResolvedValue({ id: 1 });
    mockProductUnitsService.findOne
      .mockResolvedValueOnce({ id: 1 })
      .mockResolvedValueOnce(null); // ProductUnit ID -1 không tồn tại

    await expect(service.update(supplierId, updateDto)).rejects.toThrow(
      NotFoundException,
    );

    expect(productUnitsService.findOne).toHaveBeenCalledWith(-1);
  });

  /** Test Case 4: Boundary - productUnitIds rỗng */
  it('should handle empty productUnitIds without error', async () => {
    const supplierId = 1;
    const updateDto = { productUnitIds: [] };

    mockSuppliersService.findOne.mockResolvedValue({ id: 1 });
    mockSupplierProductRepository.update.mockResolvedValue(undefined);
    mockSupplierProductRepository.save.mockResolvedValue([]);

    const result = await service.update(supplierId, updateDto);

    expect(result).toEqual([]); // Kết quả là một mảng rỗng
    expect(suppliersService.findOne).toHaveBeenCalledWith(supplierId);
    expect(supplierProductRepository.update).toHaveBeenCalledWith(
      { supplierId },
      { status: 0 },
    );

    // Kiểm tra `save` được gọi với mảng rỗng
    expect(supplierProductRepository.save).toHaveBeenCalledWith([]);
  });
});

describe('findAll', () => {
  let service: SupplierProductsService;
  let supplierProductRepository: Repository<SupplierProduct>;

  const mockSupplierProductRepository = {
    count: jest.fn(),
    find: jest.fn(),
  };
  const mockProductUnitsService = {
    findOne: jest.fn(), // Mock đơn giản cho ProductUnitsService
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupplierProductsService,
        {
          provide: getRepositoryToken(SupplierProduct),
          useValue: mockSupplierProductRepository, // Mock repository
        },
        {
          provide: ProductUnitsService,
          useValue: mockProductUnitsService, // Mock service
        },
        {
          provide: SuppliersService,
          useValue: {}, // Mock SuppliersService cho đầy đủ dependency
        },
      ],
    }).compile();

    service = module.get<SupplierProductsService>(SupplierProductsService);
    supplierProductRepository = module.get<Repository<SupplierProduct>>(
      getRepositoryToken(SupplierProduct),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /** Test Case 1: Normal - Có dữ liệu (5 records) */
  it('should return paginated supplierProducts with 5 records', async () => {
    const query = '{}';
    const current = 1;
    const pageSize = 10;

    const mockData = Array(5).fill({
      id: 1,
      productUnit: { id: 1 },
      status: 1,
    });

    mockSupplierProductRepository.count.mockResolvedValue(5);
    mockSupplierProductRepository.find.mockResolvedValue(mockData);

    const result = await service.findAll(query, current, pageSize);

    expect(result.meta.total).toBe(5);
    expect(result.results).toHaveLength(5);
  });

  /** Test Case 2: Normal - Không có dữ liệu */
  it('should return empty array when no data exists', async () => {
    const query = '{}';
    const current = 1;
    const pageSize = 10;

    mockSupplierProductRepository.count.mockResolvedValue(0);
    mockSupplierProductRepository.find.mockResolvedValue([]);

    const result = await service.findAll(query, current, pageSize);

    expect(result.meta.total).toBe(0);
    expect(result.results).toEqual([]);
  });

  /** Test Case 3: Normal - query = {}, current = 1, pageSize = 10 */
  it('should handle query with default pagination', async () => {
    const query = '{}';
    const current = 1;
    const pageSize = 10;

    const mockData = [{ id: 1, status: 1 }];
    mockSupplierProductRepository.count.mockResolvedValue(1);
    mockSupplierProductRepository.find.mockResolvedValue(mockData);

    const result = await service.findAll(query, current, pageSize);

    expect(result.meta.current).toBe(1);
    expect(result.meta.pageSize).toBe(10);
    expect(result.results).toHaveLength(1);
  });

  /** Test Case 4: Normal - query with filter productUnit.id */
  it('should filter data with productUnit.id and pagination', async () => {
    const query = '{ productUnit: { id: 1 } }';
    const current = 2;
    const pageSize = 2;

    const mockData = [
      { id: 3, productUnit: { id: 1 }, status: 1 },
      { id: 4, productUnit: { id: 1 }, status: 1 },
    ];
    mockSupplierProductRepository.count.mockResolvedValue(4);
    mockSupplierProductRepository.find.mockResolvedValue(mockData);

    const result = await service.findAll(query, current, pageSize);

    expect(result.meta.current).toBe(2);
    expect(result.meta.pageSize).toBe(2);
    expect(result.results).toHaveLength(2);
  });

  /** Test Case 5: Boundary - current and pageSize are null */
  it('should handle null current and pageSize with default values', async () => {
    const query = '{}';
    const current = null;
    const pageSize = null;

    const mockData = [{ id: 1 }];
    mockSupplierProductRepository.count.mockResolvedValue(1);
    mockSupplierProductRepository.find.mockResolvedValue(mockData);

    const result = await service.findAll(query, current, pageSize);

    expect(result.meta.current).toBe(1);
    expect(result.meta.pageSize).toBe(10);
    expect(result.results).toHaveLength(1);
  });

  /** Test Case 6: Abnormal - Lỗi kết nối CSDL */
  it('should throw InternalServerErrorException on database error', async () => {
    const query = '{}';
    const current = 1;
    const pageSize = 10;

    mockSupplierProductRepository.count.mockRejectedValue(
      new Error('Database error'),
    );

    await expect(service.findAll(query, current, pageSize)).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  /** Test Case 7: Abnormal - Exception không xác định */
  it('should throw InternalServerErrorException on unexpected exception', async () => {
    const query = '{}';
    const current = 1;
    const pageSize = 10;

    mockSupplierProductRepository.count.mockImplementation(() => {
      throw new Error('Unexpected exception');
    });

    await expect(service.findAll(query, current, pageSize)).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});
