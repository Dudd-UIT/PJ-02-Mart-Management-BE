import {
  ConflictException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
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
    try {
      const existingProductType = await this.productTypeRepository.findOne({
        where: { name: createProductTypeDto.name },
      });

      if (existingProductType) {
        throw new ConflictException('Tên loại sản phẩm đã tồn tại');
      }

      const productType =
        this.productTypeRepository.create(createProductTypeDto);
      return await this.productTypeRepository.save(productType);
    } catch (error) {
      console.error('Lỗi khi tạo loại sản phẩm:', error.message);
      throw new InternalServerErrorException('Không thể tạo loại sản phẩm');
    }
  }

  async findAll(query: string, current: number, pageSize: number) {
    try {
      const { filter, sort } = aqp(query);

      if (!current) current = 1;
      if (!pageSize) pageSize = 10;
      delete filter.current;
      delete filter.pageSize;

      if (filter.name) {
        filter.name = Like(`%${filter.name}%`);
      }

      const totalItems = await this.productTypeRepository.count({
        where: filter,
      });
      const totalPages = Math.ceil(totalItems / pageSize);
      const skip = (current - 1) * pageSize;

      const options = {
        where: filter,
        relations: [],
        take: pageSize,
        skip: skip,
        order: sort,
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
    } catch (error) {
      console.error('Lỗi khi tìm kiếm các loại sản phẩm:', error.message);
      throw new InternalServerErrorException(
        'Không thể tìm kiếm các loại sản phẩm',
      );
    }
  }

  async findOne(id: number) {
    try {
      const productType = await this.productTypeRepository.findOne({
        where: { id },
      });

      if (!productType) {
        throw new NotFoundException('Không tìm thấy loại sản phẩm');
      }

      return productType;
    } catch (error) {
      console.error(`Lỗi khi tìm loại sản phẩm với ID ${id}:`, error.message);
      throw new InternalServerErrorException('Không thể tìm loại sản phẩm');
    }
  }

  async update(id: number, updateProductTypeDto: UpdateProductTypeDto) {
    try {
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
      return await this.productTypeRepository.save(productType);
    } catch (error) {
      console.error('Lỗi khi cập nhật loại sản phẩm:', error.message);
      throw new InternalServerErrorException(
        'Không thể cập nhật loại sản phẩm',
      );
    }
  }

  async remove(id: number) {
    try {
      const productType = await this.findOne(id);
      if (!productType) {
        throw new NotFoundException('Không tìm thấy loại sản phẩm');
      }

      await this.productTypeRepository.softDelete(id);
      return productType;
    } catch (error) {
      console.error(`Lỗi khi xóa loại sản phẩm với ID ${id}:`, error.message);
      throw new InternalServerErrorException('Không thể xóa loại sản phẩm');
    }
  }
}
