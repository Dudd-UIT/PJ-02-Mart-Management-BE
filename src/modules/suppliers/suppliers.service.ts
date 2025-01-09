import {
  ConflictException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Inject,
  forwardRef,
  BadRequestException,
} from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Supplier } from './entities/supplier.entity';
import { Like, Repository } from 'typeorm';
import aqp from 'api-query-params';
import { SupplierProductsService } from '../supplier_products/supplier_products.service';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
    @Inject(forwardRef(() => SupplierProductsService))
    private supplierProductsService: SupplierProductsService,
  ) {}

  async create(createSupplierDto: CreateSupplierDto) {
    try {
      const existingSupplierByName = await this.supplierRepository.findOne({
        where: { name: createSupplierDto.name },
      });

      if (existingSupplierByName) {
        throw new ConflictException('Tên nhà cung cấp đã tồn tại');
      }

      const existingSupplierByPhone = await this.supplierRepository.findOne({
        where: { phone: createSupplierDto.phone },
      });
      if (existingSupplierByPhone) {
        throw new ConflictException('Số điện thoại nhà cung cấp đã tồn tại');
      }

      const productUnitIds = createSupplierDto.productUnitIds;
      const supplier = this.supplierRepository.create(createSupplierDto);
      const newSupplier = await this.supplierRepository.save(supplier);
      return await this.supplierProductsService.update(newSupplier.id, {
        productUnitIds,
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Lỗi khi tạo nhà cung cấp:', error.message);
      throw new InternalServerErrorException('Không thể tạo nhà cung cấp');
    }
  }

  async findAll(query: any, current: number, pageSize: number) {
    try {
      console.log('query::: ', query);
      const { filter, sort } = aqp(query);

      if (!current) current = 1;
      if (!pageSize) pageSize = 10;

      delete filter.current;
      delete filter.pageSize;

      const { name, phone } = filter;

      const whereConditions: any = {};

      if (name) {
        whereConditions.name = Like(`%${name}%`);
      }

      if (phone) {
        whereConditions.phone = Like(`%${phone}%`);
      }

      const totalItems = await this.supplierRepository.count({
        where: whereConditions,
      });
      const totalPages = Math.ceil(totalItems / pageSize);
      const skip = (current - 1) * pageSize;

      const options = {
        where: whereConditions,
        relations: ['supplierProducts'],
        take: pageSize,
        skip: skip,
        order: sort,
      };

      const suppliers = await this.supplierRepository.find(options);

      const results = suppliers.map((supplier) => ({
        ...supplier,
        supplierProducts: supplier.supplierProducts
          .filter((product) => product.status === 1)
          .map((product) => product.productUnitId),
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
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Lỗi khi truy vấn nhà cung cấp:', error.message);
      throw new InternalServerErrorException(
        'Không thể truy xuất dữ liệu nhà cung cấp',
      );
    }
  }

  async findOne(id: number) {
    try {
      const supplier = await this.supplierRepository.findOne({
        where: { id },
      });

      if (!supplier) {
        throw new NotFoundException('Không tìm thấy nhà cung cấp');
      }

      return supplier;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error(`Lỗi khi tìm nhà cung cấp với id: ${id}`, error.message);
      throw new InternalServerErrorException(
        'Không thể truy xuất dữ liệu nhà cung cấp, vui lòng thử lại sau.',
      );
    }
  }

  async update(id: number, updateSupplierDto: UpdateSupplierDto) {
    try {
      console.log('updateSupplierDto', updateSupplierDto);
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

      if (
        updateSupplierDto.phone &&
        updateSupplierDto.phone !== supplier.phone
      ) {
        const existingUserByPhone = await this.supplierRepository.findOne({
          where: { phone: updateSupplierDto.phone },
        });
        if (existingUserByPhone) {
          throw new ConflictException('Số điện thoại đã tồn tại');
        }
      }

      const { productUnitIds, ...rest } = updateSupplierDto;
      if (productUnitIds) {
        await this.supplierProductsService.update(id, { productUnitIds });
      }

      Object.assign(supplier, rest);
      return await this.supplierRepository.save(supplier);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error(
        `Lỗi khi cập nhật nhà cung cấp với id: ${id}`,
        error.message,
      );
      throw new InternalServerErrorException(
        'Không thể cập nhật nhà cung cấp, vui lòng thử lại sau.',
      );
    }
  }

  async remove(id: number) {
    try {
      const supplier = await this.findOne(id);
      if (!supplier) {
        throw new NotFoundException('Không tìm thấy nhà cung cấp');
      }
      await this.supplierRepository.softDelete(id);
      return supplier;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error(`Lỗi khi xóa nhà cung cấp với id: ${id}`, error.message);
      throw new InternalServerErrorException(
        'Không thể xóa nhà cung cấp, vui lòng thử lại sau.',
      );
    }
  }
}
