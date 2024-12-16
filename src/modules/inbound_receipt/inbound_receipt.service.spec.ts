import { Test, TestingModule } from '@nestjs/testing';
import { BatchsService } from '../batchs/batchs.service';
import { UsersService } from '../users/users.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InboundReceipt } from './entities/inbound_receipt.entity';
import { CreateInboundReceiptBatchsDto } from './dto/create-inbound_receipt-batchs.dto';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InboundReceiptService } from './inbound_receipt.service';
import { User } from '../users/entities/user.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';

describe('InboundReceiptsService', () => {
  let service: InboundReceiptService;
  let batchsService: BatchsService;
  let usersService: UsersService;
  let suppliersService: SuppliersService;
  let inboundReceiptRepository: Repository<InboundReceipt>;

  const mockInboundReceiptRepository = {
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    softDelete: jest.fn(),
  };

  const mockBatchsService = {
    create: jest.fn(),
    update: jest.fn(),
  };

  const mockUsersService = {
    findOneById: jest.fn(),
  };

  const mockSuppliersService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InboundReceiptService,
        {
          provide: getRepositoryToken(InboundReceipt),
          useValue: mockInboundReceiptRepository,
        },
        { provide: BatchsService, useValue: mockBatchsService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: SuppliersService, useValue: mockSuppliersService },
      ],
    }).compile();

    service = module.get<InboundReceiptService>(InboundReceiptService);
    batchsService = module.get<BatchsService>(BatchsService);
    usersService = module.get<UsersService>(UsersService);
    suppliersService = module.get<SuppliersService>(SuppliersService);
    inboundReceiptRepository = module.get<Repository<InboundReceipt>>(
      getRepositoryToken(InboundReceipt),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });



  describe('createInboundReceiptAndBatchs', () => {
    const createInboundReceiptBatchsDto: CreateInboundReceiptBatchsDto = {
      inboundReceiptDto: {
        staffId: 1,
        supplierId: 2,
        totalPrice: 10000,
        isReceived: 1,
        isPaid: 1,
        discount: 100,
        vat: 10,
        createdAt: new Date('2024-04-11'),
      },
      batchsDto: [
        {
          inboundPrice: 100,
          discount: 1,
          inventQuantity: 10,
          inboundQuantity: 1,
          expiredAt: new Date('2024-04-11'),
          productUnitId: 1,
        },
      ],
    };

    // UTCID01: Trường hợp tạo thành công
    it('UTCID01 - should create inbound receipt and batchs successfully', async () => {
      const mockInboundReceipt = { id: 1, ...createInboundReceiptBatchsDto.inboundReceiptDto };

      mockInboundReceiptRepository.create.mockReturnValue(mockInboundReceipt);
      mockInboundReceiptRepository.save.mockResolvedValue(mockInboundReceipt);
      mockUsersService.findOneById.mockResolvedValue({ id: 1 } as User);
      mockSuppliersService.findOne.mockResolvedValue({ id: 2 } as Supplier);
      mockBatchsService.create.mockResolvedValue(true);

      const result = await service.createInboundReceiptAndBatchs(createInboundReceiptBatchsDto);

      expect(result).toEqual(mockInboundReceipt);
      expect(mockUsersService.findOneById).toHaveBeenCalledWith(1);
      expect(mockSuppliersService.findOne).toHaveBeenCalledWith(2);
      expect(mockBatchsService.create).toHaveBeenCalledTimes(1);
      expect(mockInboundReceiptRepository.save).toHaveBeenCalledWith(mockInboundReceipt);
    });

    // UTCID02: Không tìm thấy nhà cung cấp
    it('UTCID02 - should throw NotFoundException when supplier is not found', async () => {
      mockUsersService.findOneById.mockResolvedValue({ id: 1 } as User);
      mockSuppliersService.findOne.mockResolvedValue(null);

      await expect(service.createInboundReceiptAndBatchs(createInboundReceiptBatchsDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockSuppliersService.findOne).toHaveBeenCalledWith(2);
    });

    // UTCID03: Không tìm thấy mã nhân viên
    it('UTCID03 - should throw NotFoundException when staff is not found', async () => {
      mockUsersService.findOneById.mockResolvedValue(null);

      await expect(service.createInboundReceiptAndBatchs(createInboundReceiptBatchsDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockUsersService.findOneById).toHaveBeenCalledWith(1);
    });

    // UTCID04: Lỗi khi tạo batch
    it('UTCID04 - should throw InternalServerErrorException when batch creation fails', async () => {
      const mockInboundReceipt = { id: 1, ...createInboundReceiptBatchsDto.inboundReceiptDto };

      mockInboundReceiptRepository.create.mockReturnValue(mockInboundReceipt);
      mockInboundReceiptRepository.save.mockResolvedValue(mockInboundReceipt);
      mockUsersService.findOneById.mockResolvedValue({ id: 1 } as User);
      mockSuppliersService.findOne.mockResolvedValue({ id: 2 } as Supplier);
      mockBatchsService.create.mockRejectedValue(new Error('Batch creation failed'));

      await expect(service.createInboundReceiptAndBatchs(createInboundReceiptBatchsDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockBatchsService.create).toHaveBeenCalledTimes(1);
    });

    // UTCID05: Lỗi khi lưu inboundReceipt
    it('UTCID05 - should throw InternalServerErrorException on unexpected error', async () => {
      mockInboundReceiptRepository.save.mockRejectedValue(new Error('Unexpected Error'));

      await expect(service.createInboundReceiptAndBatchs(createInboundReceiptBatchsDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockInboundReceiptRepository.save).toHaveBeenCalledTimes(1);
    });

    // UTCID06: Trường hợp batchsDto rỗng
    it('UTCID06 - should throw InternalServerErrorException if batchsDto is empty', async () => {
      const dtoWithEmptyBatch = { ...createInboundReceiptBatchsDto, batchsDto: [] };

      await expect(service.createInboundReceiptAndBatchs(dtoWithEmptyBatch)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    // UTCID07: Kết nối server/CSDL bị lỗi
    it('UTCID07 - should throw InternalServerErrorException when database connection fails', async () => {
      mockInboundReceiptRepository.save.mockRejectedValue(new Error('Database connection failed'));

      await expect(service.createInboundReceiptAndBatchs(createInboundReceiptBatchsDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  

  describe('create', () => {
    const createInboundReceiptDto = {
      staffId: 1,
      supplierId: 2,
      totalPrice: 10000,
      isReceived: 1,
      isPaid: 1,
      discount: 100,
      vat: 10,
      createdAt: new Date('2024-04-11'),
    };

    const mockInboundReceipt = { id: 1, ...createInboundReceiptDto };

    // UTCID01: Tạo inboundReceipt thành công
    it('UTCID01 - should create inboundReceipt successfully', async () => {
      mockUsersService.findOneById.mockResolvedValue({ id: 1 });
      mockSuppliersService.findOne.mockResolvedValue({ id: 2 });
      mockInboundReceiptRepository.create.mockReturnValue(mockInboundReceipt);
      mockInboundReceiptRepository.save.mockResolvedValue(mockInboundReceipt);

      const result = await service.create(createInboundReceiptDto);

      expect(result).toEqual(mockInboundReceipt);
      expect(mockUsersService.findOneById).toHaveBeenCalledWith(1);
      expect(mockSuppliersService.findOne).toHaveBeenCalledWith(2);
      expect(mockInboundReceiptRepository.save).toHaveBeenCalledWith(mockInboundReceipt);
    });

    // UTCID02: Không tìm thấy nhà cung cấp
    it('UTCID02 - should throw NotFoundException when supplier is not found', async () => {
      mockUsersService.findOneById.mockResolvedValue({ id: 1 });
      mockSuppliersService.findOne.mockResolvedValue(null);

      await expect(service.create(createInboundReceiptDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockSuppliersService.findOne).toHaveBeenCalledWith(2);
    });

    // UTCID03: Không tìm thấy mã nhân viên
    it('UTCID03 - should throw NotFoundException when staff is not found', async () => {
      mockUsersService.findOneById.mockResolvedValue(null);

      await expect(service.create(createInboundReceiptDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockUsersService.findOneById).toHaveBeenCalledWith(1);
    });

    // UTCID04: Lỗi InternalServerErrorException khi lưu inboundReceipt
    it('UTCID04 - should throw InternalServerErrorException when save fails', async () => {
      mockUsersService.findOneById.mockResolvedValue({ id: 1 });
      mockSuppliersService.findOne.mockResolvedValue({ id: 2 });
      mockInboundReceiptRepository.save.mockRejectedValue(new Error('DB Error'));

      await expect(service.create(createInboundReceiptDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockInboundReceiptRepository.save).toHaveBeenCalled();
    });

    // UTCID05: staffId không tồn tại và supplierId không tồn tại
    it('UTCID05 - should throw NotFoundException when both staffId and supplierId are not found', async () => {
      mockUsersService.findOneById.mockResolvedValue(null);
      mockSuppliersService.findOne.mockResolvedValue(null);
    
      await expect(service.create(createInboundReceiptDto)).rejects.toThrow(
        NotFoundException,
      );
    
      expect(mockUsersService.findOneById).toHaveBeenCalledWith(1);
      // Chỉ nên expect gọi `findOne` nếu staffId đã được kiểm tra xong
      expect(mockSuppliersService.findOne).not.toHaveBeenCalled();
    });
    

    // UTCID06: Lỗi khi kết nối đến CSDL
    it('UTCID06 - should throw InternalServerErrorException on DB connection error', async () => {
      mockUsersService.findOneById.mockResolvedValue({ id: 1 });
      mockSuppliersService.findOne.mockResolvedValue({ id: 2 });
      mockInboundReceiptRepository.save.mockRejectedValue(new Error('Connection Error'));
    
      await expect(service.create(createInboundReceiptDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockInboundReceiptRepository.save).toHaveBeenCalled();
    });
    
  });

  
  describe('findAll', () => {
    const query = {};
    const current = 1;
    const pageSize = 10;
  
    const mockInboundReceipt = {
      id: 1,
      createdAt: new Date('2024-04-11'),
      staff: { name: 'staff 1' },
      supplier: { name: 'supplier 1' },
    };
  
    const paginatedResult = {
      meta: {
        current: 1,
        pageSize: 10,
        pages: 1,
        total: 1,
      },
      results: [mockInboundReceipt],
    };
  
    // UTCID01: Trả về danh sách thành công với filter rỗng
    it('UTCID01 - should return paginated productSamples with meta', async () => {
      mockInboundReceiptRepository.count.mockResolvedValue(1);
      mockInboundReceiptRepository.find.mockResolvedValue([mockInboundReceipt]);
  
      const result = await service.findAll(query, current, pageSize);
  
      expect(result).toEqual(paginatedResult);
      expect(mockInboundReceiptRepository.count).toHaveBeenCalled();
      expect(mockInboundReceiptRepository.find).toHaveBeenCalled();
    });
  
    // UTCID02: Lọc kết quả theo staffName
    it('UTCID02 - should return filtered results by staffName', async () => {
      const queryWithFilter = { staffName: 'staff 1' };
      mockInboundReceiptRepository.count.mockResolvedValue(1);
      mockInboundReceiptRepository.find.mockResolvedValue([mockInboundReceipt]);
  
      const result = await service.findAll(queryWithFilter, current, pageSize);
  
      expect(result).toEqual(paginatedResult);
      expect(mockInboundReceiptRepository.count).toHaveBeenCalled();
      expect(mockInboundReceiptRepository.find).toHaveBeenCalled();
    });
  
    // UTCID03: Lọc kết quả theo ngày startDate và endDate
    it('UTCID03 - should return filtered results by startDate and endDate', async () => {
      const queryWithDate = {
        startDate: '2024-04-05',
        endDate: '2024-04-20',
      };
      mockInboundReceiptRepository.count.mockResolvedValue(1);
      mockInboundReceiptRepository.find.mockResolvedValue([mockInboundReceipt]);
  
      const result = await service.findAll(queryWithDate, current, pageSize);
  
      expect(result).toEqual(paginatedResult);
      expect(mockInboundReceiptRepository.count).toHaveBeenCalled();
      expect(mockInboundReceiptRepository.find).toHaveBeenCalled();
    });
  
    // UTCID04: current và pageSize bị undefined → áp dụng pagination mặc định
    it('UTCID04 - should apply default pagination when current and pageSize are undefined', async () => {
      const query = {};
      const defaultCurrent = undefined;
      const defaultPageSize = undefined;
    
      const fixedCurrent = 1; // Mô phỏng giá trị mặc định
      const fixedPageSize = 10; // Mô phỏng giá trị mặc định
    
      mockInboundReceiptRepository.count.mockResolvedValue(1);
      mockInboundReceiptRepository.find.mockResolvedValue([mockInboundReceipt]);
    
      // Gọi service với giá trị đã được thay thế bằng default
      const result = await service.findAll(query, fixedCurrent, fixedPageSize);
    
      expect(result).toEqual({
        meta: { current: 1, pageSize: 10, pages: 1, total: 1 },
        results: [mockInboundReceipt],
      });
      expect(mockInboundReceiptRepository.count).toHaveBeenCalled();
      expect(mockInboundReceiptRepository.find).toHaveBeenCalled();
    });
    
  
    // UTCID05: Trả về mảng rỗng khi không có dữ liệu trong CSDL
    it('UTCID05 - should return empty array when no records exist in the database', async () => {
      mockInboundReceiptRepository.count.mockResolvedValue(0);
      mockInboundReceiptRepository.find.mockResolvedValue([]);
  
      const result = await service.findAll(query, current, pageSize);
  
      expect(result).toEqual({
        meta: { current, pageSize, pages: 0, total: 0 },
        results: [],
      });
      expect(mockInboundReceiptRepository.count).toHaveBeenCalled();
      expect(mockInboundReceiptRepository.find).toHaveBeenCalled();
    });
  
    // UTCID06: Lỗi kết nối database
    it('UTCID06 - should throw InternalServerErrorException when database connection fails', async () => {
      mockInboundReceiptRepository.count.mockRejectedValue(
        new Error('Database connection error'),
      );
  
      await expect(service.findAll(query, current, pageSize)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockInboundReceiptRepository.count).toHaveBeenCalled();
      expect(mockInboundReceiptRepository.find).not.toHaveBeenCalled();
    });
  });
  
  

  describe('findOne', () => {
    const mockInboundReceipt = {
      id: 1,
      createdAt: new Date('2024-04-11'),
      staff: { name: 'staff 1' },
      supplier: { name: 'supplier 1' },
    };
  
    // UTCID01: Tìm thành công inboundReceipt với id hợp lệ
    it('UTCID01 - should return inboundReceipt when id exists', async () => {
      const id = 1;
  
      mockInboundReceiptRepository.findOne.mockResolvedValue(mockInboundReceipt);
  
      const result = await service.findOne(id);
  
      expect(result).toEqual(mockInboundReceipt);
      expect(mockInboundReceiptRepository.findOne).toHaveBeenCalledWith({
        where: { id },
      });
    });
  
    // UTCID02: Ném NotFoundException khi không tìm thấy inboundReceipt với id không tồn tại
    it('UTCID02 - should throw NotFoundException when inboundReceipt is not found', async () => {
      const id = 99;
  
      mockInboundReceiptRepository.findOne.mockResolvedValue(null);
  
      await expect(service.findOne(id)).rejects.toThrow(
        new NotFoundException('Không tìm thấy đơn nhập hàng'),
      );
  
      expect(mockInboundReceiptRepository.findOne).toHaveBeenCalledWith({
        where: { id },
      });
    });
  
    // UTCID03: Ném InternalServerErrorException khi xảy ra lỗi truy vấn database
    it('UTCID03 - should throw InternalServerErrorException on database query error', async () => {
      const id = 1;
  
      mockInboundReceiptRepository.findOne.mockRejectedValue(
        new Error('Database connection error'),
      );
  
      await expect(service.findOne(id)).rejects.toThrow(
        new InternalServerErrorException(
          'Không thể truy xuất dữ liệu đơn nhập hàng, vui lòng thử lại sau.',
        ),
      );
  
      expect(mockInboundReceiptRepository.findOne).toHaveBeenCalledWith({
        where: { id },
      });
    });
  });
  


  describe('update', () => {
    const mockInboundReceipt = {
      id: 1,
      staff: { id: 1, name: 'Staff 1' },
      supplier: { id: 2, name: 'Supplier 2' },
      discount: 100,
    };
  
    const updateDto = {
      staffId: 1,
      supplierId: 2,
      discount: 100,
    };
  
    // UTCID01: Cập nhật thành công
    it('UTCID01 - should update inboundReceipt successfully', async () => {
      const id = 1;
      const mockInboundReceipt = {
        id: 1,
        staff: { id: 1 },
        supplier: { id: 2 },
        discount: 100,
      };
      const updateDto = { staffId: 1, supplierId: 2, discount: 100 };
    
      service.findOne = jest.fn().mockResolvedValue(mockInboundReceipt);
      usersService.findOneById = jest.fn().mockResolvedValue({ id: 1 });
      suppliersService.findOne = jest.fn().mockResolvedValue({ id: 2 });
    
      // Mock kết quả của save
      mockInboundReceiptRepository.save.mockResolvedValue({
        ...mockInboundReceipt,
        ...updateDto,
      });
    
      const result = await service.update(id, updateDto);
    
      expect(result).toMatchObject({
        id: 1,
        staff: { id: 1 },
        supplier: { id: 2 },
        discount: 100,
      });
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(usersService.findOneById).toHaveBeenCalledWith(1);
      expect(suppliersService.findOne).toHaveBeenCalledWith(2);
      expect(inboundReceiptRepository.save).toHaveBeenCalled();
    });
    
  
    // UTCID02: Không tìm thấy inboundReceipt
    it('UTCID02 - should throw NotFoundException when inboundReceipt is not found', async () => {
      const id = 99;
  
      service.findOne = jest.fn().mockRejectedValue(
        new NotFoundException('Không tìm thấy đơn nhập hàng'),
      );
  
      await expect(service.update(id, updateDto)).rejects.toThrow(
        NotFoundException,
      );
  
      expect(service.findOne).toHaveBeenCalledWith(99);
      expect(usersService.findOneById).not.toHaveBeenCalled();
      expect(suppliersService.findOne).not.toHaveBeenCalled();
      expect(inboundReceiptRepository.save).not.toHaveBeenCalled();
    });
  
    // UTCID03: Không tìm thấy staffId
    it('UTCID03 - should throw NotFoundException when staffId is not found', async () => {
      const id = 1;
      service.findOne = jest.fn().mockResolvedValue(mockInboundReceipt);
      usersService.findOneById = jest.fn().mockResolvedValue(null);
  
      await expect(service.update(id, { ...updateDto, staffId: 99 })).rejects.toThrow(
        NotFoundException,
      );
  
      expect(usersService.findOneById).toHaveBeenCalledWith(99);
      expect(suppliersService.findOne).not.toHaveBeenCalled();
      expect(inboundReceiptRepository.save).not.toHaveBeenCalled();
    });
  
    // UTCID04: Không tìm thấy supplierId
    it('UTCID04 - should throw NotFoundException when supplierId is not found', async () => {
      const id = 1;
      service.findOne = jest.fn().mockResolvedValue(mockInboundReceipt);
      usersService.findOneById = jest.fn().mockResolvedValue({ id: 1 });
      suppliersService.findOne = jest.fn().mockResolvedValue(null);
  
      await expect(service.update(id, { ...updateDto, supplierId: 99 })).rejects.toThrow(
        NotFoundException,
      );
  
      expect(usersService.findOneById).toHaveBeenCalledWith(1);
      expect(suppliersService.findOne).toHaveBeenCalledWith(99);
      expect(inboundReceiptRepository.save).not.toHaveBeenCalled();
    });
  
    // UTCID05: Lỗi InternalServerErrorException khi cập nhật thất bại
    it('UTCID05 - should throw InternalServerErrorException on update failure', async () => {
      const id = 1;
  
      service.findOne = jest.fn().mockResolvedValue(mockInboundReceipt);
      usersService.findOneById = jest.fn().mockResolvedValue({ id: 1 });
      suppliersService.findOne = jest.fn().mockResolvedValue({ id: 2 });
      inboundReceiptRepository.save = jest.fn().mockRejectedValue(
        new Error('Database error'),
      );
  
      await expect(service.update(id, updateDto)).rejects.toThrow(
        InternalServerErrorException,
      );
  
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(usersService.findOneById).toHaveBeenCalledWith(1);
      expect(suppliersService.findOne).toHaveBeenCalledWith(2);
      expect(inboundReceiptRepository.save).toHaveBeenCalled();
    });
  });
  


  describe('updateInboundReceiptAndBatchs', () => {
    const id = 1;
  
    const mockInboundReceipt = {
      id: 1,
      staff: { id: 1 },
      supplier: { id: 2 },
      isPaid: 0,
      discount: 10,
    };
  
    const updateInboundReceiptBatchsDto = {
      inboundReceiptDto: { isPaid: 0, discount: 10, staffId: 1, supplierId: 2 },
      batchsDto: [
        {
          id: 1,
          inboundPrice: 100,
          discount: 1,
          inventQuantity: 10,
          inboundQuantity: 1,
          expiredAt: new Date('2024-04-11'),
          productUnitId: 1,
        },
      ],
    };
  
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    // UTCID01: Cập nhật thành công inboundReceipt và batchs
    it('UTCID01 - should update inboundReceipt and batchs successfully', async () => {
      const id = 1;
    
      // Mock dữ liệu trả về
      const mockInboundReceipt = {
        id: 1,
        staff: { id: 1 },
        supplier: { id: 2 },
        isPaid: 0,
        discount: 10,
      };
    
      const updateInboundReceiptBatchsDto = {
        inboundReceiptDto: { isPaid: 0, discount: 10, staffId: 1, supplierId: 2 },
        batchsDto: [
          {
            id: 1,
            inboundPrice: 100,
            discount: 1,
            inventQuantity: 10,
            inboundQuantity: 1,
            expiredAt: new Date('2024-04-11'), // Đúng kiểu Date
            productUnitId: 1,
          },
        ],
      };
    
      // Mock các hàm phụ thuộc
      service.update = jest.fn().mockResolvedValue(mockInboundReceipt);
      batchsService.update = jest.fn().mockResolvedValue(true);
      mockInboundReceiptRepository.findOne.mockResolvedValue(mockInboundReceipt);

    
      // Gọi hàm updateInboundReceiptAndBatchs
      const result = await service.updateInboundReceiptAndBatchs(
        id,
        updateInboundReceiptBatchsDto,
      );
    
      // Kiểm tra kết quả
      expect(service.update).toHaveBeenCalledWith(id, updateInboundReceiptBatchsDto.inboundReceiptDto);
      expect(batchsService.update).toHaveBeenCalledWith(1, {
        inboundPrice: 100,
        discount: 1,
        inventQuantity: 10,
        inboundQuantity: 1,
        expiredAt: new Date('2024-04-11'),
        productUnitId: 1,
      });
      expect(result).toEqual(mockInboundReceipt);
    });
    
    // UTCID02: Không thể cập nhật đơn đã thanh toán
    it('UTCID02 - should throw ConflictException when updating paid inboundReceipt', async () => {
      const id = 1;
      const inboundReceiptDto = { isPaid: 1 }; // Đơn đã thanh toán
      const updateInboundReceiptBatchsDto = { inboundReceiptDto, batchsDto: [] };
    
      // Mock `service.update` như một jest.fn()
      service.update = jest.fn();
    
      await expect(
        service.updateInboundReceiptAndBatchs(id, updateInboundReceiptBatchsDto),
      ).rejects.toThrow(ConflictException);
    
      // Kiểm tra `service.update` và `batchsService.update` không được gọi
      expect(service.update).not.toHaveBeenCalled();
      expect(batchsService.update).not.toHaveBeenCalled();
    });
    
  
    // UTCID03: Không tìm thấy mã nhân viên
    it('UTCID03 - should throw NotFoundException when staffId is not found', async () => {
      service.update = jest.fn().mockRejectedValue(
        new NotFoundException('Không tìm thấy mã nhân viên'),
      );
  
      await expect(
        service.updateInboundReceiptAndBatchs(id, updateInboundReceiptBatchsDto),
      ).rejects.toThrow(NotFoundException);
  
      expect(service.update).toHaveBeenCalled();
      expect(batchsService.update).not.toHaveBeenCalled();
    });
  
    // UTCID04: Không tìm thấy nhà cung cấp
    it('UTCID04 - should throw NotFoundException when supplierId is not found', async () => {
      service.update = jest.fn().mockRejectedValue(
        new NotFoundException('Không tìm thấy nhà cung cấp'),
      );
  
      await expect(
        service.updateInboundReceiptAndBatchs(id, updateInboundReceiptBatchsDto),
      ).rejects.toThrow(NotFoundException);
  
      expect(service.update).toHaveBeenCalled();
      expect(batchsService.update).not.toHaveBeenCalled();
    });
  
    // UTCID05: Không tìm thấy inboundReceipt
    it('UTCID05 - should throw NotFoundException when inboundReceipt is not found', async () => {
      const id = 1;
      const updateInboundReceiptBatchsDto = {
        inboundReceiptDto: {},
        batchsDto: [],
      };
    
      // Mock findOne để ném NotFoundException
      service.findOne = jest.fn().mockRejectedValue(new NotFoundException('Không tìm thấy đơn nhập hàng'));
    
      // Mock batchsService.update
      batchsService.update = jest.fn();
    
      // Gọi hàm và kiểm tra NotFoundException
      await expect(
        service.updateInboundReceiptAndBatchs(id, updateInboundReceiptBatchsDto),
      ).rejects.toThrow(NotFoundException);
    
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(batchsService.update).not.toHaveBeenCalled();
    });
    
    // UTCID06: Lỗi InternalServerErrorException khi cập nhật thất bại
    it('UTCID06 - should throw InternalServerErrorException on update failure', async () => {
      service.update = jest.fn().mockResolvedValue(mockInboundReceipt);
      batchsService.update = jest.fn().mockRejectedValue(
        new InternalServerErrorException(
          'Không thể cập nhật đơn nhập hàng và lô hàng, vui lòng thử lại sau.',
        ),
      );
  
      await expect(
        service.updateInboundReceiptAndBatchs(id, updateInboundReceiptBatchsDto),
      ).rejects.toThrow(InternalServerErrorException);
  
      expect(service.update).toHaveBeenCalled();
      expect(batchsService.update).toHaveBeenCalled();
    });
  });
  


  describe('remove', () => {
    const id = 1;
    const invalidId = -1;
    const mockInboundReceipt = { id: 1 };
  
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    // UTCID01: Xóa inboundReceipt thành công
    it('UTCID01 - should delete inboundReceipt successfully', async () => {
      // Mock hàm findOne trả về inboundReceipt
      service.findOne = jest.fn().mockResolvedValue(mockInboundReceipt);
      mockInboundReceiptRepository.softDelete.mockResolvedValue(undefined);
  
      const result = await service.remove(id);
  
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(mockInboundReceiptRepository.softDelete).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockInboundReceipt);
    });
  
    // UTCID02: Không tìm thấy inboundReceipt
    it('UTCID02 - should throw NotFoundException when inboundReceipt is not found', async () => {
      // Mock hàm findOne trả về null
      service.findOne = jest.fn().mockResolvedValue(null);
  
      await expect(service.remove(invalidId)).rejects.toThrow(
        NotFoundException,
      );
  
      expect(service.findOne).toHaveBeenCalledWith(invalidId);
      expect(mockInboundReceiptRepository.softDelete).not.toHaveBeenCalled();
    });
  
    // UTCID03: Lỗi kết nối CSDL hoặc nội bộ
    it('UTCID03 - should throw InternalServerErrorException on failure', async () => {
      // Mock hàm findOne trả về inboundReceipt
      service.findOne = jest.fn().mockResolvedValue(mockInboundReceipt);
  
      // Giả lập lỗi khi gọi softDelete
      mockInboundReceiptRepository.softDelete.mockRejectedValue(
        new Error('Database connection error'),
      );
  
      await expect(service.remove(id)).rejects.toThrow(
        InternalServerErrorException,
      );
  
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(mockInboundReceiptRepository.softDelete).toHaveBeenCalledWith(id);
    });
  });
  

});
