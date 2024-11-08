import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './entities/group.entity';
import aqp from 'api-query-params';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
  ) {}

  async create(createGroupDto: CreateGroupDto) {
    const existingGroup = await this.groupRepository.findOne({
      where: { name: createGroupDto.name },
    });

    if (existingGroup) {
      throw new ConflictException('Tên nhóm người dùng đã tồn tại');
    }

    const group = this.groupRepository.create(createGroupDto);
    const savedGroup = this.groupRepository.save(group);
    return savedGroup;
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;
    delete filter.current;
    delete filter.pageSize;

    const totalItems = await this.groupRepository.count(filter);
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * pageSize;

    const options = {
      where: {},
      relations: [],
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
  }

  async findOne(id: number) {
    const group = await this.groupRepository.findOne({
      where: { id },
    });

    if (!group) {
      throw new NotFoundException('Không tìm thấy nhóm người dùng');
    }

    return group;
  }

  async update(id: number, updateGroupDto: UpdateGroupDto) {
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
    const savedUser = await this.groupRepository.save(group);
    return savedUser;
  }

  async remove(id: number) {
    const group = await this.findOne(id);
    if (!group) {
      throw new NotFoundException('Không tìm thấy nhóm người dùng');
    }
    await this.groupRepository.softDelete(id);
    return group;
  }
}
