import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Supplier } from './entities/supplier.entity';
import { Repository } from 'typeorm';
import aqp from 'api-query-params';
import { UpdateSupplierProductDto } from '../supplier_products/dto/update-supplier_product.dto';
import { SupplierProduct } from '../supplier_products/entities/supplier_product.entity';
import { ProductSamplesService } from '../product_samples/product_samples.service';
import { ProductUnitsService } from '../product_units/product_units.service';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
    @InjectRepository(SupplierProduct)
    private supplierProductRepository: Repository<SupplierProduct>,
    private productUnitsService: ProductUnitsService,
  ) {}

  async updateSupplierProduct(
    supplierId: number,
    updateSupplierProductDto: UpdateSupplierProductDto,
  ) {
    const supplier = await this.findOne(supplierId);
    if (!supplier) {
      throw new NotFoundException('Không tìm thấy nhà cung cấp');
    }

    const productUnitIds = updateSupplierProductDto.productUnitIds;
    await this.supplierProductRepository.update(
      { supplierId },
      { status: '0' },
    );

    const supplierProducts = [];

    for (const productUnitId of productUnitIds) {
      const productUnit = await this.productUnitsService.findOne(productUnitId);
      if (!productUnit) {
        throw new NotFoundException(
          `Không tìm thấy mẫu sản phẩm có id ${productUnit}`,
        );
      }

      let supplierProduct = await this.supplierProductRepository.findOne({
        where: { supplierId, productUnit },
      });

      if (supplierProduct) {
        supplierProduct.status = '1';
      } else {
        supplierProduct = new SupplierProduct();
        supplierProduct.supplierId = supplierId;
        supplierProduct.productUnitId = productUnitId;
        supplierProduct.status = '1';
      }

      supplierProducts.push(supplierProduct);
    }

    await this.supplierProductRepository.save(supplierProducts);
    return supplierProducts;
  }

  async create(createSupplierDto: CreateSupplierDto) {
    console.log('createSupplierDto', createSupplierDto);
    const existingSupplier = await this.supplierRepository.findOne({
      where: { name: createSupplierDto.name },
    });

    if (existingSupplier) {
      throw new ConflictException('Tên nhà cung cấp đã tồn tại');
    }
    const productUnitIds = createSupplierDto.productUnitIds;
    const supplier = this.supplierRepository.create(createSupplierDto);
    const newSupplier = await this.supplierRepository.save(supplier);
    const savedSupplier = this.updateSupplierProduct(newSupplier.id, {
      productUnitIds,
    });
    return savedSupplier;
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

    const totalItems = await this.supplierRepository.count({ where: filter });
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * pageSize;

    const options = {
      where: filter,
      relations: ['supplierProducts'],
      take: pageSize,
      skip: skip,
      order: sort,
    };

    const suppliers = await this.supplierRepository.find(options);

    const results = suppliers.map((supplier) => ({
      ...supplier,
      supplierProducts: supplier.supplierProducts
        .filter((product) => product.status === '1') // Only include products with status '1'
        .map((product) => product.productUnitId), // Map to productUnitId
    }));

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
    const supplier = await this.supplierRepository.findOne({
      where: { id },
    });

    if (!supplier) {
      throw new NotFoundException('Không tìm thấy nhà cung cấp');
    }

    return supplier;
  }

  async update(id: number, updateSupplierDto: UpdateSupplierDto) {
    const supplier = await this.findOne(id);
    if (!supplier) {
      throw new NotFoundException('Không tìm thấy nhà cung cấp');
    }

    if (updateSupplierDto.name && updateSupplierDto.name !== supplier.name) {
      const existingSupplierByName = await this.supplierRepository.findOne({
        where: { name: updateSupplierDto.name },
      });
      if (existingSupplierByName) {
        throw new ConflictException('Tên nhà cung cấp đã tồn tại');
      }
    }

    if (updateSupplierDto.phone && updateSupplierDto.phone !== supplier.phone) {
      const existingUserByPhone = await this.supplierRepository.findOne({
        where: { phone: updateSupplierDto.phone },
      });
      if (existingUserByPhone) {
        throw new ConflictException('Số điện thoại đã tồn tại');
      }
    }
    const { productUnitIds, ...rest } = updateSupplierDto;
    // const productUnitIds = updateSupplierDto.productUnitIds;

    const savedSupplier = await this.updateSupplierProduct(id, {
      productUnitIds,
    });

    console.log('savedSupplier', savedSupplier);

    Object.assign(supplier, rest);
    const savedUser = await this.supplierRepository.save(supplier);
    return savedUser;
  }

  async remove(id: number) {
    const supplier = await this.findOne(id);
    if (!supplier) {
      throw new NotFoundException('Không tìm thấy nhà cung cấp');
    }
    await this.supplierRepository.softDelete(id);
    return supplier;
  }
}
