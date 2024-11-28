import {
  ConflictException,
  Injectable,
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
    const existingUnit = await this.unitRepository.findOne({
      where: { name: createUnitDto.name },
    });

    if (existingUnit) {
      throw new ConflictException('Đơn vị tính đã tồn tại');
    }

    const unit = this.unitRepository.create(createUnitDto);
    const savedUnit = this.unitRepository.save(unit);
    return savedUnit;
  }

  async findAll(query: string, current: number, pageSize: number) {
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
      where: {},
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
  }

  async findOne(id: number) {
    const unit = await this.unitRepository.findOne({
      where: { id },
    });

    if (!unit) {
      throw new NotFoundException('Không tìm thấy đơn vị tính');
    }

    return unit;
  }

  async update(id: number, updateUnitDto: UpdateUnitDto) {
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
    const savedUser = await this.unitRepository.save(unit);
    return savedUser;
  }

  async remove(id: number) {
    const unit = await this.findOne(id);
    if (!unit) {
      throw new NotFoundException('Không tìm thấy đơn vị tính');
    }
    await this.unitRepository.softDelete(id);
    return unit;
  }
}
