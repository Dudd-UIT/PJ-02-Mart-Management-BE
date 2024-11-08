import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupplierProduct } from './entities/supplier_product.entity';
import aqp from 'api-query-params';
import { SuppliersService } from '../suppliers/suppliers.service';
import { ProductSamplesService } from '../product_samples/product_samples.service';
import { UpdateSupplierProductDto } from './dto/update-supplier_product.dto';

@Injectable()
export class SupplierProductsService {
  constructor(
    @InjectRepository(SupplierProduct)
    private supplierProductRepository: Repository<SupplierProduct>,
    // private suppliersService: SuppliersService,
    // private productSamplesService: ProductSamplesService,
  ) {}

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;
    delete filter.current;
    delete filter.pageSize;
    filter.status = '1';

    const totalItems = await this.supplierProductRepository.count({
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

    const results = await this.supplierProductRepository.find(options);

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

  // async update(
  //   supplierId: number,
  //   updateSupplierProductDto: UpdateSupplierProductDto,
  // ) {
  //   const supplier = await this.suppliersService.findOne(supplierId);
  //   if (!supplier) {
  //     throw new NotFoundException('Không tìm thấy nhà cung cấp');
  //   }

  //   const productSampleIds = updateSupplierProductDto.productSampleIds;
  //   await this.supplierProductRepository.update(
  //     { supplierId },
  //     { status: '0' },
  //   );

  //   const supplierProducts = [];

  //   for (const productSampleId of productSampleIds) {
  //     const productSample =
  //       await this.productSamplesService.findOne(productSampleId);
  //     if (!productSample) {
  //       throw new NotFoundException(
  //         `Không tìm thấy mẫu sản phẩm có id ${productSampleId}`,
  //       );
  //     }

  //     let supplierProduct = await this.supplierProductRepository.findOne({
  //       where: { supplierId, productSampleId },
  //     });

  //     if (supplierProduct) {
  //       supplierProduct.status = '1';
  //     } else {
  //       supplierProduct = new SupplierProduct();
  //       supplierProduct.supplierId = supplierId;
  //       supplierProduct.productSampleId = productSampleId;
  //       supplierProduct.status = '1';
  //     }

  //     supplierProducts.push(supplierProduct);
  //   }

  //   await this.supplierProductRepository.save(supplierProducts);
  //   return supplierProducts;
  // }
}
