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
      const { filter, sort } = aqp(query);

      if (!current) current = 1;
      if (!pageSize) pageSize = 10;
      delete filter.current;
      delete filter.pageSize;

      const totalItems = await this.batchRepository.count({
        where: filter,
      });
      const totalPages = Math.ceil(totalItems / pageSize);
      const skip = (current - 1) * pageSize;

      const options = {
        where: filter,
        relations: [
          'inboundReceipt',
          'productUnit',
          'productUnit.productSample',
          'productUnit.unit',
        ],
        take: pageSize,
        skip: skip,
      };

      const results = await this.batchRepository.find(options);

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
}
