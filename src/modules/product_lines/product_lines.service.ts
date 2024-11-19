import {
  ConflictException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateProductLineDto } from './dto/create-product_line.dto';
import { UpdateProductLineDto } from './dto/update-product_line.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductLine } from './entities/product_line.entity';
import { Like, Repository } from 'typeorm';
import aqp from 'api-query-params';
import { ProductTypesService } from '../product_types/product_types.service';

@Injectable()
export class ProductLinesService {
  constructor(
    @InjectRepository(ProductLine)
    private productLineRepository: Repository<ProductLine>,
    private productTypesService: ProductTypesService,
  ) {}

  async create(createProductLineDto: CreateProductLineDto) {
    try {
      const existingProductLine = await this.productLineRepository.findOne({
        where: { name: createProductLineDto.name },
      });

      if (existingProductLine) {
        throw new ConflictException('Tên dòng sản phẩm đã tồn tại');
      }

      const productLine =
        this.productLineRepository.create(createProductLineDto);
      const productType = await this.productTypesService.findOne(
        +createProductLineDto.productTypeId,
      );

      if (!productType) {
        throw new NotFoundException('Không tìm thấy loại sản phẩm');
      }

      productLine.productType = productType;
      return await this.productLineRepository.save(productLine);
    } catch (error) {
      console.error('Lỗi khi tạo dòng sản phẩm:', error.message);
      throw new InternalServerErrorException('Không thể tạo dòng sản phẩm');
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

      const totalItems = await this.productLineRepository.count({
        where: filter,
      });
      const totalPages = Math.ceil(totalItems / pageSize);
      const skip = (current - 1) * pageSize;

      const options = {
        where: filter,
        relations: ['productType'],
        take: pageSize,
        skip: skip,
        order: sort || {},
      };

      const results = await this.productLineRepository.find(options);

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
      console.error('Lỗi khi tìm kiếm các dòng sản phẩm:', error.message);
      throw new InternalServerErrorException(
        'Không thể tìm kiếm các dòng sản phẩm',
      );
    }
  }

  async findOne(id: number) {
    try {
      const productLine = await this.productLineRepository.findOne({
        where: { id },
      });

      if (!productLine) {
        throw new NotFoundException('Không tìm thấy dòng sản phẩm');
      }

      return productLine;
    } catch (error) {
      console.error(`Lỗi khi tìm dòng sản phẩm với ID ${id}:`, error.message);
      throw new InternalServerErrorException('Không thể tìm dòng sản phẩm');
    }
  }

  async update(id: number, updateProductLineDto: UpdateProductLineDto) {
    try {
      const productLine = await this.productLineRepository.findOne({
        where: { id },
        relations: ['productType'],
      });
      if (!productLine) {
        throw new NotFoundException('Không tìm thấy dòng sản phẩm');
      }

      if (
        updateProductLineDto.name &&
        updateProductLineDto.name !== productLine.name
      ) {
        const existingProductLineByName =
          await this.productLineRepository.findOne({
            where: { name: updateProductLineDto.name },
          });
        if (existingProductLineByName) {
          throw new ConflictException('Tên dòng sản phẩm đã tồn tại');
        }
      }

      if (productLine.productType.id !== updateProductLineDto.productTypeId) {
        const newProductType = await this.productTypesService.findOne(
          +updateProductLineDto.productTypeId,
        );

        if (!newProductType) {
          throw new NotFoundException('Không tìm thấy loại sản phẩm');
        }

        productLine.productType = newProductType;
      }

      Object.assign(productLine, updateProductLineDto);
      return await this.productLineRepository.save(productLine);
    } catch (error) {
      console.error('Lỗi khi cập nhật dòng sản phẩm:', error.message);
      throw new InternalServerErrorException(
        'Không thể cập nhật dòng sản phẩm',
      );
    }
  }

  async remove(id: number) {
    try {
      const productLine = await this.findOne(id);
      if (!productLine) {
        throw new NotFoundException('Không tìm thấy dòng sản phẩm');
      }
      await this.productLineRepository.softDelete(id);
      return productLine;
    } catch (error) {
      console.error(`Lỗi khi xóa dòng sản phẩm với ID ${id}:`, error.message);
      throw new InternalServerErrorException('Không thể xóa dòng sản phẩm');
    }
  }
}
