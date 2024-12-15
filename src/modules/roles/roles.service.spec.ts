import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './entities/role.entity';
import { InternalServerErrorException } from '@nestjs/common';

describe('RolesService', () => {
  let service: RolesService;
  let repository: Repository<Role>;

  const mockRepository = {
    find: jest.fn(),
    count: jest.fn(),
    findBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: getRepositoryToken(Role),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    repository = module.get<Repository<Role>>(getRepositoryToken(Role));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a list of roles with pagination', async () => {
      const result = [
        { id: 1, url: '/role-1', description: 'Role 1 description' },
        { id: 2, url: '/role-2', description: 'Role 2 description' },
      ];
      mockRepository.find.mockResolvedValue(result);
      mockRepository.count.mockResolvedValue(2);

      const response = await service.findAll('', 1, 10);

      expect(response).toEqual({
        meta: { current: 1, pageSize: 10, pages: 1, total: 2 },
        results: result,
      });
      expect(mockRepository.find).toHaveBeenCalled();
      expect(mockRepository.count).toHaveBeenCalled();
    });

    it('should return an empty list if no roles are found', async () => {
      mockRepository.find.mockResolvedValue([]);
      mockRepository.count.mockResolvedValue(0);

      const response = await service.findAll('', 1, 10);

      expect(response).toEqual({
        meta: { current: 1, pageSize: 10, pages: 0, total: 0 },
        results: [],
      });
    });

    it('should throw InternalServerErrorException on database error', async () => {
      mockRepository.find.mockRejectedValue(new Error('Database error'));

      await expect(service.findAll('', 1, 10)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findByIds', () => {
    it('should return roles matching given IDs', async () => {
      const result = [
        { id: 1, url: '/role-1', description: 'Role 1 description' },
        { id: 2, url: '/role-2', description: 'Role 2 description' },
      ];
      mockRepository.findBy.mockResolvedValue(result);

      const response = await service.findByIds([1, 2]);

      expect(response).toEqual(result);
      expect(mockRepository.findBy).toHaveBeenCalledWith({ id: In([1, 2]) });
    });

    it('should return an empty list if no roles match the given IDs', async () => {
      mockRepository.findBy.mockResolvedValue([]);

      const response = await service.findByIds([999, 1000]);

      expect(response).toEqual([]);
      expect(mockRepository.findBy).toHaveBeenCalledWith({
        id: In([999, 1000]),
      });
    });
  });
});
