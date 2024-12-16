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

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return a list of parameters successfully', async () => {
      const mockParameters = [
        { id: 1, name: 'Param 1', value: 100 },
        { id: 2, name: 'Param 2', value: 200 },
      ];
      mockRepository.find.mockResolvedValue(mockParameters);

      const result = await service.findAll();

      expect(result.results).toEqual(mockParameters);
      expect(mockRepository.find).toHaveBeenCalled();
    });

    it('should return an empty list if no parameters are found', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result.results).toEqual([]);
      expect(mockRepository.find).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on database error', async () => {
      mockRepository.find.mockRejectedValue(new Error('Database error'));

      await expect(service.findAll()).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a parameter successfully', async () => {
      const updateDto: UpdateParameterDto = { value: 10000 };
      const parameter = { id: 1, name: 'Test', value: 10 };
      const updatedParameter = { ...parameter, ...updateDto };

      mockRepository.findOne.mockResolvedValue(parameter);
      mockRepository.save.mockResolvedValue(updatedParameter);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedParameter);
      expect(mockRepository.save).toHaveBeenCalledWith(updatedParameter);
    });

    it('should throw NotFoundException if parameter not found', async () => {
      const id = -1;
      const updateDto: UpdateParameterDto = { value: 10000 };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(id, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });
});
