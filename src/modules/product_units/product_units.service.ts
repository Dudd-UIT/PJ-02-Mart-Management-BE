import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductUnitDto } from './dto/create-product_unit.dto';
import { UpdateProductUnitDto } from './dto/update-product_unit.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ProductUnit } from './entities/product_unit.entity';
import { ProductSamplesService } from '../product_samples/product_samples.service';
import { UnitsService } from '../units/units.service';
import aqp from 'api-query-params';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class ProductUnitsService {
  constructor(
    @InjectRepository(ProductUnit)
    private productUnitRepository: Repository<ProductUnit>,
    @Inject(forwardRef(() => ProductSamplesService))
    private productSamplesService: ProductSamplesService,
    private unitsService: UnitsService,
    private uploadService: UploadService,
  ) {}

  private convertBase64ToMulterFile(base64String: string): Express.Multer.File {
    const buffer = Buffer.from(base64String, 'base64');
    return {
      originalname: `image-${Date.now()}.jpg`,
      buffer,
      mimetype: 'image/jpeg',
    } as Express.Multer.File;
  }

  async create(createProductUnitDto: CreateProductUnitDto) {
    try {
      if (
        createProductUnitDto.image &&
        !createProductUnitDto.image.startsWith('http')
      ) {
        const uploadedImageUrl = await this.uploadService.uploadFile(
          this.convertBase64ToMulterFile(createProductUnitDto.image),
        );
        createProductUnitDto.image = uploadedImageUrl; // Cập nhật URL của ảnh
      }

      const { unitId, productSampleId, compareUnitId, ...rest } =
        createProductUnitDto;

      const productUnit = this.productUnitRepository.create({
        ...rest,
      });
      if (productSampleId) {
        const productSample =
          await this.productSamplesService.findOne(productSampleId);
        if (!productSample) {
          throw new NotFoundException(`Không tìm thấy mẫu sản phẩm`);
        }
        productUnit.productSample = productSample;
      }

      if (unitId) {
        const unit = await this.unitsService.findOne(unitId);
        if (!unit) {
          throw new NotFoundException(`Không tìm thấy đơn vị tính`);
        }
        productUnit.unit = unit;
      }

      if (compareUnitId) {
        const compareUnit = await this.unitsService.findOne(compareUnitId);
        if (!compareUnit) {
          throw new NotFoundException(`Không tìm thấy đơn vị tính`);
        }
        productUnit.compareUnit = compareUnit;
      }

      const savedProductUnit =
        await this.productUnitRepository.save(productUnit);
      return savedProductUnit;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Lỗi khi tạo productUnit', error);
      throw new Error('Có lỗi xảy ra khi tạo productUnit');
    }
  }

  async findAll(query: any, current: number, pageSize: number) {
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const { filter } = aqp(query);
    const productSampleNameFilter = filter.name || null;
    const productLineIdFilter = filter.productLineId || null;
    const productTypeIdFilter = filter.productTypeId || null;
    const outOfStockFlag = filter.outOfStock || false;

    delete filter.current;
    delete filter.pageSize;
    delete filter.name;
    delete filter.productLineId;
    delete filter.productTypeId;

    const skip = (current - 1) * pageSize;

    const queryBuilder = this.productUnitRepository
      .createQueryBuilder('productUnit')
      .leftJoinAndSelect('productUnit.unit', 'unit')
      .leftJoinAndSelect('productUnit.productSample', 'productSample')
      .leftJoinAndSelect('productSample.productLine', 'productLine')
      .leftJoinAndSelect('productLine.productType', 'productType');

    if (outOfStockFlag) {
      queryBuilder
        .leftJoin('productUnit.batch', 'batch')
        .where('(batch.id IS NULL OR batch.inventQuantity = 0)');
    } else {
      queryBuilder.where(filter);
    }

    if (productSampleNameFilter) {
      queryBuilder.andWhere('productSample.name LIKE :name', {
        name: `%${productSampleNameFilter}%`,
      });
    }

    if (productLineIdFilter) {
      queryBuilder.andWhere('productLine.id = :lineId', {
        lineId: productLineIdFilter,
      });
    }

    if (productTypeIdFilter) {
      queryBuilder.andWhere('productType.id = :typeId', {
        typeId: productTypeIdFilter,
      });
    }

    const totalItems = await queryBuilder.getCount();

    const results = await queryBuilder.take(pageSize).skip(skip).getMany();

    return {
      meta: {
        current,
        pageSize,
        pages: Math.ceil(totalItems / pageSize),
        total: totalItems,
      },
      results,
    };
  }

  async findBySupplier(
    id: number,
    query: any,
    current: number,
    pageSize: number,
    productLineId: number,
  ) {
    const { filter, sort } = aqp(query);

    const supplierId = id;
    if (!current) current = 1;
    if (!pageSize) pageSize = 100;

    const productSampleNameFilter = filter.name ? filter.name : null;

    delete filter.current;
    delete filter.pageSize;
    delete filter.name;
    delete filter.productLineName;
    delete filter.productTypeName;
    delete filter.productLineId;

    if (productLineId) {
      filter.productSample = { productLineId: productLineId };
    }

    const skip = (current - 1) * pageSize;

    // Count total items with the filters
    const totalItems = await this.productUnitRepository
      .createQueryBuilder('productUnit')
      .leftJoinAndSelect('productUnit.unit', 'unit')
      .leftJoinAndSelect('productUnit.productSample', 'productSample')
      .leftJoin('productUnit.supplierProducts', 'supplierProducts')
      .where((qb) => {
        qb.where(filter);
        if (productSampleNameFilter) {
          qb.andWhere('productSample.name LIKE :name', {
            name: `%${productSampleNameFilter}%`,
          });
        }
        if (supplierId) {
          qb.andWhere('supplierProducts.supplierId = :supplierId', {
            supplierId,
          });
        }
      })
      .getCount();

    const totalPages = Math.ceil(totalItems / pageSize);

    const results = await this.productUnitRepository
      .createQueryBuilder('productUnit')
      .leftJoinAndSelect('productUnit.productSample', 'productSample')
      .leftJoinAndSelect('productUnit.unit', 'unit')
      .leftJoin('productUnit.supplierProducts', 'supplierProducts')
      .where((qb) => {
        qb.where(filter);
        if (productSampleNameFilter) {
          qb.andWhere('productSample.name LIKE :name', {
            name: `%${productSampleNameFilter}%`,
          });
        }
        if (supplierId) {
          qb.andWhere('supplierProducts.supplierId = :supplierId', {
            supplierId,
          });
        }
      })

      .take(pageSize)
      .skip(skip)
      .getMany();

    return {
      meta: {
        current,
        pageSize,
        pages: totalPages,
        total: totalItems,
      },
      results,
    };
  }

  async findByIds(ids: number[], current: number, pageSize: number) {
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    if (!ids || ids.length === 0) {
      return {
        meta: {
          current,
          pageSize,
          pages: 0,
          total: 0,
        },
        results: [],
      };
    }

    const totalItems = await this.productUnitRepository
      .createQueryBuilder('productUnit')
      .leftJoinAndSelect('productUnit.productSample', 'productSample')
      .leftJoinAndSelect('productUnit.unit', 'unit')
      .where('productUnit.id IN (:...ids)', { ids })
      .getCount();

    const totalPages = Math.ceil(totalItems / pageSize);

    const skip = (current - 1) * pageSize;

    const results = await this.productUnitRepository
      .createQueryBuilder('productUnit')
      .leftJoinAndSelect('productUnit.productSample', 'productSample')
      .leftJoinAndSelect('productUnit.unit', 'unit')
      .where('productUnit.id IN (:...ids)', { ids })
      .skip(skip)
      .take(pageSize)
      .getMany();

    return {
      meta: {
        current,
        pageSize,
        pages: totalPages,
        total: totalItems,
      },
      results,
    };
  }

  async findOne(id: number) {
    const productSample = await this.productUnitRepository.findOne({
      where: { id },
    });

    if (!productSample) {
      throw new NotFoundException('Không tìm thấy mẫu sản phẩm');
    }

    return productSample;
  }

  async update(id: number, updateProductUnitDto: UpdateProductUnitDto) {
    const productUnit = await this.findOne(id);
    if (!productUnit) {
      throw new NotFoundException('Không tìm thấy mẫu sản phẩm');
    }

    Object.assign(productUnit, updateProductUnitDto);
    const savedProductUnit = await this.productUnitRepository.save(productUnit);
    return savedProductUnit;
  }

  async remove(id: number) {
    const productUnit = await this.findOne(id);
    if (!productUnit) {
      throw new NotFoundException('Không tìm thấy mẫu sản phẩm');
    }
    await this.productUnitRepository.delete(id);
    return productUnit;
  }

  async findOutOfStockSamples(current: number, pageSize: number) {
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const skip = (current - 1) * pageSize;

    const queryBuilder = this.productUnitRepository
      .createQueryBuilder('productUnit')
      .leftJoinAndSelect('productUnit.productSample', 'productSample')
      .leftJoinAndSelect('productSample.productLine', 'productLine')
      .leftJoinAndSelect('productLine.productType', 'productType')
      .leftJoinAndSelect('productUnit.unit', 'unit')
      .leftJoin('productUnit.batch', 'batch')
      .where('(batch.id IS NULL OR batch.inventQuantity = 0)')
      .take(pageSize)
      .skip(skip);

    const totalItems = await queryBuilder.getCount();
    const results = await queryBuilder.getMany();

    return {
      meta: {
        current,
        pageSize,
        pages: Math.ceil(totalItems / pageSize),
        total: totalItems,
      },
      results,
    };
  }

  async findProductUnitsWithNearestBatch(
    query: any,
    current: number,
    pageSize: number,
  ) {
    // Đảm bảo current và pageSize hợp lệ
    if (!current || current < 1) current = 1;
    if (!pageSize || pageSize < 1) pageSize = 12;

    const { filter } = aqp(query);
    const productSampleNameFilter = filter.name || null;
    const productUnitIdFilter = filter.id || null; // Thêm lọc id

    delete filter.current;
    delete filter.pageSize;
    delete filter.name;
    delete filter.id; // Xóa id khỏi filter để tránh ảnh hưởng logic khác

    console.log('filter', filter);

    const skip = (current - 1) * pageSize;

    // Tính tổng số lượng bản ghi
    const totalItems = await this.productUnitRepository
      .createQueryBuilder('productUnit')
      .leftJoinAndSelect('productUnit.productSample', 'productSample')
      .andWhere(
        productSampleNameFilter ? 'productSample.name LIKE :name' : '1=1',
        {
          name: `%${productSampleNameFilter}%`,
        },
      )
      .andWhere(productUnitIdFilter ? 'productUnit.id = :id' : '1=1', {
        id: productUnitIdFilter,
      }) // Áp dụng lọc id
      .getCount();

    // Lấy toàn bộ kết quả và xử lý phân trang sau
    const allResults = await this.productUnitRepository
      .createQueryBuilder('productUnit')
      .leftJoinAndSelect('productUnit.unit', 'unit')
      .leftJoinAndSelect('productUnit.productSample', 'productSample')
      .leftJoinAndSelect('productSample.productLine', 'productLine')
      .leftJoinAndSelect('productLine.productType', 'productType')
      .leftJoinAndMapMany(
        'productUnit.batches',
        'productUnit.batches',
        'batch',
        '1=1', // Không áp dụng điều kiện lọc tại đây
      )
      .andWhere(
        productSampleNameFilter ? 'productSample.name LIKE :name' : '1=1',
        {
          name: `%${productSampleNameFilter}%`,
        },
      )
      .andWhere(productUnitIdFilter ? 'productUnit.id = :id' : '1=1', {
        id: productUnitIdFilter,
      }) // Áp dụng lọc id
      .orderBy('productUnit.id', 'ASC') // Sắp xếp chính
      .addOrderBy('batch.expiredAt', 'ASC') // Sắp xếp phụ
      .getMany();

    // Lọc batches hợp lệ
    allResults.forEach((productUnit) => {
      productUnit.batches = productUnit.batches.filter(
        (batch) => batch.inventQuantity > 0 && batch.expiredAt > new Date(),
      );
    });

    // Thực hiện phân trang trong mã xử lý kết quả
    const paginatedResults = allResults.slice(skip, skip + pageSize);

    // Trả về kết quả
    return {
      meta: {
        current,
        pageSize,
        pages: Math.ceil(totalItems / pageSize),
        total: totalItems,
      },
      results: paginatedResults,
    };
  }
}
