import {
  ConflictException,
  Injectable,
  NotFoundException,
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
    const existingProductLine = await this.productLineRepository.findOne({
      where: { name: createProductLineDto.name },
    });

    if (existingProductLine) {
      throw new ConflictException('Tên dòng sản phẩm đã tồn tại');
    }

    const productLine = this.productLineRepository.create(createProductLineDto);
    const productType = await this.productTypesService.findOne(
      +createProductLineDto.productTypeId,
    );

    productLine.productType = productType;
    const savedProductLine = this.productLineRepository.save(productLine);
    return savedProductLine;
  }

  async findAll(query: string, current: number, pageSize: number) {
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
  }

  async findOne(id: number) {
    const productLine = await this.productLineRepository.findOne({
      where: { id },
    });

    if (!productLine) {
      throw new NotFoundException('Không tìm thấy dòng sản phẩm');
    }

    return productLine;
  }

  async update(id: number, updateProductLineDto: UpdateProductLineDto) {
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

      productLine.productType = newProductType;

      if (!newProductType) {
        throw new NotFoundException('Không tìm thấy loại sản phẩm mới');
      }

      productLine.productType = newProductType;
    }

    Object.assign(productLine, updateProductLineDto);
    const saveProductLine = await this.productLineRepository.save(productLine);
    return saveProductLine;
  }

  async remove(id: number) {
    const productLine = await this.findOne(id);
    if (!productLine) {
      throw new NotFoundException('Không tìm thấy dòng sản phẩm');
    }
    await this.productLineRepository.softDelete(id);
    return productLine;
  }
}
