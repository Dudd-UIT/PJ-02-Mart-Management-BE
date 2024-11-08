import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateInboundReceiptDto } from './dto/create-inbound_receipt.dto';
import { UpdateInboundReceiptDto } from './dto/update-inbound_receipt.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { InboundReceipt } from './entities/inbound_receipt.entity';
import aqp from 'api-query-params';
import { UsersService } from '../users/users.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { CreateInboundReceiptBatchsDto } from './dto/create-inbound_receipt-batchs.dto';
import { BatchsService } from '../batchs/batchs.service';
import { Batch } from '../batchs/entities/batch.entity';
import { UpdateInboundReceiptBatchsDto } from './dto/update-inbound_receipt-batchs.dto';

@Injectable()
export class InboundReceiptService {
  constructor(
    @InjectRepository(InboundReceipt)
    private inboundReceiptRepository: Repository<InboundReceipt>,
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
    private usersService: UsersService,
    private suppliersService: SuppliersService,
    @Inject(forwardRef(() => BatchsService))
    private batchsService: BatchsService,
  ) {}

  async createInboundReceiptAndBatchs(
    createInboundReceiptBatchsDto: CreateInboundReceiptBatchsDto,
  ) {
    const { inboundReceiptDto, batchsDto } = createInboundReceiptBatchsDto;

    const inboundReceipt = await this.create(inboundReceiptDto);

    const inboundReceiptId = inboundReceipt.id;

    batchsDto.forEach(async (batchInfo) => {
      const batch = await this.batchsService.create({
        ...batchInfo,
        inboundReceiptId,
      });
      const savedBatch = await this.batchRepository.save(batch);
    });

    const savedInboundReceipt =
      await this.inboundReceiptRepository.save(inboundReceipt);

    return savedInboundReceipt;
  }

  async create(createInboundReceiptDto: CreateInboundReceiptDto) {
    const { staffId, supplierId, ...rest } = createInboundReceiptDto;

    const inboundReceipt = this.inboundReceiptRepository.create(rest);
    if (staffId) {
      const staff = await this.usersService.findOneById(staffId);
      if (!staff) {
        throw new NotFoundException('Không tìm thấy mã nhân viên');
      }
      inboundReceipt.staff = staff;
    }

    if (supplierId) {
      const suppplier = await this.suppliersService.findOne(supplierId);
      if (!suppplier) {
        throw new NotFoundException('Không tìm thấy nhà cung cấp');
      }
      inboundReceipt.supplier = suppplier;
    }

    const savedInboundReceipt =
      this.inboundReceiptRepository.save(inboundReceipt);
    return savedInboundReceipt;
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);
    const { staffName, supplierName, startDate, endDate } = filter;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    delete filter.current;
    delete filter.pageSize;

    const whereConditions: any = {};

    if (staffName) {
      whereConditions.staff = { name: staffName };
    }

    if (supplierName) {
      whereConditions.supplier = { name: supplierName };
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0, 0, 0, 0); // Start of the day
      end.setHours(23, 59, 59, 999); // End of the day

      whereConditions.createdAt = Between(start, end);
    } else if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0); // Include the start date at 00:00:00
      whereConditions.createdAt = MoreThanOrEqual(start);
    } else if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include the end date until the end of the day
      whereConditions.createdAt = LessThanOrEqual(end);
    }

    const totalItems = await this.inboundReceiptRepository.count({
      where: whereConditions,
      relations: ['staff', 'supplier'],
    });
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * pageSize;

    const options = {
      where: whereConditions,
      relations: [
        'staff',
        'supplier',
        'batchs.productUnit.productSample',
        'batchs.productUnit.unit',
      ],
      take: pageSize,
      skip: skip,
    };

    const results = await this.inboundReceiptRepository.find(options);

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
    const inboundReceipt = await this.inboundReceiptRepository.findOne({
      where: { id },
    });

    if (!inboundReceipt) {
      throw new NotFoundException('Không tìm thấy đơn nhập hàng');
    }

    return inboundReceipt;
  }

  async updateInboundReceiptAndBatchs(
    id: number,
    updateInboundReceiptBatchsDto: UpdateInboundReceiptBatchsDto,
  ) {
    const { inboundReceiptDto, batchsDto } = updateInboundReceiptBatchsDto;

    if (inboundReceiptDto.isPaid && +inboundReceiptDto.isPaid === 1) {
      throw new ConflictException(
        'Không thể cập nhật đơn nhập hàng đã thanh toán',
      );
    }

    const inboundReceipt = await this.update(id, inboundReceiptDto);

    batchsDto.forEach(async (batchInfo) => {
      const { id, ...rest } = batchInfo;
      const batch = await this.batchsService.update(id, rest);
    });

    const savedInboundReceipt =
      await this.inboundReceiptRepository.save(inboundReceipt);

    return savedInboundReceipt;
  }

  async update(id: number, updateInboundReceiptDto: UpdateInboundReceiptDto) {
    const inboundReceipt = await this.findOne(id);
    if (!inboundReceipt) {
      throw new NotFoundException('Không tìm thấy đơn nhập hàng');
    }
    if (updateInboundReceiptDto.staffId) {
      const staff = await this.usersService.findOneById(
        updateInboundReceiptDto.staffId,
      );
      if (!staff) {
        throw new NotFoundException('Không tìm thấy mã nhân viên');
      }
      inboundReceipt.staff = staff;
    }

    if (updateInboundReceiptDto.supplierId) {
      const suppplier = await this.suppliersService.findOne(
        updateInboundReceiptDto.supplierId,
      );
      if (!suppplier) {
        throw new NotFoundException('Không tìm thấy nhà cung cấp');
      }
      inboundReceipt.supplier = suppplier;
    }

    Object.assign(inboundReceipt, updateInboundReceiptDto);
    const savedUser = await this.inboundReceiptRepository.save(inboundReceipt);
    return savedUser;
  }

  async remove(id: number) {
    const inboundReceipt = await this.findOne(id);
    if (!inboundReceipt) {
      throw new NotFoundException('Không tìm thấy đơn nhập hàng');
    }
    await this.inboundReceiptRepository.softDelete(id);
    return inboundReceipt;
  }
}
