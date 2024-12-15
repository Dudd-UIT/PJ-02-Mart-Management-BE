import { Test, TestingModule } from '@nestjs/testing';
import { ParametersController } from './parameters.controller';
import { ParametersService } from './parameters.service';
import { CreateParameterDto } from './dto/create-parameter.dto';
import { UpdateParameterDto } from './dto/update-parameter.dto';
import { NotFoundException } from '@nestjs/common';

describe('ParametersController', () => {
  let controller: ParametersController;
  let service: ParametersService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParametersController],
      providers: [
        {
          provide: ParametersService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ParametersController>(ParametersController);
    service = module.get<ParametersService>(ParametersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a parameter successfully', async () => {
      const createDto: CreateParameterDto = {
        name: 'Test',
        description: 'Test description',
        value: 10,
      };
      const result = { id: 1, ...createDto };

      mockService.create.mockResolvedValue(result);

      expect(await controller.create(createDto)).toEqual(result);
    });
  });

  describe('findAll', () => {
    it('should return all parameters', async () => {
      const result = {
        results: [{ id: 1, name: 'Test', value: 10 }],
      };
      mockService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should return a parameter by ID', async () => {
      const result = { id: 1, name: 'Test', value: 10 };
      mockService.findOne.mockResolvedValue(result);

      expect(await controller.findOne('1')).toEqual(result);
    });

    it('should throw NotFoundException if parameter not found', async () => {
      mockService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a parameter successfully', async () => {
      const updateDto: UpdateParameterDto = { name: 'Updated Name' };
      const result = { id: 1, name: 'Updated Name', value: 10 };

      mockService.update.mockResolvedValue(result);

      expect(await controller.update('1', updateDto)).toEqual(result);
    });
  });

  describe('remove', () => {
    it('should remove a parameter successfully', async () => {
      const result = { id: 1, name: 'Test', value: 10 };

      mockService.remove.mockResolvedValue(result);

      expect(await controller.remove('1')).toEqual(result);
    });
  });
});
