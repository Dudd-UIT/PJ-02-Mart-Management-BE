import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateInboundReceiptDto } from './dto/create-inbound_receipt.dto';
import { UpdateInboundReceiptDto } from './dto/update-inbound_receipt.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  LessThanOrEqual,
  Like,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { InboundReceipt } from './entities/inbound_receipt.entity';
import aqp from 'api-query-params';
import { UsersService } from '../users/users.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { CreateInboundReceiptBatchsDto } from './dto/create-inbound_receipt-batchs.dto';
import { BatchsService } from '../batchs/batchs.service';
import { Batch } from '../batchs/entities/batch.entity';
import { UpdateInboundReceiptBatchsDto } from './dto/update-inbound_receipt-batchs.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { SendMailDto } from './dto/send-mail.dto';

@Injectable()
export class InboundReceiptService {
  constructor(
    @InjectRepository(InboundReceipt)
    private inboundReceiptRepository: Repository<InboundReceipt>,
    private usersService: UsersService,
    private suppliersService: SuppliersService,
    @Inject(forwardRef(() => BatchsService))
    private batchsService: BatchsService,
    private readonly mailerService: MailerService,
  ) {}

  async createInboundReceiptAndBatchs(
    createInboundReceiptBatchsDto: CreateInboundReceiptBatchsDto,
  ) {
    try {
      const { inboundReceiptDto, batchsDto } = createInboundReceiptBatchsDto;
      const inboundReceipt = await this.create(inboundReceiptDto);

      const inboundReceiptId = inboundReceipt.id;

      for (const batchInfo of batchsDto) {
        await this.batchsService.create({
          ...batchInfo,
          inboundReceiptId,
        });
      }
      return await this.inboundReceiptRepository.save(inboundReceipt);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Lỗi khi tạo đơn nhập hàng và lô hàng:', error.message);
      throw new InternalServerErrorException(
        'Có lỗi xảy ra trong quá trình tạo đơn nhập hàng và lô hàng.',
      );
    }
  }

