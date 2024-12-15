import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Inject,
  forwardRef,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupplierProduct } from './entities/supplier_product.entity';
import aqp from 'api-query-params';
import { UpdateSupplierProductDto } from './dto/update-supplier_product.dto';
import { ProductUnitsService } from '../product_units/product_units.service';
import { SuppliersService } from '../suppliers/suppliers.service';

@Injectable()
export class SupplierProductsService {
  constructor(
    @InjectRepository(SupplierProduct)
    private supplierProductRepository: Repository<SupplierProduct>,
    private productUnitsService: ProductUnitsService,
    @Inject(forwardRef(() => SuppliersService))
    private suppliersService: SuppliersService,
  ) {}

  async findAll(query: string, current: number, pageSize: number) {
    try {
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
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Lỗi khi truy vấn sản phẩm nhà cung cấp:', error.message);
      throw new InternalServerErrorException(
        'Không thể truy xuất dữ liệu sản phẩm nhà cung cấp, vui lòng thử lại sau.',
      );
    }
  }

  async update(
    supplierId: number,
    updateSupplierProductDto: UpdateSupplierProductDto,
  ) {
    try {
      const supplier = await this.suppliersService.findOne(supplierId);
      if (!supplier) {
        throw new NotFoundException('Không tìm thấy nhà cung cấp');
      }

      const productUnitIds = updateSupplierProductDto.productUnitIds;
      await this.supplierProductRepository.update(
        { supplierId },
        { status: 0 },
      );

      const supplierProducts = [];

      for (const productUnitId of productUnitIds) {
        const productUnit =
          await this.productUnitsService.findOne(productUnitId);
        if (!productUnit) {
          throw new NotFoundException(`Không tìm thấy một số mẫu sản phẩm`);
        }

        let supplierProduct = await this.supplierProductRepository.findOne({
          where: { supplierId, productUnit },
        });

        if (supplierProduct) {
          supplierProduct.status = 1;
        } else {
          supplierProduct = new SupplierProduct();
          supplierProduct.supplierId = supplierId;
          supplierProduct.productUnitId = productUnitId;
          supplierProduct.status = 1;
        }

        supplierProducts.push(supplierProduct);
      }

      await this.supplierProductRepository.save(supplierProducts);
      return supplierProducts;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Lỗi khi cập nhật sản phẩm nhà cung cấp:', error.message);
      throw new InternalServerErrorException(
        'Không thể cập nhật sản phẩm nhà cung cấp, vui lòng thử lại sau.',
      );
    }
  }
}
