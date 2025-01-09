import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

describe('RolesController', () => {
  let controller: RolesController;
  let service: RolesService;

  const mockRolesService = {
    findAll: jest.fn(),
    findByIds: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: mockRolesService,
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    service = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a list of roles with pagination', async () => {
      const result = {
        meta: { current: 1, pageSize: 10, pages: 1, total: 2 },
        results: [
          { id: 1, url: '/role-1', description: 'Role 1 description' },
          { id: 2, url: '/role-2', description: 'Role 2 description' },
        ],
      };
      mockRolesService.findAll.mockResolvedValue(result);

      expect(await controller.findAll('', '1', '10')).toEqual(result);
      expect(mockRolesService.findAll).toHaveBeenCalledWith('', 1, 10);
    });

    it('should return an empty list if no roles are found', async () => {
      const result = {
        meta: { current: 1, pageSize: 10, pages: 0, total: 0 },
        results: [],
      };
      mockRolesService.findAll.mockResolvedValue(result);

      expect(await controller.findAll('', '1', '10')).toEqual(result);
      expect(mockRolesService.findAll).toHaveBeenCalledWith('', 1, 10);
    });
  });
});
