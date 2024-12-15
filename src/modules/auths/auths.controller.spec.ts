import { Test, TestingModule } from '@nestjs/testing';
import { AuthsController } from './auths.controller';
import { AuthsService } from './auths.service';
import { LocalAuthGuard } from './passport/guards/local-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { NotFoundException } from '@nestjs/common';
import { ResponseMessage } from 'src/decorators/customDecorator';

describe('AuthsController', () => {
  let controller: AuthsController;
  let authsService: AuthsService;
  let jwtService: JwtService;

  const mockAuthsService = {
    login: jest.fn(),
    validateUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthsController],
      providers: [
        {
          provide: AuthsService,
          useValue: mockAuthsService,
        },
        JwtService,
      ],
    }).compile();

    controller = module.get<AuthsController>(AuthsController);
    authsService = module.get<AuthsService>(AuthsService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should successfully login and return a JWT', async () => {
      const req = {
        user: {
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
          phone: '123456789',
          address: '123 Test St',
          group: { name: 'user' },
        },
      };

      const loginResponse = {
        user: req.user,
        access_token: 'jwt_token',
      };

      mockAuthsService.login.mockResolvedValue(loginResponse);

      const result = await controller.login(req);

      expect(result).toEqual(loginResponse);
      expect(mockAuthsService.login).toHaveBeenCalledWith(req.user);
    });

    it('should throw NotFoundException if user not found', async () => {
      const req = {
        user: {
          email: 'nonexistent@example.com',
          password: 'password',
        },
      };

      mockAuthsService.validateUser.mockResolvedValue(null); // simulate user not found

      await expect(controller.login(req)).rejects.toThrowError(
        new NotFoundException('User not found or invalid credentials'),
      );
    });
  });
});
