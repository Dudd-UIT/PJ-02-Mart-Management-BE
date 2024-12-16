import { Test, TestingModule } from '@nestjs/testing';
import { ProductTypesService } from './product_types.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { ProductType } from './entities/product_type.entity';
import {
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateProductTypeDto } from './dto/create-product_type.dto';
import { UpdateProductTypeDto } from './dto/update-product_type.dto';

describe('ProductTypesService', () => {
  let service: ProductTypesService;
  let repository: Repository<ProductType>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    softDelete: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductTypesService,
        {
          provide: getRepositoryToken(ProductType),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductTypesService>(ProductTypesService);
    repository = module.get<Repository<ProductType>>(
      getRepositoryToken(ProductType),
    );
    
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  // it('should be defined', () => {
  //   expect(service).toBeDefined();
  // });

  // describe('create', () => {
  //   const mockCreateProductTypeDto: CreateProductTypeDto = {
  //     name: 'Type A',
  //   };

  //   it('should create a product type successfully (UTCID01)', async () => {
  //     const mockProductType = { ...mockCreateProductTypeDto, id: 1 };
  //     mockRepository.findOne.mockResolvedValue(null);
  //     mockRepository.create.mockReturnValue(mockProductType);
  //     mockRepository.save.mockResolvedValue(mockProductType);

  //     const result = await service.create(mockCreateProductTypeDto);
  //     expect(result).toEqual(mockProductType);
  //     expect(mockRepository.findOne).toHaveBeenCalledWith({
  //       where: { name: mockCreateProductTypeDto.name },
  //     });
  //     expect(mockRepository.create).toHaveBeenCalledWith(
  //       mockCreateProductTypeDto,
  //     );
  //   });

  //   it('should throw ConflictException if name already exists (UTCID02)', async () => {
  //     mockRepository.findOne.mockResolvedValue({ name: 'Type A' });
  //     await expect(service.create(mockCreateProductTypeDto)).rejects.toThrow(
  //       ConflictException,
  //     );
  //     expect(mockRepository.findOne).toHaveBeenCalledWith({
  //       where: { name: mockCreateProductTypeDto.name },
  //     });

  //     try {
  //       await service.create(mockCreateProductTypeDto);
  //     } catch (error) {
  //       expect(error.message).toBe('Tên loại sản phẩm đã tồn tại');
  //     }
  //   });

  //   it('should throw InternalServerErrorException if create method has error (UTCID03)', async () => {
  //     mockRepository.findOne.mockResolvedValue(null);
  //     mockRepository.create.mockImplementation(() => {
  //       throw new Error('Unexpected Error');
  //     });

  //     await expect(service.create(mockCreateProductTypeDto)).rejects.toThrow(
  //       InternalServerErrorException,
  //     );
  //   });

  //   it('should create a product type successfully with special character (UTCID04)', async () => {
  //     const mockCreateProductTypeDtoWithSpecialChar: CreateProductTypeDto = {
  //       name: '*&^%&^%',
  //     };
  //     const mockProductType = {
  //       ...mockCreateProductTypeDtoWithSpecialChar,
  //       id: 1,
  //     };

  //     mockRepository.findOne.mockResolvedValue(null);
  //     mockRepository.create.mockReturnValue(mockProductType);
  //     mockRepository.save.mockResolvedValue(mockProductType);

  //     const result = await service.create(
  //       mockCreateProductTypeDtoWithSpecialChar,
  //     );
  //     expect(result).toEqual(mockProductType);
  //     expect(mockRepository.findOne).toHaveBeenCalledWith({
  //       where: { name: mockCreateProductTypeDtoWithSpecialChar.name },
  //     });
  //     expect(mockRepository.create).toHaveBeenCalledWith(
  //       mockCreateProductTypeDtoWithSpecialChar,
  //     );
  //   });

  //   it('should throw InternalServerErrorException when create with string length > max (UTCID05)', async () => {
  //     const mockCreateProductTypeDtoWithLongString: CreateProductTypeDto = {
  //       name: 'This is a very long string and exceeds the limit that was given',
  //     };

  //     mockRepository.findOne.mockResolvedValue(null);
  //     mockRepository.create.mockImplementation(() => {
  //       throw new Error('Unexpected Error');
  //     });

  //     await expect(
  //       service.create(mockCreateProductTypeDtoWithLongString),
  //     ).rejects.toThrow(InternalServerErrorException);
  //   });
  // });

  describe('findOne', () => {
    it('should return product type successfully (UTCID01)', async () => {
      const mockProductType = { id: 1, name: 'Product Type 1' };
      mockRepository.findOne.mockResolvedValue(mockProductType);

      const result = await service.findOne(1);

      expect(result).toEqual(mockProductType);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if product type is not found (UTCID02)', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(-1)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: -1 } });

    });

    it('should throw InternalServerErrorException if there\'s DB error (UTCID03)', async () => {
       mockRepository.findOne.mockImplementation(() => {
         throw new Error('Database error');
       });


      await expect(service.findOne(1)).rejects.toThrow(
          InternalServerErrorException,
      );

       expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  // describe('findAll', () => {
  //   it('UTCID01: should return paginated product types with meta', async () => {
  //     const query = {};
  //     const current = 1;
  //     const pageSize = 10;
  //     const totalItems = 20;
  //     const results = [{ id: 1, name: 'Product Type 1' }];
  
  //     mockRepository.count.mockResolvedValue(totalItems);
  //     mockRepository.find.mockResolvedValue(results);
  
  //     const result = await service.findAll(query, current, pageSize);
  
  //     expect(result).toEqual({
  //       meta: {
  //         current,
  //         pageSize,
  //         pages: 2,
  //         total: totalItems,
  //       },
  //       results,
  //     });
  //     expect(mockRepository.count).toHaveBeenCalledWith({ where: {} });
  //     expect(mockRepository.find).toHaveBeenCalledWith({
  //       where: {},
  //       relations: [],
  //       take: pageSize,
  //       skip: 0,
  //       order: undefined,
  //     });
  //   });
  
  //   it('UTCID02: should throw InternalServerErrorException on unexpected error', async () => {
  //     const query = {};
  //     const current = 1;
  //     const pageSize = 10;
  
  //     mockRepository.count.mockRejectedValue(new Error('Database error'));
  
  //     await expect(service.findAll(query, current, pageSize)).rejects.toThrow(
  //       InternalServerErrorException,
  //     );
  //     expect(mockRepository.count).toHaveBeenCalled();
  //     expect(mockRepository.find).not.toHaveBeenCalled();
  //   });
  
  //   it('UTCID03: should apply default pagination if current or pageSize is undefined', async () => {
  //     const query = {};
  //     const current = undefined;
  //     const pageSize = undefined;
  //     const totalItems = 10;
  //     const results = [{ id: 1, name: 'Product Type 1' }];
  
  //     mockRepository.count.mockResolvedValue(totalItems);
  //     mockRepository.find.mockResolvedValue(results);
  
  //     const result = await service.findAll(query, current, pageSize);
  
  //     expect(result).toEqual({
  //       meta: {
  //         current: 1,
  //         pageSize: 10,
  //         pages: 1,
  //         total: totalItems,
  //       },
  //       results,
  //     });
  //     expect(mockRepository.count).toHaveBeenCalledWith({ where: {} });
  //     expect(mockRepository.find).toHaveBeenCalledWith({
  //       where: {},
  //       relations: [],
  //       take: 10,
  //       skip: 0,
  //       order: undefined,
  //     });
  //   });
  
  //   it('UTCID04: should filter product types by name', async () => {
  //     const query = { name: 'Product Type 1' };
  //     const current = 1;
  //     const pageSize = 10;
  //     const totalItems = 1;
  //     const results = [{ id: 1, name: 'Product Type 1' }];
  
  //     mockRepository.count.mockResolvedValue(totalItems);
  //     mockRepository.find.mockResolvedValue(results);
  
  //     const result = await service.findAll(query, current, pageSize);
  
  //     expect(result).toEqual({
  //       meta: {
  //         current,
  //         pageSize,
  //         pages: 1,
  //         total: totalItems,
  //       },
  //       results,
  //     });
  //     expect(mockRepository.count).toHaveBeenCalledWith({
  //       where: { name: Like('%Product Type 1%') },
  //     });
  //     expect(mockRepository.find).toHaveBeenCalledWith({
  //       where: { name: Like('%Product Type 1%') },
  //       relations: [],
  //       take: pageSize,
  //       skip: 0,
  //       order: undefined,
  //     });
  //   });
  
  //   it('UTCID05: should return an empty array when no product types are found', async () => {
  //     const query = {};
  //     const current = 1;
  //     const pageSize = 10;
  //     const totalItems = 0;
  //     const results = [];
  
  //     mockRepository.count.mockResolvedValue(totalItems);
  //     mockRepository.find.mockResolvedValue(results);
  
  //     const result = await service.findAll(query, current, pageSize);
  
  //     expect(result).toEqual({
  //       meta: {
  //         current,
  //         pageSize,
  //         pages: 0,
  //         total: totalItems,
  //       },
  //       results,
  //     });
  //     expect(mockRepository.count).toHaveBeenCalledWith({ where: {} });
  //     expect(mockRepository.find).toHaveBeenCalledWith({
  //       where: {},
  //       relations: [],
  //       take: pageSize,
  //       skip: 0,
  //       order: undefined,
  //     });
  //   });
  // });
  

  // describe('update', () => {
  //   const mockUpdateProductTypeDto: UpdateProductTypeDto = {
  //     name: 'Product Type A',
  //   };
  //   const mockProductType = { id: 1, name: 'Product Type B' };

  //   it('should update a product type successfully (UTCID01)', async () => {
  //     mockRepository.findOne.mockReset();
  //     mockRepository.save.mockReset();
  //     const mockUpdatedProductType = {
  //       ...mockProductType,
  //       name: 'Product Type A',
  //     };
  //     mockRepository.findOne
  //       .mockResolvedValueOnce(mockProductType)
  //       .mockResolvedValueOnce(null);
  //     mockRepository.save.mockResolvedValue(mockUpdatedProductType);

  //     const result = await service.update(1, mockUpdateProductTypeDto);

  //     expect(result).toEqual(mockUpdatedProductType);
  //     expect(mockRepository.findOne).toHaveBeenCalledTimes(2);
  //     expect(mockRepository.findOne).toHaveBeenNthCalledWith(1, {
  //       where: { id: 1 },
  //     });
  //     expect(mockRepository.findOne).toHaveBeenNthCalledWith(2, {
  //       where: { name: 'Product Type A' },
  //     });
  //   });

  //   it('should throw ConflictException if name already exists', async () => {
  //     const id = 1;
  //     const updateProductTypeDto = { name: 'Product Type B' };
  //     const existingProductType = { id, name: 'Product Type A' };
  //     const conflictingProductType = { id: 2, name: 'Product Type B' };
  
  //     mockRepository.findOne
  //       .mockResolvedValueOnce(existingProductType) // Tìm thấy product type với id
  //       .mockResolvedValueOnce(conflictingProductType); // Tìm thấy product type khác với cùng tên
  
  //     await expect(service.update(id, updateProductTypeDto)).rejects.toThrow(
  //       ConflictException,
  //     );
  //     expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id } });
  //     expect(mockRepository.findOne).toHaveBeenCalledWith({
  //       where: { name: updateProductTypeDto.name },
  //     });
  //   });
  //   it('should throw NotFoundException if product type not found (UTCID03)', async () => {
  //     mockRepository.findOne.mockReset();
  //     mockRepository.save.mockReset();

  //     mockRepository.findOne.mockResolvedValue(null);

  //     await expect(
  //       service.update(9999, mockUpdateProductTypeDto),
  //     ).rejects.toThrow(NotFoundException);
  //     expect(mockRepository.findOne).toHaveBeenCalledWith({
  //       where: { id: 9999 },
  //     });

  //     try {
  //       await service.update(9999, mockUpdateProductTypeDto);
  //     } catch (error) {
  //       expect(error.message).toBe('Không tìm thấy loại sản phẩm');
  //     }
  //   });

  //   it('should throw InternalServerErrorException if database error happen (UTCID04)', async () => {
  //     mockRepository.findOne.mockReset();
  //     mockRepository.save.mockReset();
  //     mockRepository.findOne.mockImplementation(() => {
  //       throw new Error('Unexpected error');
  //     });
  //     await expect(service.update(1, mockUpdateProductTypeDto)).rejects.toThrow(
  //       InternalServerErrorException,
  //     );

  //     try {
  //       await service.update(1, mockUpdateProductTypeDto);
  //     } catch (error) {
  //       expect(error.message).toBe('Không thể cập nhật loại sản phẩm');
  //     }
  //   });

  //   it('should throw InternalServerErrorException if findOne method has an error', async () => {
  //     mockRepository.findOne.mockReset();
  //     mockRepository.save.mockReset();
  //     mockRepository.findOne.mockImplementation(() => {
  //       throw new Error('Unexpected Error');
  //     });
  //     await expect(service.update(1, mockUpdateProductTypeDto)).rejects.toThrow(
  //       InternalServerErrorException,
  //     );
  //   });
  // });


  // describe('remove', () => {
  //   it('UTCID01: should delete product type successfully', async () => {
  //     const id = 1;
  //     const productType = { id: 1, name: 'Test Product Type' };
  
  //     // Giả lập findOne trả về productType
  //     mockRepository.findOne.mockResolvedValue(productType);
  //     mockRepository.softDelete.mockResolvedValue({ affected: 1 });
  
  //     const result = await service.remove(id);
  
  //     expect(result).toEqual(productType);
  //     expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id } });
  //     expect(mockRepository.softDelete).toHaveBeenCalledWith(id);
  //   });
  
  //   it('UTCID02: should throw NotFoundException if product type does not exist', async () => {
  //     const id = 9999;
  
  //     // Giả lập findOne trả về null
  //     mockRepository.findOne.mockResolvedValue(null);
  
  //     await expect(service.remove(id)).rejects.toThrow(NotFoundException);
  //     expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id } });
  //     expect(mockRepository.softDelete).not.toHaveBeenCalled();
  //   });
  
  //   it('UTCID03: should throw InternalServerErrorException on unexpected error', async () => {
  //     const id = 1;
  
  //     // Giả lập findOne gặp lỗi
  //     mockRepository.findOne.mockRejectedValue(new Error('Database connection error'));
  
  //     await expect(service.remove(id)).rejects.toThrow(InternalServerErrorException);
  //     expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id } });
  //     expect(mockRepository.softDelete).not.toHaveBeenCalled();
  //   });
  // });

});
