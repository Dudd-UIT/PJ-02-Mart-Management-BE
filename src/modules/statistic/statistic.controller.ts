import { Controller, Get, Query } from '@nestjs/common';
import { Public } from 'src/decorators/customDecorator';
import { StatisticsService } from './statistic.service';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Public()
  @Get('revenue')
  getRevenue() {
    return this.statisticsService.getRevenue();
  }

  @Public()
  @Get('revenue-detail')
  async getRevenueDetail(
    @Query('level') level: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.statisticsService.getRevenueDetail(level, startDate, endDate);
  }

  @Public()
  @Get('orders')
  async getOrderStats() {
    return this.statisticsService.getOrderStats();
  }

  @Public()
  @Get('inbound-cost')
  async getInboundCost() {
    return this.statisticsService.getInboundCost();
  }

  @Public()
  @Get('inventory-value')
  async getInventoryValue() {
    return this.statisticsService.getInventoryValue();
  }

  @Public()
  @Get('top-selling-products')
  async getTopSellingProducts(
    @Query('limit') limit: number = 10,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('searchProductTypeId') searchProductTypeId?: string,
    @Query('searchProductLineId') searchProductLineId?: string,
  ) {
    return await this.statisticsService.getTopSellingProducts(
      limit,
      startDate,
      endDate,
      +searchProductTypeId,
      +searchProductLineId,
    );
  }

  @Public()
  @Get('order-statistics')
  async getOrderStatistics(
    @Query('level') level: string = '1',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.statisticsService.getOrderStatistics(
      level,
      startDate,
      endDate,
    );
  }

  @Public()
  @Get('order-value-distribution')
  async getOrderValueDistribution(
    @Query('level') level: string = '1',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.statisticsService.getOrderValueDistribution(
      level,
      startDate,
      endDate,
    );
  }
}
