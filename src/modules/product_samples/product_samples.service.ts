import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductSampleDto } from './dto/create-product_sample.dto';
import { UpdateProductSampleDto } from './dto/update-product_sample.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductSample } from './entities/product_sample.entity';
import aqp from 'api-query-params';
import { ProductLinesService } from '../product_lines/product_lines.service';
import { ProductUnitsService } from '../product_units/product_units.service';
import { CreateProductSampleAndProductUnitDto } from './dto/create-productSample_productUnit.dto';
import { UpdateProductSampleAndProductUnitsDto } from './dto/update-productSample_productUnit.dto';

@Injectable()
export class ProductSamplesService {
  constructor(
    @InjectRepository(ProductSample)
    private productSampleRepository: Repository<ProductSample>,
    private productLinesService: ProductLinesService,
    @Inject(forwardRef(() => ProductUnitsService))
    private productUnitsService: ProductUnitsService,
  ) {}

  async createProductSampleAndProductUnits(
    createProductSampleAndProductUnitDto: CreateProductSampleAndProductUnitDto,
  ) {
    try {
      const { productSampleDto, productUnitsDto } =
        createProductSampleAndProductUnitDto;

      const produdctSample = await this.create(productSampleDto);

      const productSampleId = produdctSample.id;

      for (const productUnit of productUnitsDto) {
        await this.productUnitsService.create({
          ...productUnit,
          productSampleId,
        });
      }

      const savedProductUnit =
        await this.productSampleRepository.save(produdctSample);

      return savedProductUnit;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Lỗi khi tạo mẫu sản phẩm:', error.message);
      throw new InternalServerErrorException(
        'Có lỗi xảy ra trong quá trình tạo mẫu sản phẩm.',
      );
    }
  }

  async create(createProductSampleDto: CreateProductSampleDto) {
    const existingProductSample = await this.productSampleRepository.findOne({
      where: { name: createProductSampleDto.name },
    });
    if (existingProductSample) {
      throw new ConflictException('Tên mẫu sản phẩm đã tồn tại');
    }

    const productSample = this.productSampleRepository.create({
      ...createProductSampleDto,
    });
    if (createProductSampleDto.productLineId) {
      const productLine = await this.productLinesService.findOne(
        createProductSampleDto.productLineId,
      );
      if (!productLine) {
        throw new NotFoundException('Không tìm thấy dòng sản phẩm');
      }
      productSample.productLine = productLine;
    }

    const savedProductSample =
      await this.productSampleRepository.save(productSample);

    return savedProductSample;
  }

  // async findAll(query: any, current: number, pageSize: number) {
  //   const { filter, sort } = aqp(query);

  //   if (!current) current = 1;
  //   if (!pageSize) pageSize = 10;
  //   delete filter.current;
  //   delete filter.pageSize;

  //   console.log('filter', filter);
  //   const productSampleNameFilter = filter.name ? filter.name : null;
  //   delete filter.name;

  //   const productTypeId = filter.productTypeId ? filter.productTypeId : null;
  //   delete filter.productTypeId;

  //   const totalItemsQuery = this.productSampleRepository
  //     .createQueryBuilder('productSample')
  //     .leftJoin('productSample.productLine', 'productLine')
  //     .leftJoin('productLine.productType', 'productType')
  //     .where((qb) => {
  //       qb.where(filter);
  //       if (productSampleNameFilter) {
  //         qb.andWhere('productSample.name LIKE :name', {
  //           name: `%${productSampleNameFilter}%`,
  //         });
  //       }
  //       if (productTypeId) {
  //         qb.andWhere('productType.id = :productTypeId', {
  //           productTypeId,
  //         });
  //       }
  //     });

  //   const totalItems = await totalItemsQuery.getCount();
  //   const totalPages = Math.ceil(totalItems / pageSize);
  //   const skip = (current - 1) * pageSize;

  //   const results = await this.productSampleRepository
  //     .createQueryBuilder('productSample')
  //     .leftJoinAndSelect('productSample.productUnits', 'productUnits')
  //     .leftJoinAndSelect('productUnits.unit', 'unit')
  //     .leftJoinAndSelect('productUnits.compareUnit', 'compareUnit')
  //     .leftJoinAndSelect('productSample.productLine', 'productLine')
  //     .leftJoinAndSelect('productLine.productType', 'productType')
  //     .where((qb) => {
  //       qb.where(filter);
  //       if (productSampleNameFilter) {
  //         qb.andWhere('productSample.name LIKE :name', {
  //           name: `%${productSampleNameFilter}%`,
  //         });
  //       }
  //       if (productTypeId) {
  //         qb.andWhere('productType.id = :productTypeId', {
  //           productTypeId,
  //         });
  //       }
  //     })
  //     .take(pageSize)
  //     .skip(skip)
  //     .getMany();

