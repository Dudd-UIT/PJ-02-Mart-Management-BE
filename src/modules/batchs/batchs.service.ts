import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Batch } from './entities/batch.entity';
import aqp from 'api-query-params';
import { InboundReceiptService } from '../inbound_receipt/inbound_receipt.service';
import { ProductUnitsService } from '../product_units/product_units.service';

@Injectable()
export class BatchsService {
  constructor(
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
    @Inject(forwardRef(() => InboundReceiptService))
    private inboundReceiptService: InboundReceiptService,
    private productUnitsService: ProductUnitsService,
  ) {}

  async create(createBatchDto: CreateBatchDto) {
    try {
      const { inboundReceiptId, productUnitId, ...rest } = createBatchDto;
      const batch = this.batchRepository.create(rest);

      if (inboundReceiptId) {
        const inboundReceipt =
          await this.inboundReceiptService.findOne(inboundReceiptId);
        if (!inboundReceipt) {
          throw new NotFoundException('Không tìm thấy đơn nhập hàng');
        }
        batch.inboundReceipt = inboundReceipt;
      }

      if (productUnitId) {
        const productUnit =
          await this.productUnitsService.findOne(productUnitId);
        if (!productUnit) {
          throw new NotFoundException('Không tìm thấy mẫu sản phẩm');
        }
        batch.productUnit = productUnit;
      }

      const savedBatch = await this.batchRepository.save(batch);
      return savedBatch;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Lỗi khi tạo lô hàng:', error.message);
      throw new InternalServerErrorException(
        'Không thể tạo lô hàng, vui lòng thử lại sau.',
      );
    }
  }

