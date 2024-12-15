import { Test, TestingModule } from '@nestjs/testing';
import { AuthsService } from './auths.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { comparePasswordHelper } from 'src/helpers/utils';
import { InternalServerErrorException } from '@nestjs/common';

jest.mock('../../helpers/utils', () => ({
  comparePasswordHelper: jest.fn(),
}));

describe('validateUser', () => {
  let service: AuthsService;
  let usersService: UsersService;

  const mockUsersService = {
    findOneByEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthsService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthsService>(AuthsService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return user when email and password are correct', async () => {
    const email = 'test@test.com';
    const password = 'abc';
    const hashedPassword = 'hashedPassword';

    const user = { id: 1, email, password: hashedPassword, name: 'Test User' };
    mockUsersService.findOneByEmail.mockResolvedValue(user);
    (comparePasswordHelper as jest.Mock).mockResolvedValue(true);

    const result = await service.validateUser(email, password);

    expect(result).toEqual({ id: 1, email, name: 'Test User' });
    expect(usersService.findOneByEmail).toHaveBeenCalledWith(email);
    expect(comparePasswordHelper).toHaveBeenCalledWith(
      password,
      hashedPassword,
    );
  });

  it('should return null if user is not found', async () => {
    const email = 'not_found@test.com';
    const password = 'abc';

    mockUsersService.findOneByEmail.mockResolvedValue(null);

    const result = await service.validateUser(email, password);

    expect(result).toBeNull();
    expect(usersService.findOneByEmail).toHaveBeenCalledWith(email);
    expect(comparePasswordHelper).not.toHaveBeenCalled();
  });

  it('should return null if password is incorrect', async () => {
    const email = 'test@test.com';
    const password = '123';
    const hashedPassword = 'hashedPassword';

    const user = { id: 1, email, password: hashedPassword, name: 'Test User' };
    mockUsersService.findOneByEmail.mockResolvedValue(user);
    (comparePasswordHelper as jest.Mock).mockResolvedValue(false);

    const result = await service.validateUser(email, password);

    expect(result).toBeNull();
    expect(usersService.findOneByEmail).toHaveBeenCalledWith(email);
    expect(comparePasswordHelper).toHaveBeenCalledWith(
      password,
      hashedPassword,
    );
  });
});

describe('login', () => {
  let service: AuthsService;
  let usersService: UsersService;

  const mockUsersService = {
    findOneByEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthsService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthsService>(AuthsService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return user and access token when login is successful', async () => {
    const email = 'test@test.com';
    const password = 'correctPassword';
    const hashedPassword = 'hashedPassword';

    const user = {
      id: 1,
      email,
      password: hashedPassword,
      name: 'Test User',
      phone: '123456789',
      address: '123 Main St',
      group: { name: 'admin' },
    };

    const token = 'mocked_token';

    // Mock methods
    mockUsersService.findOneByEmail.mockResolvedValue(user);
    (comparePasswordHelper as jest.Mock).mockResolvedValue(true);
    mockJwtService.sign.mockReturnValue(token);

    const result = await service.login({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      address: user.address,
      group: user.group,
    });

    expect(result).toEqual({
      user: {
        id: 1,
        email: 'test@test.com',
        name: 'Test User',
        phone: '123456789',
        address: '123 Main St',
        groupName: 'admin',
      },
      access_token: token,
    });

    expect(mockJwtService.sign).toHaveBeenCalledWith({
      name: user.name,
      sub: user.id,
    });
  });

  it('should return null if user does not exist in database', async () => {
    const email = 'not_found@test.com';
    const password = 'randomPassword';

    mockUsersService.findOneByEmail.mockResolvedValue(null);

    const result = await service.validateUser(email, password);

    expect(result).toBeNull();
    expect(mockUsersService.findOneByEmail).toHaveBeenCalledWith(email);
    expect(comparePasswordHelper).not.toHaveBeenCalled();
  });

  it('should throw InternalServerErrorException when an error occurs', async () => {
    const email = 'test@test.com';
    const password = 'randomPassword';

    // Mock to throw an error
    mockUsersService.findOneByEmail.mockRejectedValue(
      new InternalServerErrorException('Database connection error'),
    );

    await expect(service.validateUser(email, password)).rejects.toThrow(
      InternalServerErrorException,
    );

    expect(mockUsersService.findOneByEmail).toHaveBeenCalledWith(email);
  });
});
