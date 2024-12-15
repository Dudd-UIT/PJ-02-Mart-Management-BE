import { Test, TestingModule } from '@nestjs/testing';
import { UnitsController } from './units.controller';
import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('UnitsController', () => {
  let controller: UnitsController;
  let service: UnitsService;

  const mockUnitsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnitsController],
      providers: [
        {
          provide: UnitsService,
          useValue: mockUnitsService,
        },
      ],
    }).compile();

    controller = module.get<UnitsController>(UnitsController);
    service = module.get<UnitsService>(UnitsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a unit successfully', async () => {
      const createUnitDto: CreateUnitDto = { name: 'kg' };
      const result = { id: 1, ...createUnitDto };
      mockUnitsService.create.mockResolvedValue(result);

      expect(await controller.create(createUnitDto)).toEqual(result);
      expect(mockUnitsService.create).toHaveBeenCalledWith(createUnitDto);
    });

    it('should throw a ConflictException if unit name already exists', async () => {
      const createUnitDto: CreateUnitDto = { name: 'kg' };
      mockUnitsService.create.mockRejectedValue(
        new ConflictException('Đơn vị tính đã tồn tại'),
      );

      await expect(controller.create(createUnitDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all units', async () => {
      const result = { meta: {}, results: [] };
      mockUnitsService.findAll.mockResolvedValue(result);

      expect(await controller.findAll('', '1', '10')).toEqual(result);
      expect(mockUnitsService.findAll).toHaveBeenCalledWith('', 1, 10);
    });
  });

  describe('findOne', () => {
    it('should return a unit by ID', async () => {
      const result = { id: 1, name: 'kg' };
      mockUnitsService.findOne.mockResolvedValue(result);

      expect(await controller.findOne(1)).toEqual(result);
      expect(mockUnitsService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if unit is not found', async () => {
      mockUnitsService.findOne.mockRejectedValue(
        new NotFoundException('Không tìm thấy đơn vị tính'),
      );

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a unit successfully', async () => {
      const updateUnitDto: UpdateUnitDto = { name: 'g' };
      const result = { id: 1, ...updateUnitDto };
      mockUnitsService.update.mockResolvedValue(result);

      expect(await controller.update(1, updateUnitDto)).toEqual(result);
      expect(mockUnitsService.update).toHaveBeenCalledWith(1, updateUnitDto);
    });
  });

  describe('remove', () => {
    it('should remove a unit successfully', async () => {
      const result = { id: 1, name: 'kg' };
      mockUnitsService.remove.mockResolvedValue(result);

      expect(await controller.remove(1)).toEqual(result);
      expect(mockUnitsService.remove).toHaveBeenCalledWith(1);
    });
  });
});
