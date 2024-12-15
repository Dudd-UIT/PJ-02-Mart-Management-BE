import { Test, TestingModule } from '@nestjs/testing';
import { UnitsService } from './units.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from './entities/unit.entity';
import {
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('UnitsService', () => {
  let service: UnitsService;
  let repository: Repository<Unit>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    find: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnitsService,
        {
          provide: getRepositoryToken(Unit),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UnitsService>(UnitsService);
    repository = module.get<Repository<Unit>>(getRepositoryToken(Unit));
  });

  describe('create', () => {
    it('should create a unit successfully', async () => {
      const createUnitDto = { name: 'Hộp' };
      const createdUnit = { id: 1, ...createUnitDto };

      mockRepository.findOne.mockResolvedValue(null); // Không có đơn vị tính trùng tên
      mockRepository.create.mockReturnValue(createdUnit);
      mockRepository.save.mockResolvedValue(createdUnit);

      const result = await service.create(createUnitDto);

      expect(result).toEqual(createdUnit);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { name: 'Hộp' },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(createdUnit);
    });

    it('should throw ConflictException if unit already exists', async () => {
      const createUnitDto = { name: 'Hộp' };

      mockRepository.findOne.mockResolvedValue(createUnitDto);

      await expect(service.create(createUnitDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw InternalServerErrorException for unexpected errors', async () => {
      const createUnitDto = { name: 'Hộp' };

      mockRepository.findOne.mockRejectedValue(new Error('Unexpected Error'));

      await expect(service.create(createUnitDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated units successfully', async () => {
      const query = { name: 'Hộp' };
      const current = 1;
      const pageSize = 10;

      const mockUnits = [{ id: 1, name: 'Hộp' }];
      mockRepository.count.mockResolvedValue(1);
      mockRepository.find.mockResolvedValue(mockUnits);

      const result = await service.findAll(query, current, pageSize);

      expect(result).toEqual({
        meta: {
          current: 1,
          pageSize: 10,
          pages: 1,
          total: 1,
        },
        results: mockUnits,
      });
      expect(mockRepository.count).toHaveBeenCalled();
      expect(mockRepository.find).toHaveBeenCalled();
    });

    it('should return empty results when no units found', async () => {
      mockRepository.count.mockResolvedValue(0);
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll({}, 1, 10);

      expect(result).toEqual({
        meta: {
          current: 1,
          pageSize: 10,
          pages: 0,
          total: 0,
        },
        results: [],
      });
    });

    it('should throw InternalServerErrorException on query failure', async () => {
      mockRepository.count.mockRejectedValue(new Error('Query Error'));

      await expect(service.findAll({}, 1, 10)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a unit by ID', async () => {
      const unit = { id: 1, name: 'Hộp' };
      mockRepository.findOne.mockResolvedValue(unit);

      const result = await service.findOne(1);

      expect(result).toEqual(unit);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if unit not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException for unexpected errors', async () => {
      mockRepository.findOne.mockRejectedValue(new Error('Unexpected Error'));

      await expect(service.findOne(1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    it('should update a unit successfully', async () => {
      const updateUnitDto = { name: 'Gói' };
      const existingUnit = { id: 1, name: 'Hộp' };
      const updatedUnit = { id: 1, name: 'Gói' };

      mockRepository.findOne.mockResolvedValueOnce(existingUnit);
      mockRepository.findOne.mockResolvedValueOnce(null); // Không trùng tên
      mockRepository.save.mockResolvedValue(updatedUnit);

      const result = await service.update(1, updateUnitDto);

      expect(result).toEqual(updatedUnit);
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...existingUnit,
        ...updateUnitDto,
      });
    });

    it('should throw NotFoundException if unit does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, { name: 'Gói' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if name already exists', async () => {
      const existingUnit = { id: 1, name: 'Hộp' };

      mockRepository.findOne.mockResolvedValueOnce(existingUnit);
      mockRepository.findOne.mockResolvedValueOnce({ name: 'Gói' });

      await expect(service.update(1, { name: 'Gói' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a unit successfully', async () => {
      const unit = { id: 1, name: 'Hộp' };
      mockRepository.findOne.mockResolvedValue(unit);

      const result = await service.remove(1);

      expect(result).toEqual(unit);
      expect(mockRepository.softDelete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if unit does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException for unexpected errors', async () => {
      mockRepository.findOne.mockRejectedValue(new Error('Unexpected Error'));

      await expect(service.remove(1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
