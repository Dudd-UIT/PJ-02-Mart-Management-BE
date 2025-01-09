import {
  ConflictException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { Group } from './entities/group.entity';
import aqp from 'api-query-params';
import { UpdateRoleGroupDto } from './dto/update-role-group.dto';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    private rolesService: RolesService,
  ) {}

  async create(createGroupDto: CreateGroupDto) {
    try {
      const existingGroup = await this.groupRepository.findOne({
        where: { name: createGroupDto.name },
      });

      if (existingGroup) {
        throw new ConflictException('Tên nhóm người dùng đã tồn tại');
      }

      const group = this.groupRepository.create(createGroupDto);
      return await this.groupRepository.save(group);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Lỗi khi tạo nhóm người dùng:', error.message);
      throw new InternalServerErrorException(
        'Không thể tạo nhóm người dùng, vui lòng thử lại sau.',
      );
    }
  }

  async findAll(query: any, current: number, pageSize: number) {
    try {
      console.log('query',query);
      const { filter } = aqp(query);

      if (!current) current = 1;
      if (!pageSize) pageSize = 10;
      delete filter.current;
      delete filter.pageSize;

      const { name } = filter;

      const whereConditions: any = {};

      if(name) {
        whereConditions.name = Like(`%${name}%`);
      }

      const totalItems = await this.groupRepository.count({
        where: whereConditions,
      });
      const totalPages = Math.ceil(totalItems / pageSize);
      const skip = (current - 1) * pageSize;

      const options = {
        where: whereConditions,
        relations: ['roles'],
        take: pageSize,
        skip: skip,
      };

      const results = await this.groupRepository.find(options);

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
      console.error('Lỗi khi truy vấn nhóm người dùng:', error.message);
      throw new InternalServerErrorException(
        'Không thể truy xuất dữ liệu nhóm người dùng, vui lòng thử lại sau.',
      );
    }
  }


  async findAllEmployee(query: any, current: number, pageSize: number) {
    try {
      const { filter } = aqp(query);
  
      if (!current) current = 1;
      if (!pageSize) pageSize = 10;
      delete filter.current;
      delete filter.pageSize;
  
      // Tính toán phân trang
      const skip = (current - 1) * pageSize;
  
      // Sử dụng query builder để lọc group có name là 'nhân viên'
      const queryBuilder = this.groupRepository.createQueryBuilder('group');
  
      queryBuilder.where('group.name = :groupName', { groupName: 'nhân viên' });
  
      // Áp dụng các bộ lọc khác từ filter (nếu có)
      Object.keys(filter).forEach((key) => {
        queryBuilder.andWhere(`group.${key} = :${key}`, { [key]: filter[key] });
      });
  
      // Đếm tổng số items
      const totalItems = await queryBuilder.getCount();
  
      // Truy vấn dữ liệu với phân trang
      const results = await queryBuilder
        .take(pageSize)
        .skip(skip)
        .getMany();
  
      // Tổng số trang
      const totalPages = Math.ceil(totalItems / pageSize);
  
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
      console.error('Lỗi khi truy vấn nhóm người dùng:', error.message);
      throw new InternalServerErrorException(
        'Không thể truy xuất dữ liệu nhóm người dùng, vui lòng thử lại sau.',
      );
    }
  }
  
  
  

  async findOne(id: number) {
    try {
      const group = await this.groupRepository.findOne({
        where: { id },
      });

      if (!group) {
        throw new NotFoundException('Không tìm thấy nhóm người dùng');
      }

      return group;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error(`Lỗi khi tìm nhóm người dùng với id: ${id}`, error.message);
      throw new InternalServerErrorException(
        'Không thể truy xuất dữ liệu nhóm người dùng, vui lòng thử lại sau.',
      );
    }
  }

  async update(id: number, updateGroupDto: UpdateGroupDto) {
    try {
      const group = await this.findOne(id);
      if (!group) {
        throw new NotFoundException('Không tìm thấy nhóm người dùng');
      }

      if (updateGroupDto.name && updateGroupDto.name !== group.name) {
        const existingGroupByName = await this.groupRepository.findOne({
          where: { name: updateGroupDto.name },
        });
        if (existingGroupByName) {
          throw new ConflictException('Tên nhóm người dùng đã tồn tại');
        }
      }

      Object.assign(group, updateGroupDto);
      return await this.groupRepository.save(group);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error(
        `Lỗi khi cập nhật nhóm người dùng với id: ${id}`,
        error.message,
      );
      throw new InternalServerErrorException(
        'Không thể cập nhật nhóm người dùng, vui lòng thử lại sau.',
      );
    }
  }

  async remove(id: number) {
    try {
      const group = await this.findOne(id);
      if (!group) {
        throw new NotFoundException('Không tìm thấy nhóm người dùng');
      }
      await this.groupRepository.softDelete(id);
      return group;
    } catch (error) {
      console.error(`Lỗi khi xóa nhóm người dùng với id: ${id}`, error.message);
      throw new InternalServerErrorException(
        'Không thể xóa nhóm người dùng, vui lòng thử lại sau.',
      );
    }
  }

  async assignRolesToGroup(id: number, updateRoleGroupDto: UpdateRoleGroupDto) {
    try {
      const group = await this.findOne(id);

      if (!group) {
        throw new NotFoundException(
          `Không tìm thấy nhóm người dùng có id ${id}`,
        );
      }

      const roles = await this.rolesService.findByIds(
        updateRoleGroupDto.roleIds,
      );
      const plainRoles = roles.map((role) => ({ ...role }));

      if (plainRoles.length !== updateRoleGroupDto.roleIds.length) {
        throw new NotFoundException('Một số vai trò không tìm thấy');
      }

      group.roles = plainRoles;

      return await this.groupRepository.save(group);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error(
        `Lỗi khi gán vai trò cho nhóm người dùng với ID ${id}:`,
        error.message,
      );
      throw new InternalServerErrorException(
        'Không thể gán vai trò cho nhóm người dùng',
      );
    }
  }
}
