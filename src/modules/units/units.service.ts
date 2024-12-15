import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from './entities/unit.entity';
import aqp from 'api-query-params';

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unit)
    private unitRepository: Repository<Unit>,
  ) {}

  async create(createUnitDto: CreateUnitDto) {
    try {
      const existingUnit = await this.unitRepository.findOne({
        where: { name: createUnitDto.name },
      });

      if (existingUnit) {
        throw new ConflictException('Đơn vị tính đã tồn tại');
      }

      const unit = this.unitRepository.create(createUnitDto);
      const savedUnit = await this.unitRepository.save(unit);
      return savedUnit;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      console.error('Lỗi khi tạo đơn vị tính:', error.message);
      throw new InternalServerErrorException('Không thể tạo đơn vị tính');
    }
  }

  async findAll(query: any, current: number, pageSize: number) {
    try {
      const { filter, sort } = aqp(query);

      if (!current) current = 1;
      if (!pageSize) pageSize = 10;
      delete filter.current;
      delete filter.pageSize;

      const totalItems = await this.unitRepository.count({
        where: filter,
      });
      const totalPages = Math.ceil(totalItems / pageSize);
      const skip = (current - 1) * pageSize;

      const options = {
        where: filter,
        relations: [],
        take: pageSize,
        skip: skip,
      };

      const results = await this.unitRepository.find(options);

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
      console.error('Lỗi khi truy xuất danh sách đơn vị tính:', error.message);
      throw new InternalServerErrorException(
        'Không thể truy xuất dữ liệu đơn vị tính',
      );
    }
  }

  async findOne(id: number) {
    try {
      const unit = await this.unitRepository.findOne({
        where: { id },
      });

      if (!unit) {
        throw new NotFoundException('Không tìm thấy đơn vị tính');
      }

      return unit;
    } catch (error) {
      console.error(`Lỗi khi tìm đơn vị tính với ID ${id}:`, error.message);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Không thể tìm đơn vị tính');
    }
  }

  async update(id: number, updateUnitDto: UpdateUnitDto) {
    try {
      const unit = await this.findOne(id);
      if (!unit) {
        throw new NotFoundException('Không tìm thấy đơn vị tính');
      }

      if (updateUnitDto.name && updateUnitDto.name !== unit.name) {
        const existingUnitByName = await this.unitRepository.findOne({
          where: { name: updateUnitDto.name },
        });
        if (existingUnitByName) {
          throw new ConflictException('Đơn vị tính đã tồn tại');
        }
      }

      Object.assign(unit, updateUnitDto);
      const savedUnit = await this.unitRepository.save(unit);
      return savedUnit;
    } catch (error) {
      console.error(
        `Lỗi khi cập nhật đơn vị tính với ID ${id}:`,
        error.message,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Không thể cập nhật đơn vị tính');
    }
  }

  async remove(id: number) {
    try {
      const unit = await this.findOne(id);
      if (!unit) {
        throw new NotFoundException('Không tìm thấy đơn vị tính');
      }

      await this.unitRepository.softDelete(id);
      return unit;
    } catch (error) {
      console.error(`Lỗi khi xóa đơn vị tính với ID ${id}:`, error.message);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Không thể xóa đơn vị tính');
    }
  }
}
