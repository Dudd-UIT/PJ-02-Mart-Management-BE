import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductSample } from './entities/product_sample.entity';
import {
  InternalServerErrorException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ProductSamplesService } from './product_samples.service';
import { ProductUnitsService } from '../product_units/product_units.service';
import { ProductLinesService } from '../product_lines/product_lines.service';
import { CreateProductSampleAndProductUnitDto } from './dto/create-productSample_productUnit.dto';

describe('ProductSamplesService', () => {
  let service: ProductSamplesService;
  let productSampleRepository: Repository<ProductSample>;
  let productUnitsService: ProductUnitsService;
  let productLinesService: ProductLinesService;

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      save: jest.fn(),
    },
  };
  
  const mockProductSampleRepository = {
    create: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    softDelete: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    })),
    manager: {
      connection: {
        createQueryRunner: jest.fn(),
      },
    },
  };
  
  

  
  const mockProductUnitsService = {
    create: jest.fn(),
    remove: jest.fn(),
  };
  
  const mockProductLinesService = {
    findOne: jest.fn(),
  };
  

  beforeEach(async () => {
    mockProductSampleRepository.manager.connection.createQueryRunner = jest
    .fn()
    .mockReturnValue(mockQueryRunner);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductSamplesService,
        {
          provide: getRepositoryToken(ProductSample),
          useValue: mockProductSampleRepository,
        },
        { provide: ProductUnitsService, useValue: mockProductUnitsService },
        { provide: ProductLinesService, useValue: mockProductLinesService },
      ],
    }).compile();

    service = module.get<ProductSamplesService>(ProductSamplesService);
    productSampleRepository = module.get<Repository<ProductSample>>(
      getRepositoryToken(ProductSample),
    );
    productUnitsService = module.get<ProductUnitsService>(ProductUnitsService);
    productLinesService = module.get<ProductLinesService>(ProductLinesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

//   describe('createProductSampleAndProductUnits', () => {

//     const productSampleDto = {
//       name: 'Sample A',
//       description: 'This is sample A',
//       productLineId: 1,
//     };

//     const productUnitsDto = [
//       {
//         sellPrice: 100,
//         conversionRate: 1,
//         unitId: 1,
//         compareUnitId: 2,
//         volumne: '10L',
//         image: 'image_url.jpg',
//       },
//     ];

//     const mockDto: CreateProductSampleAndProductUnitDto = {
//       productSampleDto,
//       productUnitsDto,
//     };

//     describe('Success cases', () => {
//       it('UTCID01: should create product sample and product units successfully', async () => {
//         const mockProductSample = { id: 1, ...productSampleDto };
//         const productLine = { id: 1, name: 'Line A' };

//         mockProductSampleRepository.findOne.mockResolvedValue(null);
//         mockProductLinesService.findOne.mockResolvedValue(productLine);
//         mockProductSampleRepository.create.mockReturnValue(mockProductSample);
//         mockProductSampleRepository.save.mockResolvedValue(mockProductSample);
//         mockProductUnitsService.create.mockResolvedValue({});

//         const result =
//           await service.createProductSampleAndProductUnits(mockDto);

//         expect(result).toEqual(mockProductSample);
//         expect(mockProductSampleRepository.findOne).toHaveBeenCalledWith({
//           where: { name: 'Sample A' },
//         });
//         expect(mockProductLinesService.findOne).toHaveBeenCalledWith(1);
//         expect(mockProductSampleRepository.save).toHaveBeenCalledWith(
//           mockProductSample,
//         );
//         expect(mockProductUnitsService.create).toHaveBeenCalledWith({
//           ...productUnitsDto[0],
//           productSampleId: 1,
//         });
//       });
//     });

//     describe('Error cases', () => {
//       it('UTCID02: should throw ConflictException when product sample name exists', async () => {
//         mockProductSampleRepository.findOne.mockResolvedValue({
//           name: 'Sample A',
//         });

//         await expect(
//           service.createProductSampleAndProductUnits(mockDto),
//         ).rejects.toThrow(ConflictException);

//         expect(mockProductSampleRepository.findOne).toHaveBeenCalledWith({
//           where: { name: 'Sample A' },
//         });
//       });

//       it('UTCID03: should throw NotFoundException when product line does not exist', async () => {
//         mockProductSampleRepository.findOne.mockResolvedValue(null);
//         mockProductLinesService.findOne.mockResolvedValue(null);

//         await expect(
//           service.createProductSampleAndProductUnits(mockDto),
//         ).rejects.toThrow(NotFoundException);

//         expect(mockProductLinesService.findOne).toHaveBeenCalledWith(1);
//       });

//       it('UTCID04: should create product sample successfully when productUnitsDto is empty', async () => {
//         const emptyProductUnitsDto = {
//           productSampleDto,
//           productUnitsDto: [],
//         };
//         const mockProductSample = { id: 1, ...productSampleDto };
//         const productLine = { id: 1, name: 'Line A' };

//         mockProductSampleRepository.findOne.mockResolvedValue(null);
//         mockProductLinesService.findOne.mockResolvedValue(productLine);
//         mockProductSampleRepository.create.mockReturnValue(mockProductSample);
//         mockProductSampleRepository.save.mockResolvedValue(mockProductSample);

//         const result =
//           await service.createProductSampleAndProductUnits(
//             emptyProductUnitsDto,
//           );

//         expect(result).toEqual(mockProductSample);
//         expect(mockProductSampleRepository.save).toHaveBeenCalledWith(
//           mockProductSample,
//         );
//         expect(mockProductUnitsService.create).not.toHaveBeenCalled();
//       });

//       it('UTCID05: should throw InternalServerErrorException when productUnitsDto has invalid data', async () => {
//         const invalidProductUnitsDto = {
//           productSampleDto,
//           productUnitsDto: [
//             {
//               sellPrice: null, // Invalid value
//               conversionRate: 1,
//               unitId: 1,
//               compareUnitId: 2,
//               volumne: '10L', // Thêm volumne
//               image: 'image_url.jpg', // Thêm image
//             },
//           ],
//         };
//         const mockProductSample = { id: 1, ...productSampleDto };
//         const productLine = { id: 1, name: 'Line A' };

//         mockProductSampleRepository.findOne.mockResolvedValue(null);
//         mockProductLinesService.findOne.mockResolvedValue(productLine);
//         mockProductSampleRepository.create.mockReturnValue(mockProductSample);
//         mockProductSampleRepository.save.mockResolvedValue(mockProductSample);
//         mockProductUnitsService.create.mockRejectedValue(
//           new InternalServerErrorException('Invalid product unit data'),
//         );

//         await expect(
//           service.createProductSampleAndProductUnits(invalidProductUnitsDto),
//         ).rejects.toThrow(InternalServerErrorException);

//         expect(mockProductUnitsService.create).toHaveBeenCalled();
//       });

//       it('UTCID06: should throw InternalServerErrorException on unexpected repository error', async () => {
//         mockProductSampleRepository.findOne.mockRejectedValue(
//           new Error('Unexpected error'),
//         );

//         await expect(
//           service.createProductSampleAndProductUnits(mockDto),
//         ).rejects.toThrow(InternalServerErrorException);

//         expect(mockProductSampleRepository.findOne).toHaveBeenCalled();
//       });
//     });
//   });

// describe('update', () => {
//     const updateProductSampleDto = {
//       name: 'New name',
//       description: 'New description',
//       productLineId: 2,
//     };
  
//     const existingProductSample = {
//       id: 1,
//       name: 'Sample 1',
//       description: 'Old description',
//       productLineId: 1,
//     };
  
//     it('UTCID01: should update product sample successfully', async () => {
//         const updatedProductSample = {
//           ...existingProductSample,
//           ...updateProductSampleDto,
//         };
      
//         mockProductSampleRepository.findOne.mockResolvedValueOnce(existingProductSample);
//         mockProductSampleRepository.findOne.mockResolvedValueOnce(null);
      
//         mockProductLinesService.findOne.mockResolvedValue({ id: 2, name: 'Line 2' });
//         mockProductSampleRepository.save.mockResolvedValue(updatedProductSample);
      
//         const result = await service.update(1, updateProductSampleDto);
      
//         expect(result).toEqual(updatedProductSample);
//         expect(mockProductSampleRepository.findOne).toHaveBeenCalledWith({
//           where: { id: 1 },
//           relations: ['productUnits.unit'],
//         });
//         expect(mockProductLinesService.findOne).toHaveBeenCalledWith(2);
//         expect(mockProductSampleRepository.save).toHaveBeenCalledWith(updatedProductSample);
//       });
  
//     it('UTCID02: should update product sample description only', async () => {
//       const partialUpdateDto = { description: 'New description' };
  
//       mockProductSampleRepository.findOne.mockResolvedValue(existingProductSample);
//       mockProductSampleRepository.save.mockResolvedValue({
//         ...existingProductSample,
//         ...partialUpdateDto,
//       });
  
//       const result = await service.update(1, partialUpdateDto);
  
//       expect(result).toEqual({ ...existingProductSample, ...partialUpdateDto });
//       expect(mockProductSampleRepository.save).toHaveBeenCalledWith({
//         ...existingProductSample,
//         ...partialUpdateDto,
//       });
//     });
  
//     it('UTCID03: should update productLineId successfully', async () => {
//       const partialUpdateDto = { productLineId: 2 };
  
//       mockProductSampleRepository.findOne.mockResolvedValue(existingProductSample);
//       mockProductLinesService.findOne.mockResolvedValue({ id: 2, name: 'Line 2' });
//       mockProductSampleRepository.save.mockResolvedValue({
//         ...existingProductSample,
//         ...partialUpdateDto,
//       });
  
//       const result = await service.update(1, partialUpdateDto);
  
//       expect(result).toEqual({ ...existingProductSample, ...partialUpdateDto });
//       expect(mockProductLinesService.findOne).toHaveBeenCalledWith(2);
//     });
  
//     it('UTCID04: should throw NotFoundException when product sample does not exist', async () => {
//         mockProductSampleRepository.findOne.mockResolvedValue(null);
      
//         await expect(service.update(999, updateProductSampleDto)).rejects.toThrow(
//           NotFoundException,
//         );
      
//         expect(mockProductSampleRepository.findOne).toHaveBeenCalledWith({
//           where: { id: 999 },
//           relations: ['productUnits.unit'],
//         });
//       });
      
  
//     it('UTCID05: should throw NotFoundException when productLineId does not exist', async () => {
//       const updateDtoWithInvalidLine = { productLineId: 99 };
  
//       mockProductSampleRepository.findOne.mockResolvedValue(existingProductSample);
//       mockProductLinesService.findOne.mockResolvedValue(null);
  
//       await expect(service.update(1, updateDtoWithInvalidLine)).rejects.toThrow(
//         NotFoundException,
//       );
//       expect(mockProductLinesService.findOne).toHaveBeenCalledWith(99);
//     });
  
//     it('UTCID06: should throw ConflictException when product sample name already exists', async () => {
//       const updateDtoWithExistingName = { name: 'Sample 2' };
  
//       mockProductSampleRepository.findOne.mockResolvedValueOnce(existingProductSample);
//       mockProductSampleRepository.findOne.mockResolvedValueOnce({
//         id: 2,
//         name: 'Sample 2',
//       });
  
//       await expect(service.update(1, updateDtoWithExistingName)).rejects.toThrow(
//         ConflictException,
//       );
//       expect(mockProductSampleRepository.findOne).toHaveBeenCalledWith({
//         where: { name: 'Sample 2' },
//       });
//     });
  
//     it('UTCID07: should throw InternalServerErrorException on unexpected error', async () => {
//         mockProductSampleRepository.findOne.mockRejectedValue(new Error('Unexpected error'));
      
//         await expect(service.update(1, updateProductSampleDto)).rejects.toThrow(
//           InternalServerErrorException,
//         );
      
//         expect(mockProductSampleRepository.findOne).toHaveBeenCalledWith({
//           where: { id: 1 },
//           relations: ['productUnits.unit'],
//         });
//       });
      
//   });
  

// describe('findOne', () => {
//     const productSample = {
//       id: 1,
//       name: 'Sample 1',
//       productUnits: [{ id: 1, unit: { id: 1, name: 'Unit 1' } }],
//     };
  
//     it('UTCID01: should return productSample with related productUnits and Unit', async () => {
//       mockProductSampleRepository.findOne.mockResolvedValue(productSample);
  
//       const result = await service.findOne(1);
  
//       expect(result).toEqual(productSample);
//       expect(mockProductSampleRepository.findOne).toHaveBeenCalledWith({
//         where: { id: 1 },
//         relations: ['productUnits.unit'],
//       });
//     });
  
//     it('UTCID02: should return productSample without related productUnits and Unit', async () => {
//       const productSampleWithoutRelations = {
//         id: 1,
//         name: 'Sample 1',
//         productUnits: [],
//       };
  
//       mockProductSampleRepository.findOne.mockResolvedValue(productSampleWithoutRelations);
  
//       const result = await service.findOne(1);
  
//       expect(result).toEqual(productSampleWithoutRelations);
//       expect(mockProductSampleRepository.findOne).toHaveBeenCalledWith({
//         where: { id: 1 },
//         relations: ['productUnits.unit'],
//       });
//     });
  
//     it('UTCID03: should throw the original Error when repository throws error', async () => {
//         const mockError = new Error('Database error');
//         mockProductSampleRepository.findOne.mockRejectedValue(mockError);
      
//         await expect(service.findOne(1)).rejects.toThrowError('Database error');
      
//         expect(mockProductSampleRepository.findOne).toHaveBeenCalledWith({
//           where: { id: 1 },
//           relations: ['productUnits.unit'],
//         });
//       });
      
  
//     it('UTCID04: should throw NotFoundException when productSample does not exist', async () => {
//       mockProductSampleRepository.findOne.mockResolvedValue(null);
  
//       await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  
//       expect(mockProductSampleRepository.findOne).toHaveBeenCalledWith({
//         where: { id: 999 },
//         relations: ['productUnits.unit'],
//       });
//     });
//   });
  



// describe('remove', () => {
//     const existingProductSample = { id: 1, name: 'Sample 1', description: 'desc' };
  
//     it('UTCID01: should remove productSample successfully', async () => {
//       mockProductSampleRepository.findOne.mockResolvedValue(existingProductSample);
//       mockProductSampleRepository.softDelete.mockResolvedValue({});
  
//       const result = await service.remove(1);
  
//       expect(result).toEqual(existingProductSample);
//       expect(mockProductSampleRepository.findOne).toHaveBeenCalledWith({
//         where: { id: 1 },
//         relations: ['productUnits.unit'],
//       });
//       expect(mockProductSampleRepository.softDelete).toHaveBeenCalledWith(1);
//     });
  
//     it('UTCID02: should throw NotFoundException when productSample does not exist', async () => {
//       mockProductSampleRepository.findOne.mockResolvedValue(null);
  
//       await expect(service.remove(99)).rejects.toThrow(NotFoundException);
//       expect(mockProductSampleRepository.findOne).toHaveBeenCalledWith({
//         where: { id: 99 },
//         relations: ['productUnits.unit'],
//       });
//       expect(mockProductSampleRepository.softDelete).not.toHaveBeenCalled();
//     });
  
//     it('UTCID03: should throw InternalServerErrorException on database error', async () => {
//       mockProductSampleRepository.findOne.mockImplementation(() => {
//         throw new Error('Database error');
//       });
  
//       await expect(service.remove(1)).rejects.toThrow(InternalServerErrorException);
//       expect(mockProductSampleRepository.findOne).toHaveBeenCalledWith({
//         where: { id: 1 },
//         relations: ['productUnits.unit'],
//       });
//       expect(mockProductSampleRepository.softDelete).not.toHaveBeenCalled();
//     });
//   });
  

  
// describe('findAll', () => {
//     const mockQuery = {};
//     const mockResults = [
//       { id: 1, name: 'Sample 1' },
//       { id: 2, name: 'Sample 2' },
//       { id: 3, name: 'Sample 3' },
//     ];
  
//     beforeEach(() => {
//       jest.clearAllMocks();
//     });
  
//     it('UTCID01: should return paginated productSamples with meta (empty query)', async () => {
//       mockProductSampleRepository.count.mockResolvedValue(5);
//       mockProductSampleRepository.createQueryBuilder.mockReturnValue({
//         leftJoinAndSelect: jest.fn().mockReturnThis(),
//         where: jest.fn().mockReturnThis(),
//         andWhere: jest.fn().mockReturnThis(),
//         take: jest.fn().mockReturnThis(),
//         skip: jest.fn().mockReturnThis(),
//         getMany: jest.fn().mockResolvedValue(mockResults),
//       });
  
//       const result = await service.findAll(mockQuery, 1, 10);
  
//       expect(result).toEqual({
//         meta: {
//           current: 1,
//           pageSize: 10,
//           pages: 1,
//           total: 5,
//         },
//         results: mockResults,
//       });
  
//       expect(mockProductSampleRepository.count).toHaveBeenCalledWith({
//         where: {},
//       });
//       expect(mockProductSampleRepository.createQueryBuilder).toHaveBeenCalled();
//     });
  
//     it('UTCID02: should return paginated productSamples filtered by name', async () => {
//         const mockQuery = { name: 'Sample 1' };
//         const mockResults = [{ id: 1, name: 'Sample 1' }];
//         const mockFilter = { name: 'Sample 1' };
      
//         mockProductSampleRepository.count.mockResolvedValue(1);
//         mockProductSampleRepository.createQueryBuilder().getMany.mockResolvedValue(
//           mockResults,
//         );
      
//         const result = await service.findAll(mockQuery, 1, 10);
      
//         expect(result).toEqual({
//           meta: {
//             current: 1,
//             pageSize: 10,
//             pages: 1,
//             total: 1,
//           },
//           results: mockResults,
//         });
      
//         expect(mockProductSampleRepository.count).toHaveBeenCalledWith({
//           where: mockFilter,
//         });
//         expect(mockProductSampleRepository.createQueryBuilder).toHaveBeenCalled();
//       });
      
  
//       it('UTCID03: should return paginated productSamples filtered by productLineId', async () => {
//         const mockQuery = { productLineId: 1 };
//         const mockResults = [{ id: 1, name: 'Sample 1', productLineId: 1 }];
//         const mockFilter = { productLineId: 1 };
      
//         mockProductSampleRepository.count.mockResolvedValue(1);
//         mockProductSampleRepository.createQueryBuilder().getMany.mockResolvedValue(
//           mockResults,
//         );
      
//         const result = await service.findAll(mockQuery, 1, 10);
      
//         expect(result).toEqual({
//           meta: {
//             current: 1,
//             pageSize: 10,
//             pages: 1,
//             total: 1,
//           },
//           results: mockResults,
//         });
      
//         expect(mockProductSampleRepository.count).toHaveBeenCalledWith({
//           where: mockFilter,
//         });
//         expect(mockProductSampleRepository.createQueryBuilder).toHaveBeenCalled();
//       });
      
  
//     it('UTCID04: should return empty results when there are no productSamples', async () => {
//       mockProductSampleRepository.count.mockResolvedValue(0);
//       mockProductSampleRepository.createQueryBuilder.mockReturnValue({
//         leftJoinAndSelect: jest.fn().mockReturnThis(),
//         where: jest.fn().mockReturnThis(),
//         andWhere: jest.fn().mockReturnThis(),
//         take: jest.fn().mockReturnThis(),
//         skip: jest.fn().mockReturnThis(),
//         getMany: jest.fn().mockResolvedValue([]),
//       });
  
//       const result = await service.findAll(mockQuery, 1, 10);
  
//       expect(result).toEqual({
//         meta: {
//           current: 1,
//           pageSize: 10,
//           pages: 0,
//           total: 0,
//         },
//         results: [],
//       });
  
//       expect(mockProductSampleRepository.count).toHaveBeenCalledWith({
//         where: {},
//       });
//       expect(mockProductSampleRepository.createQueryBuilder).toHaveBeenCalled();
//     });
  
//     it('UTCID05: should apply default pagination when current and pageSize are undefined', async () => {
//       mockProductSampleRepository.count.mockResolvedValue(5);
//       mockProductSampleRepository.createQueryBuilder.mockReturnValue({
//         leftJoinAndSelect: jest.fn().mockReturnThis(),
//         where: jest.fn().mockReturnThis(),
//         andWhere: jest.fn().mockReturnThis(),
//         take: jest.fn().mockReturnThis(),
//         skip: jest.fn().mockReturnThis(),
//         getMany: jest.fn().mockResolvedValue(mockResults),
//       });
  
//       const result = await service.findAll(mockQuery, undefined, undefined);
  
//       expect(result).toEqual({
//         meta: {
//           current: 1,
//           pageSize: 10,
//           pages: 1,
//           total: 5,
//         },
//         results: mockResults,
//       });
  
//       expect(mockProductSampleRepository.count).toHaveBeenCalledWith({
//         where: {},
//       });
//       expect(mockProductSampleRepository.createQueryBuilder).toHaveBeenCalled();
//     });
  
//     it('UTCID06: should throw InternalServerErrorException on database error', async () => {
//         mockProductSampleRepository.count.mockRejectedValue(
//           new Error('Database error'),
//         );
      
//         await expect(service.findAll({}, 1, 10)).rejects.toThrow(
//           InternalServerErrorException,
//         );
      
//         expect(mockProductSampleRepository.count).toHaveBeenCalled();
//       });
      
//   });
  


describe('updateProductSampleAndProductUnits', () => {
  const id = 1;
  const updateDto = {
    productSampleDto: {
      name: 'Sample updated',
      description: 'desc updated',
      productLineId: 2,
    },
    productUnitsDto: [
      {
        sellPrice: 200,
        conversionRate: 2,
        unitId: 2,
        compareUnitId: 3,
        volumne: '500ml',
        image: 'sample-image.png',
      },
    ],
  };

  const mockProductSample = {
    id: 1,
    name: 'Sample 1',
    productUnits: [
      { id: 1, sellPrice: 100, conversionRate: 1, unitId: 1, compareUnitId: 2 },
    ],
  };

  beforeEach(() => {
    mockProductSampleRepository.manager.connection.createQueryRunner = jest
      .fn()
      .mockReturnValue(mockQueryRunner);
  
    mockQueryRunner.connect.mockClear();
    mockQueryRunner.startTransaction.mockClear();
    mockQueryRunner.commitTransaction.mockClear();
    mockQueryRunner.rollbackTransaction.mockClear();
    mockQueryRunner.release.mockClear();
  });
  

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('UTCID01 - should update productSample and productUnits successfully', async () => {
    mockProductSampleRepository.findOne.mockResolvedValueOnce(mockProductSample);
    mockProductLinesService.findOne.mockResolvedValue({ id: 2 });
    mockProductUnitsService.remove.mockResolvedValue(undefined);
    mockProductUnitsService.create.mockResolvedValue({ id: 1 });
    mockQueryRunner.manager.save.mockResolvedValue({ id: 1, name: 'Sample updated' });
  
    const result = await service.updateProductSampleAndProductUnits(id, updateDto);
  
    expect(result).toEqual({ id: 1, name: 'Sample updated' });
    expect(mockQueryRunner.connect).toHaveBeenCalled();
    expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.release).toHaveBeenCalled();
  });
  

  it('UTCID02 - should throw ConflictException when productSample name already exists', async () => {
    mockProductSampleRepository.findOne
      .mockResolvedValueOnce(mockProductSample)
      .mockResolvedValueOnce({ id: 2, name: 'Sample updated' });

    await expect(service.updateProductSampleAndProductUnits(id, updateDto)).rejects.toThrow(
      ConflictException,
    );

    expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
  });

  it('UTCID03 - should throw NotFoundException when productLine does not exist', async () => {
    mockProductLinesService.findOne.mockResolvedValue(null);

    await expect(service.updateProductSampleAndProductUnits(id, updateDto)).rejects.toThrow(
      NotFoundException,
    );

    expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
  });

  it('UTCID04 - should throw NotFoundException when productSample is not found', async () => {
    mockProductSampleRepository.findOne.mockResolvedValue(null);

    await expect(service.updateProductSampleAndProductUnits(99, updateDto)).rejects.toThrow(
      NotFoundException,
    );

    expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();
  });

  it('UTCID05 - should throw NotFoundException when productUnitsDto contain invalid unitId', async () => {
    mockProductUnitsService.create.mockRejectedValue(new NotFoundException());
  
    const invalidDto = {
      ...updateDto,
      productUnitsDto: [
        {
          sellPrice: 200,
          conversionRate: 2,
          unitId: null,
          compareUnitId: 3,
          volumne: '500ml',
          image: 'sample-image.png',
        },
      ],
    };
  
    await expect(service.updateProductSampleAndProductUnits(id, invalidDto)).rejects.toThrow(
      NotFoundException,
    );
  
    expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
  });
  

  it('UTCID06 - should throw InternalServerErrorException when QueryRunner fails', async () => {
    mockQueryRunner.startTransaction.mockRejectedValue(new Error('Transaction start failed'));

    await expect(service.updateProductSampleAndProductUnits(id, updateDto)).rejects.toThrow(
      InternalServerErrorException,
    );

    expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();
  });

  it('UTCID07 - should throw InternalServerErrorException on unexpected error during create', async () => {
    mockProductUnitsService.create.mockRejectedValue(new Error('Create failed'));

    await expect(service.updateProductSampleAndProductUnits(id, updateDto)).rejects.toThrow(
      InternalServerErrorException,
    );

    expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
  });

  it('UTCID08 - should throw InternalServerErrorException when database connection fails', async () => {
    mockProductSampleRepository.findOne.mockRejectedValue(new Error('Database connection failed'));

    await expect(service.updateProductSampleAndProductUnits(id, updateDto)).rejects.toThrow(
      InternalServerErrorException,
    );

    expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();
  });
});



});
