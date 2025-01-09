import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto, CreateCustomerDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    createCustomer: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findOneById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createCustomer', () => {
    it('should create a customer successfully', async () => {
      const createCustomerDto: CreateCustomerDto = {
        name: 'Customer 1',
        phone: '123456789',
      };
      const result = { id: 1, ...createCustomerDto };
      mockUsersService.createCustomer.mockResolvedValue(result);

      expect(await controller.createCustomer(createCustomerDto)).toEqual({
        message: 'Tạo mới khách hàng thành công',
        data: result,
      });
      expect(mockUsersService.createCustomer).toHaveBeenCalledWith(
        createCustomerDto,
      );
    });

    it('should throw a ConflictException if phone already exists', async () => {
      const createCustomerDto: CreateCustomerDto = {
        name: 'Customer 1',
        phone: '123456789',
      };
      mockUsersService.createCustomer.mockRejectedValue(
        new ConflictException('Số điện thoại đã tồn tại'),
      );

      await expect(
        controller.createCustomer(createCustomerDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('create', () => {
    it('should create a staff successfully', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Staff 1',
        email: 'staff1@example.com',
        password: '123456',
        address: '123 Main St',
        phone: '987654321',
        groupId: 2,
      };
      const result = { id: 1, ...createUserDto };
      mockUsersService.create.mockResolvedValue(result);

      expect(await controller.create(createUserDto)).toEqual({
        message: 'Tạo mới tài khoản nhân viên thành công',
        data: result,
      });
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const result = { meta: {}, results: [] };
      mockUsersService.findAll.mockResolvedValue(result);

      expect(await controller.findAll('', '1', '10', '2')).toEqual({
        message: 'Trả về danh sách các khách hàng thành công',
        data: result,
      });
      expect(mockUsersService.findAll).toHaveBeenCalledWith('', 1, 10, 2);
    });
  });

  describe('findOne', () => {
    it('should return a user by ID', async () => {
      const result = { id: 1, name: 'User 1' };
      mockUsersService.findOneById.mockResolvedValue(result);

      expect(await controller.findOne(1)).toEqual({
        message: 'Trả về thông tin chi tiết khách hàng thành công',
        data: result,
      });
      expect(mockUsersService.findOneById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUsersService.findOneById.mockRejectedValue(
        new NotFoundException('Không tìm thấy người dùng'),
      );

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      const updateUserDto: UpdateUserDto = { name: 'Updated User' };
      const result = { id: 1, ...updateUserDto };
      mockUsersService.update.mockResolvedValue(result);

      expect(await controller.update(1, updateUserDto)).toEqual({
        message: 'Cập nhật thông tin chi tiết khách hàng thành công',
        data: result,
      });
      expect(mockUsersService.update).toHaveBeenCalledWith(1, updateUserDto);
    });
  });

  describe('remove', () => {
    it('should remove a user successfully', async () => {
      const result = { id: 1, name: 'User 1' };
      mockUsersService.remove.mockResolvedValue(result);

      expect(await controller.remove(1)).toEqual({
        message: 'Xóa người dùng thành công',
        data: result,
      });
      expect(mockUsersService.remove).toHaveBeenCalledWith(1);
    });
  });
});
