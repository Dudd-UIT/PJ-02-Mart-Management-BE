import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsController } from './statistic.controller';
import { StatisticsService } from './statistic.service';

describe('StatisticController', () => {
  let controller: StatisticsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatisticsController],
      providers: [StatisticsService],
    }).compile();

    controller = module.get<StatisticsController>(StatisticsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
