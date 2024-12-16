import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupsService } from '../groups/groups.service';
import { User } from './entities/user.entity';
import {
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;
  let groupsService: GroupsService;

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
    find: jest.fn(),
    softDelete: jest.fn(),
  };

  const mockGroupsService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: GroupsService,
          useValue: mockGroupsService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
    groupsService = module.get<GroupsService>(GroupsService);
  });

  describe('createCustomer', () => {
    it('should create a customer successfully', async () => {
      const createCustomerDto = { name: 'Customer 1', phone: '0123456789' };
      const group = { id: 3, name: 'Customer' };
      const customer = { id: 1, ...createCustomerDto, group };

      mockRepository.findOne.mockResolvedValue(null);
      mockGroupsService.findOne.mockResolvedValue(group);
      mockRepository.create.mockReturnValue(customer);
      mockRepository.save.mockResolvedValue(customer);

      const result = await service.createCustomer(createCustomerDto);

      expect(result).toEqual(customer);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { phone: '0123456789' },
      });
      expect(mockGroupsService.findOne).toHaveBeenCalledWith(3);
      expect(mockRepository.create).toHaveBeenCalledWith({
        name: 'Customer 1',
        phone: '0123456789',
      });
    });

    it('should throw ConflictException if phone already exists', async () => {
      const createCustomerDto = { name: 'Customer 1', phone: '0123456789' };

      mockRepository.findOne.mockResolvedValue({ phone: '0123456789' });

      await expect(service.createCustomer(createCustomerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { phone: '0123456789' },
      });
    });

    it('should throw InternalServerErrorException if an unexpected error occurs', async () => {
      const createCustomerDto = { name: 'Customer 1', phone: '0123456789' };

      mockRepository.findOne.mockImplementation(() => {
        throw new Error('Unexpected Error');
      });

      await expect(service.createCustomer(createCustomerDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const createUserDto = {
        name: 'User 2',
        email: 'user2@example.com',
        password: 'password123',
        phone: '0123456789',
        address: '123 Main St',
        groupId: 2,
      };
      const group = { id: 2, name: 'Group 2' };
      const user = { id: 1, ...createUserDto, group };

      mockRepository.findOne.mockResolvedValue(null);
      mockGroupsService.findOne.mockResolvedValue(group);
      mockRepository.create.mockReturnValue(user);
      mockRepository.save.mockResolvedValue(user);

      const result = await service.create(createUserDto);

      expect(result).toEqual(user);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(mockGroupsService.findOne).toHaveBeenCalledWith(2);
    });

    it('should throw ConflictException if email already exists', async () => {
      const createUserDto = {
        name: 'User 2',
        email: 'user2@example.com',
        password: 'password123',
        phone: '0123456789',
        address: '123 Main St',
        groupId: 2,
      };

      mockRepository.findOne.mockResolvedValue({ email: createUserDto.email });

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
    });

    it('should throw ConflictException if phone already exists', async () => {
      const createUserDto = {
        name: 'User 2',
        email: 'user2@example.com',
        password: 'password123',
        phone: '0123456789',
        address: '123 Main St',
        groupId: 2,
      };

      mockRepository.findOne.mockResolvedValue({ phone: createUserDto.phone });

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { phone: createUserDto.phone },
      });
    });

    it('should throw NotFoundException if group does not exist', async () => {
      const createUserDto = {
        name: 'User 2',
        email: 'user2@example.com',
        password: 'password123',
        phone: '0123456789',
        address: '123 Main St',
        groupId: 9999, // Non-existing group ID
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockGroupsService.findOne.mockResolvedValue(null);

      await expect(service.create(createUserDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockGroupsService.findOne).toHaveBeenCalledWith(9999);
    });

    it('should throw InternalServerErrorException for unexpected errors', async () => {
      const createUserDto = {
        name: 'User 2',
        email: 'user2@example.com',
        password: 'password123',
        phone: '0123456789',
        address: '123 Main St',
        groupId: 2,
      };

      mockRepository.findOne.mockImplementation(() => {
        throw new Error('Unexpected Error');
      });

      await expect(service.create(createUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('isPhoneExist', () => {
    it('should return true if phone exists', async () => {
      const phone = '0987654321';

      mockRepository.findOne.mockResolvedValue({ phone });

      const result = await service.isPhoneExist(phone);

      expect(result).toBe(true);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { phone } });
    });

    it('should return false if phone does not exist', async () => {
      const phone = '0000000000';

      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.isPhoneExist(phone);

      expect(result).toBe(false);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { phone } });
    });

    it('should throw InternalServerErrorException if database query fails', async () => {
      const phone = '0987654321';

      mockRepository.findOne.mockImplementation(() => {
        throw new Error('Database Error');
      });

      await expect(service.isPhoneExist(phone)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('isEmailExist', () => {
    it('should return true if email exists', async () => {
      const email = 'existing@example.com';

      mockRepository.findOne.mockResolvedValue({ email });

      const result = await service.isEmailExist(email);

      expect(result).toBe(true);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { email } });
    });

    it('should return false if email does not exist', async () => {
      const email = 'notfound@example.com';

      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.isEmailExist(email);

      expect(result).toBe(false);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { email } });
    });

    it('should throw InternalServerErrorException if database query fails', async () => {
      const email = 'error@example.com';

      mockRepository.findOne.mockImplementation(() => {
        throw new Error('Database Error');
      });

      await expect(service.isEmailExist(email)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated users successfully with valid query and groupId', async () => {
      const query = { name: 'User 1' };
      const current = 1;
      const pageSize = 10;
      const groupId = 2;

      const mockResult = [{ id: 1, name: 'User 1', group: { id: 2 } }];

      mockRepository.count.mockResolvedValue(1);
      mockRepository.find.mockResolvedValue(mockResult);

      const result = await service.findAll(query, current, pageSize, groupId);

      expect(result).toEqual({
        meta: {
          current: 1,
          pageSize: 10,
          pages: 1,
          total: 1,
        },
        results: mockResult,
      });

      expect(mockRepository.count).toHaveBeenCalledWith({
        where: { name: 'User 1', group: { id: 2 } },
      });
    });

    it('should return default pagination when current and pageSize are undefined', async () => {
      const query = { name: 'User 1' };
      const groupId = 2;

      const mockResult = [{ id: 1, name: 'User 1', group: { id: 2 } }];

      mockRepository.count.mockResolvedValue(1);
      mockRepository.find.mockResolvedValue(mockResult);

      const result = await service.findAll(
        query,
        undefined,
        undefined,
        groupId,
      );

      expect(result).toEqual({
        meta: {
          current: 1,
          pageSize: 10,
          pages: 1,
          total: 1,
        },
        results: mockResult,
      });

      expect(mockRepository.count).toHaveBeenCalledWith({
        where: { name: 'User 1', group: { id: 2 } },
      });
    });

    it('should return empty array when no users match the filter', async () => {
      const query = { name: 'Non Existing User' };
      const current = 1;
      const pageSize = 10;

      mockRepository.count.mockResolvedValue(0);
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll(query, current, pageSize, undefined);

      expect(result).toEqual({
        meta: {
          current: 1,
          pageSize: 10,
          pages: 0,
          total: 0,
        },
        results: [],
      });

      expect(mockRepository.count).toHaveBeenCalledWith({
        where: { name: 'Non Existing User' },
      });
    });

    it('should handle InternalServerErrorException on unexpected error', async () => {
      const query = { name: 'User 1' };
      const current = 1;
      const pageSize = 10;

      mockRepository.count.mockImplementation(() => {
        throw new Error('Unexpected Error');
      });

      await expect(
        service.findAll(query, current, pageSize, undefined),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should return paginated users when groupId is negative', async () => {
      const query = { name: 'User 1' };
      const current = 1;
      const pageSize = 10;
      const groupId = -1;

      const mockResult = [{ id: 1, name: 'User 1', group: null }];

      mockRepository.count.mockResolvedValue(1);
      mockRepository.find.mockResolvedValue(mockResult);

      const result = await service.findAll(query, current, pageSize, groupId);

      expect(result).toEqual({
        meta: {
          current: 1,
          pageSize: 10,
          pages: 1,
          total: 1,
        },
        results: mockResult,
      });

      expect(mockRepository.count).toHaveBeenCalledWith({
        where: { name: 'User 1' },
      });
    });

    it('should handle undefined query parameter', async () => {
      const current = 1;
      const pageSize = 10;
      const groupId = undefined;

      const mockResult = [{ id: 1, name: 'Default User', group: null }];

      mockRepository.count.mockResolvedValue(1);
      mockRepository.find.mockResolvedValue(mockResult);

      const result = await service.findAll(
        undefined,
        current,
        pageSize,
        groupId,
      );

      expect(result).toEqual({
        meta: {
          current: 1,
          pageSize: 10,
          pages: 1,
          total: 1,
        },
        results: mockResult,
      });

      expect(mockRepository.count).toHaveBeenCalledWith({
        where: {},
      });
    });
  });

  describe('findOneById', () => {
    it('should return user by ID', async () => {
      const user = { id: 1, name: 'User 1' };

      mockRepository.findOne.mockResolvedValue(user);

      const result = await service.findOneById(1);

      expect(result).toEqual(user);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOneById(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      mockRepository.findOne.mockImplementation(() => {
        throw new Error('Unexpected Error');
      });

      await expect(service.findOneById(1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOneByEmail', () => {
    it('should return user by email', async () => {
      const email = 'existing@example.com';
      const user = { id: 1, email, name: 'User 1', group: { id: 2 } };

      mockRepository.findOne.mockResolvedValue(user);

      const result = await service.findOneByEmail(email);

      expect(result).toEqual(user);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email },
        relations: ['group'],
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOneByEmail('notfound@example.com'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      mockRepository.findOne.mockImplementation(() => {
        throw new Error('Unexpected Error');
      });

      await expect(
        service.findOneByEmail('existing@example.com'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const user = { id: 1, name: 'Old Name', email: 'old@example.com' };
      const updateUserDto = {
        name: 'Updated Name',
        email: 'new@example.com',
      };

      mockRepository.findOne
        .mockResolvedValueOnce(user)
        .mockResolvedValueOnce(null);

      mockRepository.save.mockResolvedValue({ ...user, ...updateUserDto });

      const result = await service.update(1, updateUserDto);

      expect(result).toEqual({ ...user, ...updateUserDto });
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: updateUserDto.email },
      });
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...user,
        ...updateUserDto,
      });
    });

    it('should throw ConflictException if email exists', async () => {
      const user = { id: 1, name: 'User', email: 'user1@example.com' };
      const updateUserDto = { email: 'existing@example.com' };

      mockRepository.findOne.mockResolvedValueOnce(user);
      mockRepository.findOne.mockResolvedValueOnce({
        email: 'existing@example.com',
      });

      await expect(service.update(1, updateUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException if phone exists', async () => {
      const user = { id: 1, name: 'User', phone: '123456789' };
      const updateUserDto = { phone: '0123456789' };

      mockRepository.findOne.mockResolvedValueOnce(user);
      mockRepository.findOne.mockResolvedValueOnce({ phone: '0123456789' });

      await expect(service.update(1, updateUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, {})).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if group does not exist', async () => {
      const user = { id: 1, name: 'User' };
      const updateUserDto = { groupId: 999 };

      mockRepository.findOne.mockResolvedValueOnce(user);
      mockGroupsService.findOne.mockResolvedValue(null);

      await expect(service.update(1, updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      const user = { id: 1, name: 'User' };
      const updateUserDto = { name: 'New Name' };

      mockRepository.findOne.mockResolvedValueOnce(user);
      mockRepository.save.mockImplementation(() => {
        throw new Error('Unexpected Error');
      });

      await expect(service.update(1, updateUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('remove', () => {
    it('should remove user successfully', async () => {
      const user = { id: 1, name: 'User' };

      mockRepository.findOne.mockResolvedValue(user);

      const result = await service.remove(1);

      expect(result).toEqual(user);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepository.softDelete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      mockRepository.findOne.mockImplementation(() => {
        throw new Error('Unexpected Error');
      });

      await expect(service.remove(1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
