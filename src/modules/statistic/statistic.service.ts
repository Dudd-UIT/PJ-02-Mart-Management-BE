import { BadRequestException, Injectable } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { OrderDetailsService } from '../order_details/order_details.service';
import { InboundReceiptService } from '../inbound_receipt/inbound_receipt.service';
import { BatchsService } from '../batchs/batchs.service';

@Injectable()
export class StatisticsService {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly orderDetailsService: OrderDetailsService,
    private readonly inboundReceiptService: InboundReceiptService,
    private readonly batchsService: BatchsService,
  ) {}

  async getRevenue() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    // Xác định khoảng thời gian
    const startOfDay = new Date(year, month - 1, date.getDate(), 0, 0, 0);
    const endOfDay = new Date(year, month - 1, date.getDate(), 23, 59, 59);

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59); // Ngày cuối tháng

    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59); // Ngày cuối năm

    return {
      daily: await this.ordersService.getRevenueByRange(startOfDay, endOfDay),
      monthly: await this.ordersService.getRevenueByRange(
        startOfMonth,
        endOfMonth,
      ),
      yearly: await this.ordersService.getRevenueByRange(
        startOfYear,
        endOfYear,
      ),
    };
  }

  async getRevenueDetail(level: string, startDate?: string, endDate?: string) {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // Xử lý `startDate` và `endDate`
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    if (level === '1') {
      // Thống kê theo năm
      const years =
        start || end
          ? Array.from(
              {
                length:
                  (end?.getFullYear() || currentYear) -
                  (start?.getFullYear() || currentYear) +
                  1,
              },
              (_, i) => (start?.getFullYear() || currentYear) + i,
            )
          : await this.ordersService.getYearsWithOrders();

      const result = await Promise.all(
        years.map(async (year) => {
          const yearStart = new Date(year, 0, 1);
          const yearEnd = new Date(year, 11, 31, 23, 59, 59);

          const adjustedStart = start && start > yearStart ? start : yearStart;
          const adjustedEnd = end && end < yearEnd ? end : yearEnd;

          return {
            time: `${year}`,
            income: await this.ordersService.getRevenueByRange(
              adjustedStart,
              adjustedEnd,
            ),
            expense: await this.inboundReceiptService.getInboundCostByRange(
              adjustedStart,
              adjustedEnd,
            ),
          };
        }),
      );

      return result;
    } else if (level === '2') {
      // Thống kê theo tháng
      const months = [];
      if (start || end) {
        const startYear = start?.getFullYear() || currentYear;
        const endYear = end?.getFullYear() || currentYear;
        const startMonth = start?.getMonth() + 1 || 1;
        const endMonth = end?.getMonth() + 1 || 12;

        for (let year = startYear; year <= endYear; year++) {
          const firstMonth = year === startYear ? startMonth : 1;
          const lastMonth = year === endYear ? endMonth : 12;
          for (let month = firstMonth; month <= lastMonth; month++) {
            months.push({ year, month });
          }
        }
      } else {
        // Nếu không có `startDate` và `endDate`, lấy 12 tháng của năm hiện tại
        months.push(
          ...Array.from({ length: 12 }, (_, i) => ({
            year: currentYear,
            month: i + 1,
          })),
        );
      }

      const result = await Promise.all(
        months.map(async ({ year, month }) => {
          const monthStart = new Date(year, month - 1, 1);
          const monthEnd = new Date(year, month, 0, 23, 59, 59);

          const adjustedStart =
            start && start > monthStart ? start : monthStart;
          const adjustedEnd = end && end < monthEnd ? end : monthEnd;

          return {
            time: `${month}/${year}`,
            income: await this.ordersService.getRevenueByRange(
              adjustedStart,
              adjustedEnd,
            ),
            expense: await this.inboundReceiptService.getInboundCostByRange(
              adjustedStart,
              adjustedEnd,
            ),
          };
        }),
      );

      return result;
    } else if (level === '3') {
      // Thống kê theo ngày
      const days = [];
      if (start || end) {
        const currentDate = start || new Date();
        const endDate = end || new Date();

        while (currentDate <= endDate) {
          days.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1); // Tăng ngày
        }
      } else {
        // Nếu không có `startDate` và `endDate`, lấy tất cả các ngày trong tháng hiện tại
        const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
          days.push(new Date(currentYear, currentMonth - 1, day));
        }
      }

      const result = await Promise.all(
        days.map(async (day) => {
          const dayStart = new Date(day.setHours(0, 0, 0, 0));
          const dayEnd = new Date(day.setHours(23, 59, 59, 999));

          return {
            time: `${dayStart.getDate()}/${dayStart.getMonth() + 1}/${dayStart.getFullYear()}`,
            income: await this.ordersService.getRevenueByRange(
              dayStart,
              dayEnd,
            ),
            expense: await this.inboundReceiptService.getInboundCostByRange(
              dayStart,
              dayEnd,
            ),
          };
        }),
      );

      return result;
    } else {
      throw new BadRequestException('Invalid level');
    }
  }

  async getOrderStats() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const startOfDay = new Date(year, month - 1, date.getDate(), 0, 0, 0);
    const endOfDay = new Date(year, month - 1, date.getDate(), 23, 59, 59);

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59); // Ngày cuối tháng

    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59); // Ngày cuối năm

    return {
      daily: await this.ordersService.getOrderCountByRange(
        startOfDay,
        endOfDay,
      ),
      monthly: await this.ordersService.getOrderCountByRange(
        startOfMonth,
        endOfMonth,
      ),
      yearly: await this.ordersService.getOrderCountByRange(
        startOfYear,
        endOfYear,
      ),
    };
  }

  async getInboundCost() {
    const date = new Date();
    const month = date.getMonth() + 1;
    const year = new Date(date).getFullYear();

    // Xác định khoảng thời gian
    const startOfDay = new Date(year, month - 1, date.getDate(), 0, 0, 0);
    const endOfDay = new Date(year, month - 1, date.getDate(), 23, 59, 59);

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59); // Ngày cuối tháng

    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59); // Ngày cuối năm

    return {
      daily: await this.inboundReceiptService.getInboundCostByRange(
        startOfDay,
        endOfDay,
      ),
      yearly: await this.inboundReceiptService.getInboundCostByRange(
        startOfYear,
        endOfYear,
      ),
    };
  }

  async getInventoryValue() {
    return {
      totalValue: await this.batchsService.getInventoryValue(),
    };
  }

  async getTopSellingProducts(
    limit: number = 10,
    startDate?: string,
    endDate?: string,
    searchProductTypeId?: number,
    searchProductLineId?: number,
  ) {
    return await this.orderDetailsService.getTopSellingProducts(
      limit,
      startDate,
      endDate,
      searchProductTypeId,
      searchProductLineId,
    );
  }

  async getOrderStatistics(
    level: string = '1',
    startDate?: string,
    endDate?: string,
  ) {
    // Xử lý `startDate` và `endDate`
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    if (level === '1') {
      // Thống kê đơn hàng theo năm
      const years =
        start || end
          ? Array.from(
              {
                length:
                  (end?.getFullYear() || new Date().getFullYear()) -
                  (start?.getFullYear() || new Date().getFullYear()) +
                  1,
              },
              (_, i) => (start?.getFullYear() || new Date().getFullYear()) + i,
            )
          : await this.ordersService.getYearsWithOrders();

      const result = await Promise.all(
        years.map(async (year) => {
          const yearStart = new Date(year, 0, 1);
          const yearEnd = new Date(year, 11, 31, 23, 59, 59);

          const adjustedStart = start && start > yearStart ? start : yearStart;
          const adjustedEnd = end && end < yearEnd ? end : yearEnd;

          return {
            time: `${year}`,
            orders: await this.ordersService.getOrderCountByRange(
              adjustedStart,
              adjustedEnd,
            ),
          };
        }),
      );

      return result;
    } else if (level === '2') {
      // Thống kê đơn hàng theo tháng
      const months = [];
      if (start || end) {
        const startYear = start?.getFullYear() || new Date().getFullYear();
        const endYear = end?.getFullYear() || new Date().getFullYear();
        const startMonth = start?.getMonth() + 1 || 1;
        const endMonth = end?.getMonth() + 1 || 12;

        for (let year = startYear; year <= endYear; year++) {
          const firstMonth = year === startYear ? startMonth : 1;
          const lastMonth = year === endYear ? endMonth : 12;
          for (let month = firstMonth; month <= lastMonth; month++) {
            months.push({ year, month });
          }
        }
      } else {
        const currentYear = new Date().getFullYear();
        months.push(
          ...Array.from({ length: 12 }, (_, i) => ({
            year: currentYear,
            month: i + 1,
          })),
        );
      }

      const result = await Promise.all(
        months.map(async ({ year, month }) => {
          const monthStart = new Date(year, month - 1, 1);
          const monthEnd = new Date(year, month, 0, 23, 59, 59);

          const adjustedStart =
            start && start > monthStart ? start : monthStart;
          const adjustedEnd = end && end < monthEnd ? end : monthEnd;

          return {
            time: `${month}/${year}`,
            orders: await this.ordersService.getOrderCountByRange(
              adjustedStart,
              adjustedEnd,
            ),
          };
        }),
      );

      return result;
    } else if (level === '3') {
      // Thống kê đơn hàng theo ngày
      const days = [];
      if (start || end) {
        const currentDate = new Date(start || new Date());
        const endDate = end || new Date();

        while (currentDate <= endDate) {
          days.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1); // Tăng ngày
        }
      } else {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        const daysInMonth = new Date(
          currentYear,
          currentMonth + 1,
          0,
        ).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
          days.push(new Date(currentYear, currentMonth, day));
        }
      }

      const result = await Promise.all(
        days.map(async (day) => {
          const dayStart = new Date(day.setHours(0, 0, 0, 0));
          const dayEnd = new Date(day.setHours(23, 59, 59, 999));

          return {
            time: `${dayStart.getDate()}/${dayStart.getMonth() + 1}/${dayStart.getFullYear()}`,
            orders: await this.ordersService.getOrderCountByRange(
              dayStart,
              dayEnd,
            ),
          };
        }),
      );

      return result;
    } else {
      throw new BadRequestException('Invalid level');
    }
  }

  async getOrderValueDistribution(
    level: string = '1',
    startDate?: string,
    endDate?: string,
  ) {
    const data = await this.ordersService.getOrderValueDistribution(
      level,
      startDate,
      endDate,
    );
    return data;
  }
}
