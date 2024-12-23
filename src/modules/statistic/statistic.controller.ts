// statistics.controller.ts
import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { BatchsService } from '../batchs/batchs.service';
import { InboundReceiptService } from '../inbound_receipt/inbound_receipt.service';
import { OrdersService } from '../orders/orders.service';
import { Public } from 'src/decorators/customDecorator';
import { OrderDetailsService } from '../order_details/order_details.service';

@Controller('statistics')
export class StatisticsController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly orderDetailsService: OrderDetailsService,
    private readonly inboundReceiptService: InboundReceiptService,
    private readonly batchsService: BatchsService,
  ) {}

  @Public()
  @Get('revenue')
  async getRevenue(@Query('date') date: string) {
    const year = new Date(date).getFullYear();
    const month = new Date(date).getMonth() + 1;
    console.log('date', date);
    return {
      daily: await this.ordersService.getRevenueByDate(date),
      monthly: await this.ordersService.getRevenueByMonth(year, month),
      yearly: await this.ordersService.getRevenueByYear(year),
    };
  }

  @Public()
  @Get('revenue-detail')
  async getRevenueDetail(
    @Query('level') level: string, // 1: Năm, 2: Tháng, 3: Ngày
    @Query('date') date: string,
  ) {
    const year = new Date(date).getFullYear();
    const month = new Date(date).getMonth() + 1;

    if (level === '1') {
      // Thu chi theo từng năm
      const years = await this.ordersService.getYearsWithOrders();
      const result = await Promise.all(
        years.map(async (y) => ({
          time: `${y}`,
          income: await this.ordersService.getRevenueByYear(y),
          expense: await this.inboundReceiptService.getInboundCostByYear(y),
        })),
      );
      return result;
    } else if (level === '2') {
      // Thu chi theo từng tháng của năm hiện tại
      const result = await Promise.all(
        Array.from({ length: 12 }, (_, i) => i + 1).map(async (m) => ({
          time: `${m}/${year}`,
          income: await this.ordersService.getRevenueByMonth(year, m),
          expense: await this.inboundReceiptService.getInboundCostByMonth(
            year,
            m,
          ),
        })),
      );
      return result;
    } else if (level === '3') {
      // Thu chi theo từng ngày của tháng hiện tại
      const daysInMonth = new Date(year, month, 0).getDate();
      const result = await Promise.all(
        Array.from({ length: daysInMonth }, (_, i) => i + 1).map(async (d) => ({
          time: `${d}/${month}`,
          income: await this.ordersService.getRevenueByDate(
            `${year}-${month}-${d}`,
          ),
          expense: await this.inboundReceiptService.getInboundCostByDate(
            `${year}-${month}-${d}`,
          ),
        })),
      );
      return result;
    } else {
      throw new BadRequestException('Invalid level');
    }
  }

  @Public()
  @Get('orders')
  async getOrderStats(@Query('date') date: string) {
    const year = new Date(date).getFullYear();
    const month = new Date(date).getMonth() + 1;

    return {
      daily: await this.ordersService.getOrderCountByDate(date),
      monthly: await this.ordersService.getOrderCountByMonth(year, month),
      yearly: await this.ordersService.getOrderCountByYear(year),
    };
  }

  @Public()
  @Get('inbound-cost')
  async getInboundCost(@Query('date') date: string) {
    const year = new Date(date).getFullYear();

    return {
      daily: await this.inboundReceiptService.getInboundCostByDate(date),
      yearly: await this.inboundReceiptService.getInboundCostByYear(year),
    };
  }

  @Public()
  @Get('inventory-value')
  async getInventoryValue() {
    return {
      totalValue: await this.batchsService.getInventoryValue(),
    };
  }

  @Public()
  @Get('top-selling-products')
  async getTopSellingProducts(
    @Query('limit') limit: number = 10,
    @Query('date') date?: string, // Optional: Filter by date
  ) {
    return this.orderDetailsService.getTopSellingProducts(limit, date);
  }
}