  //   return {
  //     meta: {
  //       current,
  //       pageSize,
  //       pages: totalPages,
  //       total: totalItems,
  //     },
  //     results,
  //   };
  // }

  
  async findAll(query: any, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;
    delete filter.current;
    delete filter.pageSize;

    const productSampleNameFilter = filter.name ? filter.name : null;
    delete filter.name;

    const productTypeId = filter.productTypeId ? filter.productTypeId : null;
    delete filter.productTypeId;

    // Đếm tổng số sản phẩm mẫu thỏa điều kiện
    const totalItemsQuery = this.productSampleRepository
      .createQueryBuilder('productSample')
      .leftJoin('productSample.productLine', 'productLine')
      .leftJoin('productLine.productType', 'productType')
      .where((qb) => {
        qb.where(filter);
        if (productSampleNameFilter) {
          qb.andWhere('productSample.name LIKE :name', {
            name: `%${productSampleNameFilter}%`,
          });
        }
        if (productTypeId) {
          qb.andWhere('productType.id = :productTypeId', {
            productTypeId,
          });
        }
      });

    const totalItems = await totalItemsQuery.getCount();
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * pageSize;

    // Lấy danh sách sản phẩm và tất cả các batch liên quan
    const results = await this.productSampleRepository
      .createQueryBuilder('productSample')
      .leftJoinAndSelect('productSample.productUnits', 'productUnits')
      .leftJoinAndSelect('productUnits.unit', 'unit')
      .leftJoinAndSelect('productUnits.compareUnit', 'compareUnit')
      .leftJoinAndSelect('productSample.productLine', 'productLine')
      .leftJoinAndSelect('productLine.productType', 'productType')
      .leftJoinAndMapMany(
        'productUnits.batches',
        'productUnits.batch',
        'batch',
        'batch.inventQuantity > 0 AND batch.expiredAt > CURRENT_DATE',
      ) // Map tất cả các batch còn hàng và còn hạn
      .where((qb) => {
        qb.where(filter);
        if (productSampleNameFilter) {
          qb.andWhere('productSample.name LIKE :name', {
            name: `%${productSampleNameFilter}%`,
          });
        }
        if (productTypeId) {
          qb.andWhere('productType.id = :productTypeId', {
            productTypeId,
          });
        }
      })
      .orderBy('batch.expiredAt', 'ASC') // Sắp xếp batch theo hạn sử dụng gần nhất
      .addOrderBy('productUnits.id', 'ASC') // Thứ tự theo sản phẩm
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

  async findByProductType(
    productTypeId: number,
    name?: string,
  ): Promise<{ results: ProductSample[] }> {
    try {
      const queryBuilder = this.productSampleRepository
        .createQueryBuilder('productSample')
        .leftJoinAndSelect('productSample.productUnits', 'productUnits')
        .leftJoinAndSelect('productUnits.unit', 'unit')
        .leftJoinAndSelect('productSample.productLine', 'productLine')
        .leftJoinAndSelect('productLine.productType', 'productType')
        .where('productType.id = :productTypeId', { productTypeId });

      if (name) {
        queryBuilder.andWhere('productSample.name LIKE :name', {
          name: `%${name}%`,
        });
      }

      const results = await queryBuilder.getMany();
      return {
        results: results,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Error in findByProductType:', error);
      throw error;
    }
  }

  async findAllUnits(
    productUnitIds: number[],
    current: number = 1,
    pageSize: number = 10,
  ): Promise<{
    meta: { current: number; pageSize: number; pages: number; total: number };
    results: any[];
  }> {
    try {
      current = isNaN(current) ? 1 : current;
      pageSize = isNaN(pageSize) ? 10 : pageSize;
      const skip = (current - 1) * pageSize;

      if (!productUnitIds || productUnitIds.length === 0) {
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

      const queryBuilder = this.productSampleRepository
        .createQueryBuilder('productSample')
        .leftJoinAndSelect('productSample.productUnits', 'productUnits')
        .leftJoinAndSelect('productUnits.unit', 'unit')
        .leftJoin('productUnits.batch', 'batch')
        .select([
          'productSample.id',
          'productSample.name',
          'productSample.description',
          'productUnits.id',
          'productUnits.sell_price',
          'productUnits.conversion_rate',
          'productUnits.image',
          'productUnits.volumne',
          'unit.id',
          'unit.name',
        ])
        .addSelect((subQuery) => {
          return subQuery
            .select('batch.inbound_price')
            .from('Batch', 'batch')
            .where('batch.productUnitId = productUnits.id')
            .orderBy('batch.createdAt', 'DESC')
            .limit(1);
        }, 'latest_inbound_price')
        .addSelect((subQuery) => {
          return subQuery
            .select('AVG(batch.inbound_price)')
            .from('Batch', 'batch')
            .where('batch.productUnitId = productUnits.id');
        }, 'average_inbound_price')
        .where('productUnits.id IN (:...productUnitIds)', { productUnitIds })
        .groupBy('productUnits.id')
        .take(pageSize)
        .skip(skip);

      const totalItems = await queryBuilder.getCount();
      const totalPages = Math.ceil(totalItems / pageSize);
      const results = await queryBuilder.getRawAndEntities();

      const transformedResults = results.entities.map((sample, index) => ({
        id: sample.id,
        name: sample.name,
        description: sample.description,
        productUnits: sample.productUnits
          .filter((unit) => productUnitIds.includes(unit.id))
          .map((unit) => {
            const rawIndex = results.raw.findIndex(
              (raw) => raw['productUnits_id'] === unit.id,
            );
            return {
              id: unit.id,
              sell_price: unit.sellPrice,
              conversion_rate: unit.conversionRate,
              image: unit.image,
              volumne: unit.volumne,
              unit: {
                id: unit.unit?.id,
                name: unit.unit?.name,
              },
              latest_inbound_price:
                rawIndex !== -1
                  ? results.raw[rawIndex]?.latest_inbound_price
                  : null,
              average_inbound_price:
                rawIndex !== -1
                  ? results.raw[rawIndex]?.average_inbound_price
                  : null,
            };
          }),
      }));

      return {
        meta: {
          current,
          pageSize,
          pages: totalPages,
          total: totalItems,
        },
        results: transformedResults,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Error in findAllUnits:', error);
      throw error;
    }
  }

  async findOne(id: number) {
    const productSample = await this.productSampleRepository.findOne({
      where: { id },
      relations: ['productUnits.unit'],
    });

    if (!productSample) {
      throw new NotFoundException('Không tìm thấy mẫu sản phẩm');
    }

    return productSample;
  }

  async update(id: number, updateProductSampleDto: UpdateProductSampleDto) {
    try {
      const productSample = await this.findOne(id);
      if (!productSample) {
        throw new NotFoundException('Không tìm thấy mẫu sản phẩm');
      }

      if (
        updateProductSampleDto.name &&
        updateProductSampleDto.name !== productSample.name
      ) {
        const existingProductSampleByName =
          await this.productSampleRepository.findOne({
            where: { name: updateProductSampleDto.name },
          });
        if (existingProductSampleByName) {
          throw new ConflictException('Tên mẫu sản phẩm đã tồn tại');
        }
      }

      if (updateProductSampleDto.productLineId) {
        const productLine = await this.productLinesService.findOne(
          updateProductSampleDto.productLineId,
        );

        if (!productLine) {
          throw new NotFoundException('Dòng sản phẩm không tồn tại');
        }
      }
      Object.assign(productSample, updateProductSampleDto);
      return await this.productSampleRepository.save(productSample);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error(
        `Lỗi khi cập nhật mẫu sản phẩm với id: ${id}`,
        error.message,
      );
      throw new InternalServerErrorException(
        'Không thể cập nhật mẫu sản phẩm, vui lòng thử lại sau.',
      );
    }
  }
  async updateProductSampleAndProductUnits(
    id: number,
    updateProductSampleAndProductUnitsDto: UpdateProductSampleAndProductUnitsDto,
  ) {
    // Bắt đầu transaction
    const queryRunner =
      this.productSampleRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { productSampleDto, productUnitsDto } =
        updateProductSampleAndProductUnitsDto;

      // Gọi service để cập nhật mẫu sản phẩm
      const updatedProductSample = await this.update(id, productSampleDto);

      // Xóa các productUnit cũ bằng ProductUnitsService
      const existingProductUnits = updatedProductSample.productUnits;
      for (const productUnit of existingProductUnits) {
        await this.productUnitsService.remove(productUnit.id);
      }

      // Tạo mới các productUnit bằng ProductUnitsService
      const newProductUnits = [];
      for (const productUnitDto of productUnitsDto) {
        const createdProductUnit = await this.productUnitsService.create({
          ...productUnitDto,
          productSampleId: id, // Gán quan hệ với mẫu sản phẩm
        });
        newProductUnits.push(createdProductUnit);
      }

      // Cập nhật danh sách productUnits trong ProductSample
      updatedProductSample.productUnits = newProductUnits;

      // Lưu lại ProductSample qua repository
      const savedProductSample =
        await queryRunner.manager.save(updatedProductSample);

      // Commit transaction
      await queryRunner.commitTransaction();

      return savedProductSample;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Lỗi khi cập nhật mẫu sản phẩm:', error.message);

      // Rollback transaction nếu có lỗi
      await queryRunner.rollbackTransaction();

      throw new InternalServerErrorException(
        'Có lỗi xảy ra trong quá trình cập nhật mẫu sản phẩm.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  // async updateProductSampleAndProductUnits(
  //   id: number,
  //   updateProductSampleAndProductUnitsDto: UpdateProductSampleAndProductUnitsDto,
  // ) {
  //   // Bắt đầu transaction
  //   const queryRunner =
  //     this.productSampleRepository.manager.connection.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();

  //   try {
  //     const { productSampleDto, productUnitsDto } =
  //       updateProductSampleAndProductUnitsDto;

  //     // Cập nhật thông tin mẫu sản phẩm
  //     const productSample = await this.update(id, productSampleDto);
  //     const productUnits = productSample.productUnits;

  //     // Xóa các productUnit cũ
  //     for (const productUnit of productUnits) {
  //       await queryRunner.manager
  //         .getRepository(ProductUnit)
  //         .delete(productUnit.id);
  //     }

  //     // Thêm các productUnit mới
  //     const newProductUnits = productUnitsDto.map((productUnitDto) => {
  //       return queryRunner.manager.getRepository(ProductUnit).create({
  //         ...productUnitDto,
  //         productSample: { id }, // Gán quan hệ với productSample
  //       });
  //     });

  //     // Lưu các productUnit mới
  //     const savedProductUnits = await queryRunner.manager
  //       .getRepository(ProductUnit)
  //       .save(newProductUnits);

  //     // Cập nhật lại danh sách productUnits trong productSample
  //     productSample.productUnits = savedProductUnits;

  //     // Lưu productSample
  //     const savedProductSample = await queryRunner.manager
  //       .getRepository(ProductSample)
  //       .save(productSample);

  //     // Commit transaction
  //     await queryRunner.commitTransaction();

  //     return savedProductSample;
  //   } catch (error) {
  //     console.error('Lỗi khi cập nhật mẫu sản phẩm:', error.message);

  //     // Rollback transaction nếu có lỗi
  //     await queryRunner.rollbackTransaction();

  //     throw new InternalServerErrorException(
  //       'Có lỗi xảy ra trong quá trình cập nhật mẫu sản phẩm.',
  //     );
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }

  // async update(
  //   id: number,
  //   updateProductSampleDto: UpdateProductSampleDto,
  //   updateUnit: UpdateProductUnitDto,
  // ) {
  //   const productSample = await this.findOne(id);
  //   if (!productSample) {
  //     throw new NotFoundException('Không tìm thấy mẫu sản phẩm');
  //   }

  //   if (
  //     updateProductSampleDto.name &&
  //     updateProductSampleDto.name !== productSample.name
  //   ) {
  //     const existingProductSampleByName =
  //       await this.productSampleRepository.findOne({
  //         where: { name: updateProductSampleDto.name },
  //       });
  //     if (existingProductSampleByName) {
  //       throw new ConflictException('Tên mẫu sản phẩm đã tồn tại');
  //     }
  //   }

  //   Object.assign(productSample, updateProductSampleDto);
  //   await this.productSampleRepository.save(productSample);

  //   // Cập nhật bảng product_unit với conversion_rate = 1
  //   if (updateUnit.unitId) {
  //     const productUnit = await this.productUnitRepository.findOne({
  //       where: { productSample: { id }, conversionRate: 1 },
  //     });

  //     console.log('updateUnit.unitId:::', updateUnit.unitId);
  //     console.log('productUnit:::', productUnit);

  //     if (!productUnit) {
  //       throw new NotFoundException(
  //         'Không tìm thấy đơn vị sản phẩm với conversion_rate = 1',
  //       );
  //     }

  //     // Tìm entity Unit tương ứng
  //     const unit = await this.unitRepository.findOne({
  //       where: { id: updateUnit.unitId },
  //     });

  //     if (!unit) {
  //       throw new NotFoundException(
  //         'Không tìm thấy đơn vị tính với ID đã cung cấp',
  //       );
  //     }

  //     // Cập nhật trường volumne và unit
  //     Object.assign(productUnit, {
  //       volumne: updateUnit.volumne || productUnit.volumne,
  //       unit: unit, // Gán entity Unit vào
  //     });

  //     // Lưu lại cập nhật
  //     await this.productUnitRepository.save(productUnit);

  //     console.log('Updated productUnit:::', productUnit);
  //   }

  //   // Trả về dữ liệu đã cập nhật
  //   return {
  //     productSample,
  //     productUnit: updateUnit.unitId ? updateUnit : null,
  //   };
  // }

  async remove(id: number) {
    const productSample = await this.findOne(id);
    if (!productSample) {
      throw new NotFoundException('Không tìm thấy mẫu sản phẩm');
    }
    await this.productSampleRepository.softDelete(id); // Soft delete product sample

    return productSample;
  }
}
