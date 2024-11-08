import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateRoleGroupDto } from './dto/update-role-group.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import aqp from 'api-query-params';
import { GroupsService } from '../groups/groups.service';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private groupsServices: GroupsService,
  ) {}

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;
    delete filter.current;
    delete filter.pageSize;

    const totalItems = await this.roleRepository.count(filter);
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * pageSize;

    const options = {
      where: {},
      relations: [],
      take: pageSize,
      skip: skip,
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
  }

  async assignRolesToGroup(id: number, updateRoleGroupDto: UpdateRoleGroupDto) {
    const group = await this.groupsServices.findOne(id);

    if (!group) {
      throw new NotFoundException(`Không tìm thấy nhóm người dùng có id ${id}`);
    }

    const roles = await this.roleRepository.findBy({
      id: In(updateRoleGroupDto.roleIds),
    });

    if (roles.length !== updateRoleGroupDto.roleIds.length) {
      throw new NotFoundException(`Một số vai trò không tìm thấy`);
    }

    group.roles = roles;

    return this.roleRepository.save(group);
  }
}
