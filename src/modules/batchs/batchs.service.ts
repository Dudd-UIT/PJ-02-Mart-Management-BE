import {
  forwardRef,
  Inject,
  Injectable,
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
      const productUnit = await this.productUnitsService.findOne(productUnitId);
      if (!productUnit) {
        throw new NotFoundException('Không tìm thấy mẫu sản phẩm');
      }
      batch.productUnit = productUnit;
    }
    const savedBatch = this.batchRepository.save(batch);
    return savedBatch;
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;
    delete filter.current;
    delete filter.pageSize;

    const totalItems = await this.batchRepository.count(filter);
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * pageSize;

    const options = {
      where: {},
      relations: ['inboundReceipt', 'productUnit'],
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
  }

  async findOne(id: number) {
    const batch = await this.batchRepository.findOne({
      where: { id },
    });

    if (!batch) {
      throw new NotFoundException('Không tìm thấy lô hàng');
    }

    return batch;
  }

  async update(id: number, updateBatchDto: UpdateBatchDto) {
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
  }

  async remove(id: number) {
    const batch = await this.findOne(id);
    if (!batch) {
      throw new NotFoundException('Không tìm thấy đơn nhập hàng');
    }
    await this.batchRepository.softDelete(id);
    return batch;
  }
}
