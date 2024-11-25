import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductSampleDto } from './dto/create-product_sample.dto';
import { UpdateProductSampleDto } from './dto/update-product_sample.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Batch, Like, Repository } from 'typeorm';
import { ProductSample } from './entities/product_sample.entity';
import aqp from 'api-query-params';
import { ProductLinesService } from '../product_lines/product_lines.service';
import { CreateProductUnitDto } from '../product_units/dto/create-product_unit.dto';
import { ProductUnitsService } from '../product_units/product_units.service';
import { ProductUnit } from '../product_units/entities/product_unit.entity';
import { error } from 'console';
import { UpdateProductUnitDto } from '../product_units/dto/update-product_unit.dto';
import { Unit } from '../units/entities/unit.entity';

@Injectable()
export class ProductSamplesService {
  constructor(
    @InjectRepository(ProductSample)
    private productSampleRepository: Repository<ProductSample>,
    @InjectRepository(ProductUnit)
    private productUnitRepository: Repository<ProductUnit>,
    @InjectRepository(Unit)
    private unitRepository: Repository<Unit>,
    private productLinesService: ProductLinesService,
  ) {}

  async create(createProductSampleDto: CreateProductSampleDto, unitDetails: CreateProductUnitDto) {
    // Kiểm tra mẫu sản phẩm đã tồn tại
    const existingProductSample = await this.productSampleRepository.findOne({
      where: { name: createProductSampleDto.name },
    });
  
    if (existingProductSample) {
      throw new ConflictException('Tên mẫu sản phẩm đã tồn tại');
    }
  
    // Kiểm tra dòng sản phẩm
    const productLine = await this.productLinesService.findOne(createProductSampleDto.productLineId);
  
    if (!productLine) {
      throw new NotFoundException('Dòng sản phẩm không tồn tại');
    }
  
    // Lấy unitId từ unitIds nếu có
    const unitId = createProductSampleDto.unitIds?.[0]; // Lấy phần tử đầu tiên
  
    if (!unitId) {
      throw new error('Unit ID không hợp lệ');
    }
  
    // Tạo bản ghi product_sample
    const productSample = this.productSampleRepository.create({
      ...createProductSampleDto,
      productLine,
    });
  
    const savedProductSample = await this.productSampleRepository.save(productSample);
  
    // Tạo bản ghi product_unit
    const productUnit = this.productUnitRepository.create({
      ...unitDetails,
      productSample: { id: savedProductSample.id },
      unit: { id: unitId }, // Thêm unit ID
    });
  
    const savedProductUnit = await this.productUnitRepository.save(productUnit);
  
    return {
      ...savedProductSample,
      unit: savedProductUnit,
    };
  }
  