  async findAll(query: any, current: number, pageSize: number) {
    try {
      const { filter } = aqp(query);

      if (!current) current = 1;
      if (!pageSize) pageSize = 10;

      // Extract and remove filters
      const inventQuantityFilter = filter.inventQuantity || null;
      const expiredAtFilter = filter.expiredAt || null;
      const nearExpiredFilter = filter.nearExpired || null; // Check for nearExpired flag
      const createdTodayFilter = filter.createdToday || null; // Check for createdToday flag

      delete filter.current;
      delete filter.pageSize;
      delete filter.inventQuantity;
      delete filter.expiredAt;
      delete filter.nearExpired;
      delete filter.createdToday;

      // Create query builder
      const queryBuilder = this.batchRepository
        .createQueryBuilder('batch')
        .leftJoinAndSelect('batch.inboundReceipt', 'inboundReceipt')
        .leftJoinAndSelect('batch.productUnit', 'productUnit')
        .leftJoinAndSelect('inboundReceipt.supplier', 'supplier')
        .leftJoinAndSelect('productUnit.productSample', 'productSample')
        .leftJoinAndSelect('productUnit.unit', 'unit')
        .where(filter); // Apply base filters

      // Apply additional filters
      if (inventQuantityFilter) {
        queryBuilder.andWhere('batch.inventQuantity >= :inventQuantity', {
          inventQuantity: inventQuantityFilter,
        });
      }

      if (expiredAtFilter) {
        queryBuilder.andWhere('batch.expiredAt >= :expiredAt', {
          expiredAt: new Date(expiredAtFilter),
        });
      }

      if (nearExpiredFilter) {
        const today = new Date();
        const nearExpiredDate = new Date();
        nearExpiredDate.setDate(today.getDate() + 30); // Filter for the next 30 days
        queryBuilder.andWhere(
          'batch.expiredAt BETWEEN :today AND :nearExpired',
          {
            today: today.toISOString(),
            nearExpired: nearExpiredDate.toISOString(),
          },
        );
      }

      if (createdTodayFilter) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        queryBuilder.andWhere(
          'batch.createdAt BETWEEN :todayStart AND :todayEnd',
          {
            todayStart: todayStart.toISOString(),
            todayEnd: todayEnd.toISOString(),
          },
        );
      }

      // Count total items
      const totalItems = await queryBuilder.getCount();
      const totalPages = Math.ceil(totalItems / pageSize);
      const skip = (current - 1) * pageSize;

      // Fetch paginated results
      const results = await queryBuilder.take(pageSize).skip(skip).getMany();

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
      console.error('Lỗi khi tìm tất cả các lô hàng:', error.message);
      throw new InternalServerErrorException(
        'Không thể truy xuất dữ liệu lô hàng, vui lòng thử lại sau.',
      );
    }
  }

  async findOne(id: number) {
    try {
      const batch = await this.batchRepository.findOne({
        where: { id },
      });

      if (!batch) {
        throw new NotFoundException('Không tìm thấy lô hàng');
      }

      return batch;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error(`Lỗi khi tìm lô hàng với id: ${id}`, error.message);
      throw new InternalServerErrorException(
        'Không thể truy xuất dữ liệu lô hàng, vui lòng thử lại sau.',
      );
    }
  }

  async update(id: number, updateBatchDto: UpdateBatchDto) {
    try {
      const batch = await this.findOne(id);
      if (!batch) {
        throw new NotFoundException('Không tìm thấy lô hàng');
      }

      if (updateBatchDto.productUnitId) {
        const productUnit = await this.productUnitsService.findOne(
          updateBatchDto.productUnitId,
        );
        if (!productUnit) {
          throw new NotFoundException('Không tìm thấy mẫu sản phẩm');
        }
        batch.productUnit = productUnit;
      }

      if (updateBatchDto.inboundReceiptId) {
        const inboundReceipt = await this.inboundReceiptService.findOne(
          updateBatchDto.inboundReceiptId,
        );
        if (!inboundReceipt) {
          throw new NotFoundException('Không tìm thấy đơn nhập hàng');
        }
        batch.inboundReceipt = inboundReceipt;
      }

      Object.assign(batch, updateBatchDto);
      const savedBatch = await this.batchRepository.save(batch);
      return savedBatch;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Lỗi khi cập nhật lô hàng:', error.message);
      throw new BadRequestException(
        'Dữ liệu không hợp lệ, không thể cập nhật lô hàng.',
      );
    }
  }

  async remove(id: number) {
    try {
      const batch = await this.findOne(id);
      if (!batch) {
        throw new NotFoundException('Không tìm thấy lô hàng');
      }
      await this.batchRepository.softDelete(id);
      return batch;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error(`Lỗi khi xóa lô hàng với id: ${id}`, error.message);
      throw new InternalServerErrorException(
        'Không thể xóa lô hàng, vui lòng thử lại sau.',
      );
    }
  }

  async getInventoryValue(): Promise<number> {
    const batches = await this.batchRepository.find({
      select: ['inboundPrice', 'inventQuantity'],
    });

    const totalValue = batches.reduce((sum, batch) => {
      return sum + batch.inboundPrice * batch.inventQuantity;
    }, 0);

    return totalValue;
  }

  async findAvailableBatches(productUnitId: number) {
    return await this.batchRepository
      .createQueryBuilder('batch')
      .where('batch.productUnitId = :productUnitId', { productUnitId })
      .andWhere('batch.inventQuantity > 0') // Chỉ lấy các lô hàng còn tồn
      .andWhere('batch.expiredAt > :now', { now: new Date() }) // Loại bỏ các lô hàng đã hết hạn
      .orderBy('batch.expiredAt', 'ASC') // Ưu tiên lô hàng có hạn gần nhất
      .getMany();
  }

  async updateBatchQuantity(batchId: number, change: number) {
    const batch = await this.findOne(batchId);
    if (!batch) {
      throw new NotFoundException('Không tìm thấy lô hàng tương ứng');
    }

    const newQuantity = batch.inventQuantity + change;
    if (newQuantity < 0) {
      throw new BadRequestException('Không đủ hàng trong lô để xử lý');
    }

    batch.inventQuantity = newQuantity;
    return await this.batchRepository.save(batch);
  }
}
