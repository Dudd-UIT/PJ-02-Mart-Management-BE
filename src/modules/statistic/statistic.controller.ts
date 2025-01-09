import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Public } from 'src/decorators/customDecorator';
import { StatisticsService } from './statistic.service';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleGuard } from '../auths/passport/guards/roles.guard';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Public()
  @Get('revenue')
  getRevenue() {
    return this.statisticsService.getRevenue();
  }

  @Get('revenue-detail')
  @UseGuards(RoleGuard)
  @Roles('v_statis')
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

  @Get('top-selling-products')
  @UseGuards(RoleGuard)
  @Roles('v_statis')
  async getTopSellingProducts(
    @Query('limit') limit?: number,
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

  @Get('order-statistics')
  @UseGuards(RoleGuard)
  @Roles('v_statis')
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

  @Get('order-value-distribution')
  @UseGuards(RoleGuard)
  @Roles('v_statis')
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
