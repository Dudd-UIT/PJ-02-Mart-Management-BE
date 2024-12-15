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

  it('should be defined', () => {
    expect(service).toBeDefined();
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

      try {
        await service.create(createGroupDto);
      } catch (e) {
        expect(e).toBeInstanceOf(ConflictException);
      }
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
        await service.findOne(999);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
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

      try {
        await service.remove(999);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });
});
