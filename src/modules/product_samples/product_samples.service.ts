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
import { RecommendationService } from '../recommendation/recommendation.service';

@Injectable()
export class ProductSamplesService {
  constructor(
    @InjectRepository(ProductSample)
    private productSampleRepository: Repository<ProductSample>,
    private productLinesService: ProductLinesService,
    private recommendationService: RecommendationService,
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

  async findAllProductSampleAndBatches(
    query: any,
    current: number,
    pageSize: number,
  ) {
    const { filter, sort } = aqp(query);

    if (!current || current < 1) current = 1;
    if (!pageSize || pageSize < 1) pageSize = 10;

    delete filter.current;
    delete filter.pageSize;

    const productSampleNameFilter = filter.name ? filter.name : null;
    delete filter.name;

    const productTypeId = filter.productTypeId ? filter.productTypeId : null;
    delete filter.productTypeId;

    const skip = (current - 1) * pageSize;

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
          qb.andWhere('productType.id = :productTypeId', { productTypeId });
        }
      });

    const totalItems = await totalItemsQuery.getCount();
    const totalPages = Math.ceil(totalItems / pageSize);

    // Lấy danh sách sản phẩm mẫu và danh sách productUnits với batches hợp lệ
    const results = await this.productSampleRepository
      .createQueryBuilder('productSample')
      .leftJoinAndSelect('productSample.productUnits', 'productUnits')
      .leftJoinAndSelect('productUnits.unit', 'unit')
      .leftJoinAndSelect('productUnits.compareUnit', 'compareUnit')
      .leftJoinAndSelect('productSample.productLine', 'productLine')
      .leftJoinAndSelect('productLine.productType', 'productType')
      .leftJoinAndMapMany(
        'productUnits.batches',
        'productUnits.batches',
        'batch',
        'batch.inventQuantity > 0 AND batch.expiredAt > CURRENT_DATE',
      ) // Map danh sách batch hợp lệ
      .where((qb) => {
        qb.where(filter);
        if (productSampleNameFilter) {
          qb.andWhere('productSample.name LIKE :name', {
            name: `%${productSampleNameFilter}%`,
          });
        }
        if (productTypeId) {
          qb.andWhere('productType.id = :productTypeId', { productTypeId });
        }
      })
      .orderBy('batch.expiredAt', 'ASC') // Sắp xếp batch theo hạn sử dụng
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

  async findAllShopping(query: any, current: number, pageSize: number) {
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
        'productUnits.batches',
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

  async findAllRecommend(
    query: any,
    current: number,
    pageSize: number,
    customerId: number,
  ) {
    const { filter, sort } = aqp(query);

    console.log('filter:::', filter);
    console.log('customerId:::', customerId);

    delete filter.customerId;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;
    delete filter.current;
    delete filter.pageSize;

    const productSampleNameFilter = filter.name ? filter.name : null;
    delete filter.name;

    const productTypeId = filter.productTypeId ? filter.productTypeId : null;
    delete filter.productTypeId;

    // Lấy danh sách sản phẩm đề xuất từ recommendation service
    const recommendations =
      await this.recommendationService.getRecommendations(customerId);

    console.log('recommendations:::', recommendations);
    const recommendedProductIds = recommendations.map(
      (item) => item.product_id,
    );
    const productScores = recommendations.reduce((acc, item) => {
      acc[item.product_id] = item.score;
      return acc;
    }, {});

    // Đếm tổng số sản phẩm thỏa điều kiện
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
        qb.andWhere('productSample.id IN (:...recommendedProductIds)', {
          recommendedProductIds,
        });
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
        'productUnits.batches',
        'batch',
        'batch.inventQuantity > 0 AND batch.expiredAt > CURRENT_DATE',
      )
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
        qb.andWhere('productSample.id IN (:...recommendedProductIds)', {
          recommendedProductIds,
        });
      })
      // Thêm đoạn này vào trước các orderBy khác
      .addSelect(
        `CASE WHEN productSample.id IN (:...highScoreIds) THEN 1 ELSE 0 END`,
        'score',
      )
      .setParameter(
        'highScoreIds',
        recommendedProductIds.filter((id) => productScores[id] === 1).length > 0
          ? recommendedProductIds.filter((id) => productScores[id] === 1)
          : [-1], // Giá trị mặc định để tránh IN ()
      )
      .orderBy('score', 'DESC') // Sắp xếp theo score giảm dần
      .addOrderBy('batch.expiredAt', 'ASC')
      .addOrderBy('productUnits.id', 'ASC')
      .take(pageSize)
      .skip(skip)
      .getMany();

    // Thêm `score` từ danh sách đề xuất vào kết quả
    const resultsWithScores = results.map((product) => ({
      ...product,
      score: productScores[product.id] || 0, // Nếu không có trong danh sách thì mặc định score = 0
    }));

    console.log('resultsWithScores:::', resultsWithScores);

    return {
      meta: {
        current,
        pageSize,
        pages: totalPages,
        total: totalItems,
      },
      results: resultsWithScores,
    };
  }

  async findAll(query: any, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    // Xóa các tham số không cần thiết khỏi filter
    delete filter.current;
    delete filter.pageSize;

    const productSampleNameFilter = filter.name ? filter.name : null;
    const productTypeId = filter.productTypeId ? filter.productTypeId : null;
    delete filter.productTypeId;

    // Tính tổng số bản ghi dựa trên query thực tế
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

    // Lấy danh sách kết quả
    const results = await this.productSampleRepository
      .createQueryBuilder('productSample')
      .leftJoinAndSelect('productSample.productUnits', 'productUnits')
      .leftJoinAndSelect('productUnits.unit', 'unit')
      .leftJoinAndSelect('productUnits.batches', 'batches')
      .leftJoinAndSelect('productUnits.compareUnit', 'compareUnit')
      .leftJoinAndSelect('productSample.productLine', 'productLine')
      .leftJoinAndSelect('productLine.productType', 'productType')
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
      // .orderBy('batches.createdAt', 'DESC') // Sắp xếp batches theo createdAt giảm dần
      .take(pageSize)
      .skip(skip)
      .getMany();

    // Log kết quả
    console.log('meta', {
      current,
      pageSize,
      pages: totalPages,
      total: totalItems,
    });
    console.log('results', results);

    // Trả về kết quả
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
      // Xử lý tham số mặc định
      current = isNaN(current) ? 1 : current;
      pageSize = isNaN(pageSize) ? 10 : pageSize;
      const skip = (current - 1) * pageSize;

      // Trường hợp không có ID được cung cấp
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

      // Query dữ liệu
      const queryBuilder = this.productSampleRepository
        .createQueryBuilder('productSample')
        .leftJoinAndSelect('productSample.productUnits', 'productUnits')
        .leftJoinAndSelect('productUnits.unit', 'unit')
        .leftJoin('productUnits.batches', 'batch') // Đúng theo mối quan hệ
        .select([
          'productSample.id',
          'productSample.name',
          'productSample.description',
          'productUnits.id',
          'productUnits.sellPrice',
          'productUnits.conversionRate',
          'productUnits.image',
          'productUnits.volumne',
          'unit.id',
          'unit.name',
        ])
        .addSelect((subQuery) => {
          return subQuery
            .select('batch.inboundPrice')
            .from('Batch', 'batch')
            .where('batch.productUnitId = productUnits.id')
            .orderBy('batch.createdAt', 'DESC')
            .limit(1);
        }, 'latest_inbound_price')
        .addSelect((subQuery) => {
          return subQuery
            .select('AVG(batch.inboundPrice)')
            .from('Batch', 'batch')
            .where('batch.productUnitId = productUnits.id');
        }, 'average_inbound_price')
        .where('productUnits.id IN (:...productUnitIds)', { productUnitIds })
        .groupBy('productUnits.id')
        .take(pageSize)
        .skip(skip);

      const totalItems = await queryBuilder.getCount();
      const totalPages = Math.ceil(totalItems / pageSize);

      // Lấy dữ liệu thô và ánh xạ kết quả
      const results = await queryBuilder.getRawAndEntities();
      const transformedResults = results.entities.map((sample) => ({
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
      // Xử lý lỗi
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
