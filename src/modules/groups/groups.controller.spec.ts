import { Test, TestingModule } from '@nestjs/testing';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { UpdateRoleGroupDto } from './dto/update-role-group.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('GroupsController', () => {
  let controller: GroupsController;
  let service: GroupsService;

  const mockGroupService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    assignRolesToGroup: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupsController],
      providers: [{ provide: GroupsService, useValue: mockGroupService }],
    }).compile();

    controller = module.get<GroupsController>(GroupsController);
    service = module.get<GroupsService>(GroupsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a group successfully', async () => {
      const createGroupDto: CreateGroupDto = {
        name: 'Group 1',
        description: 'Description 1',
      };
      const result = { id: 1, ...createGroupDto };
      mockGroupService.create.mockResolvedValue(result);

      expect(await controller.create(createGroupDto)).toEqual({
        message: 'Tạo nhóm người dùng thành công',
        data: result,
      });
    });

    it('should throw a ConflictException if group already exists', async () => {
      const createGroupDto: CreateGroupDto = {
        name: 'Group 1',
        description: 'Description 1',
      };
      mockGroupService.create.mockRejectedValue(
        new ConflictException('Tên nhóm người dùng đã tồn tại'),
      );

      try {
        await controller.create(createGroupDto);
      } catch (e) {
        expect(e).toBeInstanceOf(ConflictException);
      }
    });
  });

  describe('findAll', () => {
    it('should return all groups', async () => {
      const result = { meta: {}, results: [] };
      mockGroupService.findAll.mockResolvedValue(result);

      expect(await controller.findAll('', '1', '10')).toEqual({
        message: 'Trả về danh sách các nhóm người dùng thành công',
        data: result,
      });
    });
  });

  describe('findOne', () => {
    it('should return a group by id', async () => {
      const result = { id: 1, name: 'Group 1', description: 'Description 1' };
      mockGroupService.findOne.mockResolvedValue(result);

      expect(await controller.findOne(1)).toEqual({
        message: 'Trả về thông tin chi tiết nhóm người dùng thành công',
        data: result,
      });
    });

    it('should throw a NotFoundException if group is not found', async () => {
      mockGroupService.findOne.mockRejectedValue(
        new NotFoundException('Không tìm thấy nhóm người dùng'),
      );

      try {
        await controller.findOne(999);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('update', () => {
    it('should update group details', async () => {
      const updateGroupDto: UpdateGroupDto = { name: 'Updated Group' };
      const result = {
        id: 1,
        name: 'Updated Group',
        description: 'Description 1',
      };
      mockGroupService.update.mockResolvedValue(result);

      expect(await controller.update(1, updateGroupDto)).toEqual({
        message: 'Cập nhật thông tin chi tiết nhóm người dùng thành công',
        data: result,
      });
    });
  });

  describe('remove', () => {
    it('should remove a group successfully', async () => {
      const result = { id: 1, name: 'Group 1', description: 'Description 1' };
      mockGroupService.remove.mockResolvedValue(result);

      expect(await controller.remove(1)).toEqual({
        message: 'Xóa nhóm người dùng thành công',
        data: result,
      });
    });
  });

  describe('assignRolesToGroup', () => {
    it('should assign roles to a group successfully', async () => {
      const updateRoleGroupDto: UpdateRoleGroupDto = { roleIds: [1, 2] };
      const result = { id: 1, name: 'Group 1', roles: [] };
      mockGroupService.assignRolesToGroup.mockResolvedValue(result);

      expect(
        await controller.assignRolesToGroup(1, updateRoleGroupDto),
      ).toEqual({
        message: 'Gán quyền thành công',
        data: result,
      });
    });

    it('should throw a NotFoundException if some roles are not found', async () => {
      const updateRoleGroupDto: UpdateRoleGroupDto = { roleIds: [1, 2] };
      mockGroupService.assignRolesToGroup.mockRejectedValue(
        new NotFoundException('Một số vai trò không tìm thấy'),
      );

      try {
        await controller.assignRolesToGroup(1, updateRoleGroupDto);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });
});
