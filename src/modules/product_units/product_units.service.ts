import {
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

@Injectable()
export class ProductUnitsService {
  constructor(
    @InjectRepository(ProductUnit)
    private productUnitRepository: Repository<ProductUnit>,
    @Inject(forwardRef(() => ProductSamplesService))
    private productSamplesService: ProductSamplesService,
    private unitsService: UnitsService,
  ) {}

  async create(createProductUnitDto: CreateProductUnitDto) {
    try {
      const { unitId, productSampleId, compareUnitId, ...rest } =
        createProductUnitDto;

      const productUnit = this.productUnitRepository.create({
        ...rest,
      });
      if (productSampleId) {
        const productSample =
          await this.productSamplesService.findOne(productSampleId);
        if (!productSample) {
          throw new NotFoundException(
            `Không tìm thấy mẫu sản phẩm với id ${productSampleId}`,
          );
        }
        productUnit.productSample = productSample;
      }

      if (unitId) {
        const unit = await this.unitsService.findOne(unitId);
        if (!unit) {
          throw new NotFoundException(`Không tìm thấy đơn vị với id ${unitId}`);
        }
        productUnit.unit = unit;
      }

      if (compareUnitId) {
        const compareUnit = await this.unitsService.findOne(compareUnitId);
        if (!compareUnit) {
          throw new NotFoundException(`Không tìm thấy đơn vị với id ${unitId}`);
        }
        productUnit.compareUnit = compareUnit;
      }

      console.log('>>>productUnit', productUnit);
      const savedProductUnit =
        await this.productUnitRepository.save(productUnit);
      return savedProductUnit;
    } catch (error) {
      console.error('Lỗi khi tạo productUnit', error);
      throw new Error('Có lỗi xảy ra khi tạo productUnit');
    }
  }

  async findAll(
    query: string,
    current: number,
    pageSize: number,
    productLineId: number,
  ) {
    const { filter, sort } = aqp(query);

    if (!current) current = 1;
    if (!pageSize) pageSize = 100;

    const productSampleNameFilter = filter.name ? filter.name : null;
    delete filter.current;
    delete filter.pageSize;
    delete filter.name;
    delete filter.productLineId;

    if (productLineId) {
      filter.productSample = { productLineId: productLineId };
    }

    const skip = (current - 1) * pageSize;

    const totalItems = await this.productUnitRepository
      .createQueryBuilder('productUnit')
      .leftJoinAndSelect('productUnit.productSample', 'productSample')
      .leftJoinAndSelect('productUnit.unit', 'unit')
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

    const results = await this.productUnitRepository
      .createQueryBuilder('productUnit')
      .leftJoinAndSelect('productUnit.productSample', 'productSample')
      .leftJoinAndSelect('productUnit.unit', 'unit')
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

  async findAllByIds(unitIds: number[]) {
    const roles = await this.productUnitRepository.findBy({
      id: In(unitIds),
    });

    return roles;
  }

  async findOne(id: number) {
    const productSample = await this.productUnitRepository.findOne({
      where: { id },
      relations: ['productUnits'],
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
}