  async findAll(query: string, current: number, pageSize: number) {
    console.log(query);
    console.log(current, pageSize);

    const { filter, sort } = aqp(query);

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;
    delete filter.current;
    delete filter.pageSize;

    console.log('filter', filter);
    console.log('sort', sort);

    const productSampleNameFilter = filter.name ? filter.name : null;

    const totalItems = await this.productSampleRepository.count(filter);
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * pageSize;

    // const options = {
    //   where: filter,
    //   relations: ['productUnits', 'productLine'],
    //   take: pageSize,
    //   skip: skip,
    // };

    const results = await this.productSampleRepository
      .createQueryBuilder('productSample')
      .leftJoinAndSelect('productSample.productUnits', 'productUnits')
      .leftJoinAndSelect('productUnits.unit', 'unit')
      .leftJoinAndSelect('productSample.productLine', 'productLine')
      .leftJoinAndSelect('productLine.productType', 'productType')
      .where((qb) => {
        qb.where(filter);
        if(productSampleNameFilter) {
          qb.andWhere('productSample.name LIKE :name', {
            name: `%${productSampleNameFilter}%`
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

  async findByProductType(
    productTypeId: number,
    name?: string,
  ): Promise<
  {results: ProductSample[]}> {
    try {
      console.log('ProductType:', productTypeId);

      const queryBuilder = this.productSampleRepository
        .createQueryBuilder('productSample')
        .leftJoinAndSelect('productSample.productUnits', 'productUnits')
        .leftJoinAndSelect('productUnits.unit', 'unit')
        .leftJoinAndSelect('productSample.productLine', 'productLine')
        .leftJoinAndSelect('productLine.productType', 'productType')
        .where('productType.id = :productTypeId', { productTypeId });

      if (name) {
        queryBuilder .andWhere('productSample.name LIKE :name', { name: `%${name}%` });
      }
      console.log(queryBuilder .getSql());

      const results = await queryBuilder.getMany();
      return {
        results: results,
      };

    } catch (error) {
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
        .addSelect(subQuery => {
          return subQuery
            .select('batch.inbound_price')
            .from('Batch', 'batch')
            .where('batch.productUnitId = productUnits.id')
            .orderBy('batch.createdAt', 'DESC')
            .limit(1);
        }, 'latest_inbound_price')
        .addSelect(subQuery => {
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
          .filter(unit => productUnitIds.includes(unit.id))
          .map(unit => {
            const rawIndex = results.raw.findIndex(raw => raw['productUnits_id'] === unit.id);
            return {
              id: unit.id,
              sell_price: unit.sell_price,
              conversion_rate: unit.conversion_rate,
              image: unit.image,
              volumne: unit.volumne,
              unit: {
                id: unit.unit?.id,
                name: unit.unit?.name,
              },
              latest_inbound_price: rawIndex !== -1 ? results.raw[rawIndex]?.latest_inbound_price : null,
              average_inbound_price: rawIndex !== -1 ? results.raw[rawIndex]?.average_inbound_price : null,
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
      console.error('Error in findAllUnits:', error);
      throw error;
    }
  }
  
  

  async findOne(id: number) {
    const productSample = await this.productSampleRepository.findOne({
      where: { id },
    });

    if (!productSample) {
      throw new NotFoundException('Không tìm thấy mẫu sản phẩm');
    }

    return productSample;
  }

  async update(
    id: number,
    updateProductSampleDto: UpdateProductSampleDto,
    updateUnit: UpdateProductUnitDto,
  ) {
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
  
    Object.assign(productSample, updateProductSampleDto);
    await this.productSampleRepository.save(productSample);
  
    // Cập nhật bảng product_unit với conversion_rate = 1
    if (updateUnit.unitId) {
      const productUnit = await this.productUnitRepository.findOne({
        where: { productSample: { id }, conversion_rate: 1 },
      });
    
      console.log("updateUnit.unitId:::", updateUnit.unitId);
      console.log("productUnit:::", productUnit);
    
      if (!productUnit) {
        throw new NotFoundException(
          'Không tìm thấy đơn vị sản phẩm với conversion_rate = 1',
        );
      }
    
      // Tìm entity Unit tương ứng
      const unit = await this.unitRepository.findOne({
        where: { id: updateUnit.unitId },
      });
    
      if (!unit) {
        throw new NotFoundException('Không tìm thấy đơn vị tính với ID đã cung cấp');
      }
    
      // Cập nhật trường volumne và unit
      Object.assign(productUnit, {
        volumne: updateUnit.volumne || productUnit.volumne,
        unit: unit, // Gán entity Unit vào
      });
    
      // Lưu lại cập nhật
      await this.productUnitRepository.save(productUnit);
    
      console.log("Updated productUnit:::", productUnit);
    }
    
  
    // Trả về dữ liệu đã cập nhật
    return {
      productSample,
      productUnit: updateUnit.unitId ? updateUnit : null,
    };
  }
  

  async remove(id: number) {
    // Tìm product sample với id
    const productSample = await this.findOne(id);
    if (!productSample) {
      throw new NotFoundException('Không tìm thấy mẫu sản phẩm');
    }
  
    // Tìm tất cả các product unit có productSampleId là id vừa lấy
    const productUnits = await this.productUnitRepository.find({ where: { productSample } });
  
    if (productUnits.length > 0) {
      await this.productUnitRepository.softDelete(productUnits.map(unit => unit.id));
      // Hoặc nếu bạn muốn xóa vĩnh viễn:
      // await this.productUnitRepository.remove(productUnits); 
    }
  
    // Xóa product sample
    await this.productSampleRepository.softDelete(id)// Soft delete product sample
    
    return productSample;
  }
}