  async sendEmailToSupplier(sendMailDto: SendMailDto) {
    try {
      const { inboundReceiptDto, batchsDto } = sendMailDto;

      const supplier = await this.suppliersService.findOne(
        inboundReceiptDto.supplierId,
      );
      const supplierEmail = supplier.email;
      const supplieName = supplier.name;
      console.log('supplierEmail', supplierEmail);

      if (!supplierEmail) {
        throw new NotFoundException('Email nhà cung cấp không đúng');
      }

      const batches = batchsDto.map((batch, index) => ({
        index: index + 1,
        productSampleName: batch.productSampleName,
        unitName: batch.unitName,
        inboundPrice: batch.inboundPrice,
        inboundQuantity: batch.inboundQuantity,
        total: batch.inboundPrice * batch.inboundQuantity,
      }));

      // Gửi email
      await this.mailerService.sendMail({
        to: supplierEmail,
        subject: 'Thông báo đơn nhập hàng mới',
        template: 'inbound-receipt',
        context: {
          supplierName: supplieName,
          totalPrice: inboundReceiptDto.totalPrice,
          createdAt: inboundReceiptDto.createdAt,
          batches,
        },
      });

      return { supplierEmail };
    } catch (error) {
      console.error('Lỗi khi gửi email cho nhà cung cấp:', error.message);

      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Có lỗi xảy ra trong quá trình gửi mail.',
      );
    }
  }

  async create(createInboundReceiptDto: CreateInboundReceiptDto) {
    try {
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
        const supplier = await this.suppliersService.findOne(supplierId);
        if (!supplier) {
          throw new NotFoundException('Không tìm thấy nhà cung cấp');
        }
        inboundReceipt.supplier = supplier;
      }

      return await this.inboundReceiptRepository.save(inboundReceipt);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Lỗi khi tạo đơn nhập hàng:', error.message);
      throw new InternalServerErrorException(
        'Không thể tạo đơn nhập hàng, vui lòng thử lại sau.',
      );
    }
  }

  async findAll(query: any, current: number, pageSize: number) {
    try {
      const { filter } = aqp(query);
      const { staffName, supplierName, startDate, endDate } = filter;

      const whereConditions: any = {};

      if (staffName) {
        whereConditions.staff = { name: Like(`%${staffName}%`) };
      }

      if (supplierName) {
        whereConditions.supplier = { name: Like(`%${supplierName}%`) };
      }

      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        whereConditions.createdAt = Between(start, end);
      } else if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        whereConditions.createdAt = MoreThanOrEqual(start);
      } else if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
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
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Lỗi khi truy vấn đơn nhập hàng:', error.message);
      throw new InternalServerErrorException(
        'Không thể truy xuất dữ liệu đơn nhập hàng, vui lòng thử lại sau.',
      );
    }
  }

  async findOne(id: number) {
    try {
      const inboundReceipt = await this.inboundReceiptRepository.findOne({
        where: { id },
      });

      if (!inboundReceipt) {
        throw new NotFoundException('Không tìm thấy đơn nhập hàng');
      }

      return inboundReceipt;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error(`Lỗi khi tìm đơn nhập hàng với id: ${id}`, error.message);
      throw new InternalServerErrorException(
        'Không thể truy xuất dữ liệu đơn nhập hàng, vui lòng thử lại sau.',
      );
    }
  }

  async updateInboundReceiptAndBatchs(
    id: number,
    updateInboundReceiptBatchsDto: UpdateInboundReceiptBatchsDto,
  ) {
    try {
      const { inboundReceiptDto, batchsDto } = updateInboundReceiptBatchsDto;

      if (inboundReceiptDto.isPaid && +inboundReceiptDto.isPaid === 1) {
        throw new ConflictException(
          'Không thể cập nhật đơn nhập hàng đã thanh toán',
        );
      }

      await this.update(id, inboundReceiptDto);

      for (const batchInfo of batchsDto) {
        const { id: batchId, ...rest } = batchInfo;
        await this.batchsService.update(batchId, rest);
      }

      return await this.inboundReceiptRepository.findOne({ where: { id } });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error(
        'Lỗi khi cập nhật đơn nhập hàng và lô hàng:',
        error.message,
      );
      throw new InternalServerErrorException(
        'Không thể cập nhật đơn nhập hàng và lô hàng, vui lòng thử lại sau.',
      );
    }
  }

  async update(id: number, updateInboundReceiptDto: UpdateInboundReceiptDto) {
    try {
      const inboundReceipt = await this.findOne(id);

      if (updateInboundReceiptDto.staffId) {
        const staff = await this.usersService.findOneById(
          updateInboundReceiptDto.staffId,
        );
        if (!staff) throw new NotFoundException('Không tìm thấy mã nhân viên');
        inboundReceipt.staff = staff;
      }

      if (updateInboundReceiptDto.supplierId) {
        const supplier = await this.suppliersService.findOne(
          updateInboundReceiptDto.supplierId,
        );
        if (!supplier)
          throw new NotFoundException('Không tìm thấy nhà cung cấp');
        inboundReceipt.supplier = supplier;
      }

      Object.assign(inboundReceipt, updateInboundReceiptDto);
      return await this.inboundReceiptRepository.save(inboundReceipt);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Lỗi khi cập nhật đơn nhập hàng:', error.message);
      throw new InternalServerErrorException(
        'Không thể cập nhật đơn nhập hàng, vui lòng thử lại sau.',
      );
    }
  }

  async remove(id: number) {
    try {
      const inboundReceipt = await this.findOne(id);
      if (!inboundReceipt) {
        throw new NotFoundException('Không tìm thấy đơn nhập hàng');
      }
      await this.inboundReceiptRepository.softDelete(id);
      return inboundReceipt;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error(`Lỗi khi xóa đơn nhập hàng với id: ${id}`, error.message);
      throw new InternalServerErrorException(
        'Không thể xóa đơn nhập hàng, vui lòng thử lại sau.',
      );
    }
  }

  async getInboundCostByRange(start?: Date, end?: Date): Promise<number> {
    const query = this.inboundReceiptRepository
      .createQueryBuilder('inboundReceipt')
      .select('SUM(inboundReceipt.totalPrice)', 'total');

    if (start) {
      query.andWhere('inboundReceipt.createdAt >= :start', { start });
    }
    if (end) {
      query.andWhere('inboundReceipt.createdAt <= :end', { end });
    }

    const result = await query.getRawOne();
    return parseFloat(result.total || '0');
  }
}
