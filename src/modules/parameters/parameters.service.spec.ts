import { Test, TestingModule } from '@nestjs/testing';
import { ParametersService } from './parameters.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Parameter } from './entities/parameter.entity';
import { Repository } from 'typeorm';
import {
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateParameterDto } from './dto/create-parameter.dto';
import { UpdateParameterDto } from './dto/update-parameter.dto';

describe('ParametersService', () => {
  let service: ParametersService;
  let repository: Repository<Parameter>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParametersService,
        {
          provide: getRepositoryToken(Parameter),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ParametersService>(ParametersService);
    repository = module.get<Repository<Parameter>>(
      getRepositoryToken(Parameter),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a parameter successfully', async () => {
      const createDto: CreateParameterDto = {
        name: 'Test Parameter',
        description: 'A test parameter',
        value: 10,
      };
      const parameter = { id: 1, ...createDto };

      mockRepository.create.mockReturnValue(parameter);
      mockRepository.save.mockResolvedValue(parameter);

      const result = await service.create(createDto);

      expect(result).toEqual(parameter);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(parameter);
    });

    it('should throw ConflictException if parameter name already exists', async () => {
      const createDto: CreateParameterDto = {
        name: 'Test Parameter',
        description: 'A test parameter',
        value: 10,
      };
      mockRepository.findOne.mockResolvedValue({ id: 1, ...createDto });

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all parameters', async () => {
      const parameters = [{ id: 1, name: 'Test', value: 10 }];
      mockRepository.find.mockResolvedValue(parameters);

      const result = await service.findAll();

      expect(result.results).toEqual(parameters);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a parameter by ID', async () => {
      const parameter = { id: 1, name: 'Test', value: 10 };
      mockRepository.findOne.mockResolvedValue(parameter);

      const result = await service.findOne(1);

      expect(result).toEqual(parameter);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if parameter not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a parameter successfully', async () => {
      const updateDto: UpdateParameterDto = { name: 'Updated Name' };
      const parameter = { id: 1, name: 'Test', value: 10 };
      const updatedParameter = { ...parameter, ...updateDto };

      mockRepository.findOne.mockResolvedValue(parameter);
      mockRepository.save.mockResolvedValue(updatedParameter);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedParameter);
      expect(mockRepository.save).toHaveBeenCalledWith(updatedParameter);
    });

    it('should throw ConflictException if name already exists', async () => {
      const updateDto: UpdateParameterDto = { name: 'Existing Name' };
      const parameter = { id: 1, name: 'Test', value: 10 };

      mockRepository.findOne.mockResolvedValueOnce(parameter); // Find existing parameter
      mockRepository.findOne.mockResolvedValueOnce({
        id: 2,
        name: 'Existing Name',
      }); // Check for conflicting name

      await expect(service.update(1, updateDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a parameter successfully', async () => {
      const parameter = { id: 1, name: 'Test', value: 10 };
      mockRepository.findOne.mockResolvedValue(parameter);

      const result = await service.remove(1);

      expect(result).toEqual(parameter);
      expect(mockRepository.softDelete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if parameter not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
