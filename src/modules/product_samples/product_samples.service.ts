import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductSampleDto } from './dto/create-product_sample.dto';
import { UpdateProductSampleDto } from './dto/update-product_sample.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { ProductSample } from './entities/product_sample.entity';
import aqp from 'api-query-params';
import { ProductLinesService } from '../product_lines/product_lines.service';

@Injectable()
export class ProductSamplesService {
  constructor(
    @InjectRepository(ProductSample)
    private productSampleRepository: Repository<ProductSample>,
    private productLinesService: ProductLinesService,
  ) {}

  async create(createProductSampleDto: CreateProductSampleDto) {
    const existingProductSample = await this.productSampleRepository.findOne({
      where: { name: createProductSampleDto.name },
    });

    if (existingProductSample) {
      throw new ConflictException('Tên mẫu sản phẩm đã tồn tại');
    }

    const productSample = this.productSampleRepository.create(
      createProductSampleDto,
    );
    const productLine = await this.productLinesService.findOne(
      +createProductSampleDto.productLineId,
    );

    productSample.productLine = productLine;
    const savedProductSample = this.productSampleRepository.save(productSample);
    return savedProductSample;
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

    const totalItems = await this.productSampleRepository.count(filter);
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * pageSize;

    const options = {
      where: filter,
      relations: [],
      take: pageSize,
      skip: skip,
    };

    const results = await this.productSampleRepository.find(options);

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
    const productSample = await this.productSampleRepository.findOne({
      where: { id },
    });

    if (!productSample) {
      throw new NotFoundException('Không tìm thấy mẫu sản phẩm');
    }

    return productSample;
  }

  async update(id: number, updateProductSampleDto: UpdateProductSampleDto) {
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
    const savedUser = await this.productSampleRepository.save(productSample);
    return savedUser;
  }

  async remove(id: number) {
    const productSample = await this.findOne(id);
    if (!productSample) {
      throw new NotFoundException('Không tìm thấy mẫu sản phẩm');
    }
    await this.productSampleRepository.softDelete(id);
    return productSample;
  }
}
