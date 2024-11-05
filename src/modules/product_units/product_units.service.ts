import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductUnitDto } from './dto/create-product_unit.dto';
import { UpdateProductUnitDto } from './dto/update-product_unit.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ProductUnit } from './entities/product_unit.entity';
import { ProductSamplesService } from '../product_samples/product_samples.service';
import { UnitsService } from '../units/units.service';
import aqp from 'api-query-params';

@Injectable()
export class ProductUnitsService {
  constructor(
    @InjectRepository(ProductUnit)
    private productUnitRepository: Repository<ProductUnit>,
    private productSamplesService: ProductSamplesService,
    private unitsService: UnitsService,
  ) {}

  async create(createProductUnitDto: CreateProductUnitDto) {
    console.log('createProductUnitDto', createProductUnitDto);
    const { unitId, productSampleId, ...rest } = createProductUnitDto;

    const productSample =
      await this.productSamplesService.findOne(productSampleId);
    if (!productSample) {
      throw new NotFoundException(
        `Product sample with ID ${productSampleId} not found`,
      );
    }
    console.log('productSample', productSample);

    const unit = await this.unitsService.findOne(unitId);
    if (!unit) {
      throw new NotFoundException(`Unit with ID ${unitId} not found`);
    }
    console.log('unit', unit);

    const productUnit = this.productUnitRepository.create({
      ...rest,
      productSample,
      unit,
    });

    console.log('productUnit before save', productUnit);

    try {
      const savedProductUnit =
        await this.productUnitRepository.save(productUnit);
      console.log('savedProductUnit', savedProductUnit);
      return savedProductUnit;
    } catch (error) {
      console.error('Error saving productUnit:', error);
      throw new Error('Failed to create ProductUnit');
    }
  }

  // async findAll(query: string, current: number, pageSize: number) {
  //   console.log('>>>>>>');
  //   console.log(query);
  //   console.log(current, pageSize);

  //   const { filter, sort } = aqp(query);

  //   if (!current) current = 1;
  //   if (!pageSize) pageSize = 10;
  //   delete filter.current;
  //   delete filter.pageSize;

  //   console.log('filter', filter);
  //   console.log('sort', sort);

  //   const totalItems = await this.productUnitRepository.count(filter);
  //   const totalPages = Math.ceil(totalItems / pageSize);
  //   const skip = (current - 1) * pageSize;

  //   // Sử dụng QueryBuilder để chỉ chọn trường 'name' của 'productSample'
  //   const queryBuilder = this.productUnitRepository
  //     .createQueryBuilder('productUnit')
  //     .leftJoinAndSelect('productUnit.unit', 'unit')
  //     .leftJoinAndSelect('productUnit.productSample', 'productSample')
  //     .select([
  //       'productUnit', // Chọn toàn bộ thông tin của productUnit
  //       'productSample.name', // Chỉ chọn trường 'name' của productSample
  //       'unit.name', // Chọn toàn bộ thông tin của unit (hoặc chọn trường cụ thể nếu cần)
  //     ])
  //     .skip(skip)
  //     .take(pageSize);

  //   const results = await queryBuilder.getMany();

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

  async findAll(query: string, current: number, pageSize: number) {
    console.log(query);
    console.log(current, pageSize);

    const { filter, sort } = aqp(query);
    console.log('filter', filter);
    console.log('sort', sort);

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    // Extract the name filter if present for productSample.name
    const productSampleNameFilter = filter.name ? filter.name : null;
    delete filter.current;
    delete filter.pageSize;
    delete filter.name;

    // Calculate pagination details
    const skip = (current - 1) * pageSize;

    // Count total items with the productSample.name filter if provided
    const totalItems = await this.productUnitRepository
      .createQueryBuilder('productUnit')
      .leftJoinAndSelect('productUnit.productSample', 'productSample')
      .leftJoinAndSelect('productUnit.unit', 'unit') // Include the unit relation
      .where((qb) => {
        qb.where(filter);
        if (productSampleNameFilter) {
          qb.andWhere('productSample.name LIKE :name', {
            name: `%${productSampleNameFilter}%`,
          });
        }
      })
      .getCount();

    const totalPages = Math.ceil(totalItems / pageSize);

    // Fetch results with pagination and sorting
    const results = await this.productUnitRepository
      .createQueryBuilder('productUnit')
      .leftJoinAndSelect('productUnit.productSample', 'productSample')
      .leftJoinAndSelect('productUnit.unit', 'unit') // Include the unit relation
      .where((qb) => {
        qb.where(filter);
        if (productSampleNameFilter) {
          qb.andWhere('productSample.name LIKE :name', {
            name: `%${productSampleNameFilter}%`,
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
    console.log('current', current);
    console.log('pageSize', pageSize);
    // Set default values if not provided
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    // Handle the case when no IDs are provided
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

    // Calculate total items and pages based on the provided IDs
    const totalItems = await this.productUnitRepository
      .createQueryBuilder('productUnit')
      .leftJoinAndSelect('productUnit.productSample', 'productSample')
      .leftJoinAndSelect('productUnit.unit', 'unit')
      .where('productUnit.id IN (:...ids)', { ids })
      .getCount();
    console.log('totalItems', totalItems);

    const totalPages = Math.ceil(totalItems / pageSize);
    console.log('totalPages', totalPages);

    // Calculate the starting point for pagination
    const skip = (current - 1) * pageSize;
    console.log('skip', skip);

    // Fetch the product units based on the paginated ids
    const results = await this.productUnitRepository
      .createQueryBuilder('productUnit')
      .leftJoinAndSelect('productUnit.productSample', 'productSample')
      .leftJoinAndSelect('productUnit.unit', 'unit')
      .where('productUnit.id IN (:...ids)', { ids })
      .skip(skip)
      .take(pageSize)
      .getMany();

    console.log('results', results);

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
    await this.productUnitRepository.softDelete(id);
    return productUnit;
  }
}
