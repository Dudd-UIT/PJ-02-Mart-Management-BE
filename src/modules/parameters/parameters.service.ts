import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateParameterDto } from './dto/create-parameter.dto';
import { UpdateParameterDto } from './dto/update-parameter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Parameter } from './entities/parameter.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ParametersService {
  constructor(
    @InjectRepository(Parameter)
    private parametersRepository: Repository<Parameter>,
  ) {}

  async create(createParameterDto: CreateParameterDto) {
    try {
      const existingParameter = await this.parametersRepository.findOne({
        where: { name: createParameterDto.name },
      });

      if (existingParameter) {
        throw new ConflictException('Tên tham số đã tồn tại');
      }

      const parameter = this.parametersRepository.create(createParameterDto);
      return await this.parametersRepository.save(parameter);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Lỗi khi tạo tham số:', error.message);
      throw new InternalServerErrorException(
        'Không thể tạo tham số, vui lòng thử lại sau.',
      );
    }
  }

  async findAll() {
    try {
      const results = await this.parametersRepository.find();

      return {
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
      console.error('Lỗi khi truy vấn tham số:', error.message);
      throw new InternalServerErrorException(
        'Không thể truy xuất dữ liệu tham số, vui lòng thử lại sau.',
      );
    }
  }

  async findOne(id: number) {
    try {
      const parameter = await this.parametersRepository.findOne({
        where: { id },
      });

      if (!parameter) {
        throw new NotFoundException('Không tìm thấy tham số');
      }

      return parameter;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error(`Lỗi khi tìm tham số với id: ${id}`, error.message);
      throw new InternalServerErrorException(
        'Không thể truy xuất dữ liệu tham số, vui lòng thử lại sau.',
      );
    }
  }

  async update(id: number, updateParameterDto: UpdateParameterDto) {
    try {
      const parameter = await this.findOne(id);
      if (!parameter) {
        throw new NotFoundException('Không tìm thấy tham số');
      }

      if (
        updateParameterDto.name &&
        updateParameterDto.name !== parameter.name
      ) {
        const existingParameterByName = await this.parametersRepository.findOne(
          {
            where: { name: updateParameterDto.name },
          },
        );
        if (existingParameterByName) {
          throw new ConflictException('Tên tham số đã tồn tại');
        }
      }

      Object.assign(parameter, updateParameterDto);
      return await this.parametersRepository.save(parameter);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error(`Lỗi khi cập nhật tham số với id: ${id}`, error.message);
      throw new InternalServerErrorException(
        'Không thể cập nhật tham số, vui lòng thử lại sau.',
      );
    }
  }

  async remove(id: number) {
    try {
      const parameter = await this.findOne(id);
      if (!parameter) {
        throw new NotFoundException('Không tìm thấy tham số');
      }
      await this.parametersRepository.softDelete(id);
      return parameter;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error(`Lỗi khi xóa tham số với id: ${id}`, error.message);
      throw new InternalServerErrorException(
        'Không thể xóa tham số, vui lòng thử lại sau.',
      );
    }
  }
}
