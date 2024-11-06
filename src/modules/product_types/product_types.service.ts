import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductTypeDto } from './dto/create-product_type.dto';
import { UpdateProductTypeDto } from './dto/update-product_type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { ProductType } from './entities/product_type.entity';
import aqp from 'api-query-params';

@Injectable()
export class ProductTypesService {
  constructor(
    @InjectRepository(ProductType)
    private productTypeRepository: Repository<ProductType>,
  ) {}

  async create(createProductTypeDto: CreateProductTypeDto) {
    const existingProductType = await this.productTypeRepository.findOne({
      where: { name: createProductTypeDto.name },
    });

    if (existingProductType) {
      throw new ConflictException('Tên loại sản phẩm đã tồn tại');
    }

    const productType = this.productTypeRepository.create(createProductTypeDto);

    const savedProductType = this.productTypeRepository.save(productType);
    return savedProductType;
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

    if (filter.name) {
      filter.name = Like(`%${filter.name}%`);
    }

    const totalItems = await this.productTypeRepository.count(filter);
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * pageSize;

    const options = {
      where: filter,
      relations: [],
      take: pageSize,
      skip: skip,
    };

    const results = await this.productTypeRepository.find(options);

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
    const productType = await this.productTypeRepository.findOne({
      where: { id },
    });

    if (!productType) {
      throw new NotFoundException('Không tìm thấy loại sản phẩm');
    }

    return productType;
  }

  async update(id: number, updateProductTypeDto: UpdateProductTypeDto) {
    const productType = await this.findOne(id);
    if (!productType) {
      throw new NotFoundException('Không tìm thấy loại sản phẩm');
    }

    if (
      updateProductTypeDto.name &&
      updateProductTypeDto.name !== productType.name
    ) {
      const existingProductTypeByName =
        await this.productTypeRepository.findOne({
          where: { name: updateProductTypeDto.name },
        });
      if (existingProductTypeByName) {
        throw new ConflictException('Tên loại sản phẩm đã tồn tại');
      }
    }

    Object.assign(productType, updateProductTypeDto);
    const savedUser = await this.productTypeRepository.save(productType);
    return savedUser;
  }

  async remove(id: number) {
    const productType = await this.findOne(id);
    if (!productType) {
      throw new NotFoundException('Không tìm thấy loại sản phẩm');
    }
    await this.productTypeRepository.softDelete(id);
    return productType;
  }
}
