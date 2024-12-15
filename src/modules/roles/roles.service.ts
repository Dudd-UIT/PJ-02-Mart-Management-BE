import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import aqp from 'api-query-params';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async findAll(query: any, current: number, pageSize: number) {
    try {
      const { filter, sort } = aqp(query);

      if (!current) current = 1;
      if (!pageSize) pageSize = 10;
      delete filter.current;
      delete filter.pageSize;

      const totalItems = await this.roleRepository.count({
        where: filter,
      });
      const totalPages = Math.ceil(totalItems / pageSize);
      const skip = (current - 1) * pageSize;

      const options = {
        where: filter,
        relations: [],
        take: pageSize,
        skip: skip,
        order: sort || {},
      };

      const results = await this.roleRepository.find(options);

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
      console.error('Lỗi khi tìm kiếm vai trò:', error.message);
      throw new InternalServerErrorException('Không thể tìm kiếm vai trò');
    }
  }

  async findByIds(roleIds: number[]) {
    const roles = await this.roleRepository.findBy({
      id: In(roleIds),
    });

    return roles;
  }
}
