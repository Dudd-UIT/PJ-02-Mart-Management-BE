import { Test, TestingModule } from '@nestjs/testing';
import { GroupsService } from './groups.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { RolesService } from '../roles/roles.service';
import {
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('GroupsService', () => {
  let service: GroupsService;
  let repository: any;
  let rolesService: RolesService;

  const mockGroupRepository = {
    create: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
    find: jest.fn(),
    softDelete: jest.fn(),
  };

  const mockRolesService = {
    findByIds: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupsService,
        { provide: getRepositoryToken(Group), useValue: mockGroupRepository },
        { provide: RolesService, useValue: mockRolesService },
      ],
    }).compile();

    service = module.get<GroupsService>(GroupsService);
    repository = module.get(getRepositoryToken(Group));
    rolesService = module.get<RolesService>(RolesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should successfully create a group', async () => {
      const createGroupDto = { name: 'Group 1', description: 'Description 1' };
      mockGroupRepository.findOne.mockResolvedValue(null);
      mockGroupRepository.create.mockReturnValue(createGroupDto);
      mockGroupRepository.save.mockResolvedValue({ id: 1, ...createGroupDto });

      const result = await service.create(createGroupDto);
      expect(result).toEqual({ id: 1, ...createGroupDto });
    });

    it('should throw ConflictException if group already exists', async () => {
      const createGroupDto = { name: 'Group 1', description: 'Description 1' };
      mockGroupRepository.findOne.mockResolvedValue({ name: 'Group 1' });

      await expect(service.create(createGroupDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw InternalServerErrorException for unexpected errors', async () => {
      const createGroupDto = { name: 'Group 1', description: 'Description 1' };

      mockGroupRepository.findOne.mockRejectedValue(
        new Error('Unexpected Error'),
      );

      await expect(service.create(createGroupDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated groups with meta', async () => {
      const query = '{}';
      const current = 1;
      const pageSize = 10;

      const mockGroups = [
        { id: 1, name: 'Group 1', description: 'Admin Group' },
        { id: 2, name: 'Group 2', description: 'Staff Group' },
      ];

      mockGroupRepository.count.mockResolvedValue(2);
      mockGroupRepository.find.mockResolvedValue(mockGroups);

      const result = await service.findAll(query, current, pageSize);

      expect(result).toEqual({
        meta: { current: 1, pageSize: 10, pages: 1, total: 2 },
        results: mockGroups,
      });
      expect(mockGroupRepository.count).toHaveBeenCalled();
      expect(mockGroupRepository.find).toHaveBeenCalled();
    });

    it('should return empty array when no groups exist', async () => {
      const query = '{}';
      const current = 1;
      const pageSize = 10;

      mockGroupRepository.count.mockResolvedValue(0);
      mockGroupRepository.find.mockResolvedValue([]);

      const result = await service.findAll(query, current, pageSize);

      expect(result.meta.total).toBe(0);
      expect(result.results).toEqual([]);
      expect(mockGroupRepository.count).toHaveBeenCalled();
      expect(mockGroupRepository.find).toHaveBeenCalled();
    });

    it('should apply default pagination when current and pageSize are undefined', async () => {
      const query = '{}';
      const current = undefined;
      const pageSize = undefined;

      const mockGroups = [{ id: 1, name: 'Group 1' }];

      mockGroupRepository.count.mockResolvedValue(1);
      mockGroupRepository.find.mockResolvedValue(mockGroups);

      const result = await service.findAll(query, current, pageSize);

      expect(result.meta.current).toBe(1);
      expect(result.meta.pageSize).toBe(10);
      expect(result.results).toEqual(mockGroups);
      expect(mockGroupRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 0,
        }),
      );
    });

    it('should filter groups by name "Admin"', async () => {
      const query = { name: 'Admin' };
      const current = 1;
      const pageSize = 10;

      const mockGroups = [{ id: 1, name: 'Admin', description: 'Admin Group' }];

      mockGroupRepository.count.mockResolvedValue(1);
      mockGroupRepository.find.mockResolvedValue(mockGroups);

      const result = await service.findAll(query, current, pageSize);

      expect(result.meta.total).toBe(1);
      expect(result.results).toEqual(mockGroups);
      expect(mockGroupRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { name: 'Admin' },
        }),
      );
    });

    it('should throw InternalServerErrorException on query failure', async () => {
      const query = '{}';
      const current = 1;
      const pageSize = 10;

      mockGroupRepository.count.mockRejectedValue(
        new Error('Database query failed'),
      );

      await expect(service.findAll(query, current, pageSize)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a group by id', async () => {
      const group = { id: 1, name: 'Group 1', description: 'Description 1' };
      mockGroupRepository.findOne.mockResolvedValue(group);

      const result = await service.findOne(1);
      expect(result).toEqual(group);
    });

    it('should throw NotFoundException if group not found', async () => {
      mockGroupRepository.findOne.mockResolvedValue(null);

      try {
        await service.findOne(99);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('update', () => {
    it('should update group successfully', async () => {
      const id = 1;
      const updateGroupDto = {
        name: 'Staff',
        description: 'Updated description',
      };

      const existingGroup = {
        id: 1,
        name: 'Admin',
        description: 'Old description',
      };

      mockGroupRepository.findOne
        .mockResolvedValueOnce(existingGroup)
        .mockResolvedValueOnce(null);

      mockGroupRepository.save.mockResolvedValue({
        ...existingGroup,
        ...updateGroupDto,
      });

      const result = await service.update(id, updateGroupDto);

      expect(result).toEqual({
        id: 1,
        name: 'Staff',
        description: 'Updated description',
      });
      expect(mockGroupRepository.findOne).toHaveBeenCalledTimes(2);
      expect(mockGroupRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if group with given id does not exist', async () => {
      const id = -1;
      const updateGroupDto = { name: 'Admin', description: 'New description' };

      mockGroupRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.update(id, updateGroupDto)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockGroupRepository.findOne).toHaveBeenCalledWith({
        where: { id: -1 },
      });
      expect(mockGroupRepository.save).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if group name already exists', async () => {
      const id = 1;
      const updateGroupDto = {
        name: 'Staff',
        description: 'Updated description',
      };

      const existingGroup = {
        id: 1,
        name: 'Admin',
        description: 'Old description',
      };
      const conflictingGroup = {
        id: 2,
        name: 'Staff',
        description: 'Some description',
      };

      mockGroupRepository.findOne
        .mockResolvedValueOnce(existingGroup)
        .mockResolvedValueOnce(conflictingGroup);

      await expect(service.update(id, updateGroupDto)).rejects.toThrow(
        ConflictException,
      );

      expect(mockGroupRepository.findOne).toHaveBeenCalledTimes(2);
      expect(mockGroupRepository.save).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      const id = 1;
      const updateGroupDto = {
        name: 'Staff',
        description: 'Updated description',
      };

      mockGroupRepository.findOne.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.update(id, updateGroupDto)).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(mockGroupRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockGroupRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a group successfully', async () => {
      const group = { id: 1, name: 'Group 1', description: 'Description 1' };
      mockGroupRepository.findOne.mockResolvedValue(group);
      mockGroupRepository.softDelete.mockResolvedValue(undefined);

      const result = await service.remove(1);
      expect(result).toEqual(group);
    });

    it('should throw NotFoundException if group not found for removal', async () => {
      mockGroupRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(-1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('assignRolesToGroup', () => {
    it('should assign roles to group successfully', async () => {
      const groupId = 1;
      const roleIds = [1, 2];
      const group = { id: 1, name: 'Group 1', roles: [] };
      const roles = [
        { id: 1, name: 'Role 1' },
        { id: 2, name: 'Role 2' },
      ];

      mockGroupRepository.findOne.mockResolvedValue(group);
      mockRolesService.findByIds.mockResolvedValue(roles);
      mockGroupRepository.save.mockResolvedValue({ ...group, roles });

      const updateRoleGroupDto = { roleIds };

      const result = await service.assignRolesToGroup(
        groupId,
        updateRoleGroupDto,
      );

      expect(result).toEqual({ ...group, roles });
      expect(mockGroupRepository.findOne).toHaveBeenCalledWith({
        where: { id: groupId },
      });
      expect(mockRolesService.findByIds).toHaveBeenCalledWith(roleIds);
      expect(mockGroupRepository.save).toHaveBeenCalledWith({
        ...group,
        roles,
      });
    });

    it('should throw NotFoundException if group does not exist', async () => {
      const groupId = 99;
      const roleIds = [1, 2];
      const updateRoleGroupDto = { roleIds };

      mockGroupRepository.findOne.mockResolvedValue(null);

      await expect(
        service.assignRolesToGroup(groupId, updateRoleGroupDto),
      ).rejects.toThrow(
        new NotFoundException(`Không tìm thấy nhóm người dùng`),
      );

      expect(mockGroupRepository.findOne).toHaveBeenCalledWith({
        where: { id: groupId },
      });
      expect(mockRolesService.findByIds).not.toHaveBeenCalled();
      expect(mockGroupRepository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if some roles do not exist', async () => {
      const groupId = 1;
      const roleIds = [1, 2, 99];
      const group = { id: 1, name: 'Group 1', roles: [] };

      mockGroupRepository.findOne.mockResolvedValue(group);
      mockRolesService.findByIds.mockResolvedValue([
        { id: 1, name: 'Role 1' },
        { id: 2, name: 'Role 2' },
      ]);

      const updateRoleGroupDto = { roleIds };

      await expect(
        service.assignRolesToGroup(groupId, updateRoleGroupDto),
      ).rejects.toThrow(new NotFoundException('Một số vai trò không tìm thấy'));

      expect(mockRolesService.findByIds).toHaveBeenCalledWith(roleIds);
      expect(mockGroupRepository.save).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      const groupId = 1;
      const roleIds = [1, 2];
      const updateRoleGroupDto = { roleIds };

      mockGroupRepository.findOne.mockResolvedValue({ id: 1, name: 'Group 1' });
      mockRolesService.findByIds.mockRejectedValue(new Error('Database error'));

      await expect(
        service.assignRolesToGroup(groupId, updateRoleGroupDto),
      ).rejects.toThrow(
        new InternalServerErrorException(
          'Không thể gán vai trò cho nhóm người dùng',
        ),
      );

      expect(mockRolesService.findByIds).toHaveBeenCalledWith(roleIds);
      expect(mockGroupRepository.save).not.toHaveBeenCalled();
    });
  });
});
