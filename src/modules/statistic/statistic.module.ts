import { Module } from '@nestjs/common';
import { StatisticsService } from './statistic.service';
import { StatisticsController } from './statistic.controller';
import { OrdersModule } from '../orders/orders.module';
import { InboundReceiptModule } from '../inbound_receipt/inbound_receipt.module';
import { BatchsModule } from '../batchs/batchs.module';
import { OrderDetailsModule } from '../order_details/order_details.module';

@Module({
  imports: [
    OrdersModule,
    InboundReceiptModule,
    BatchsModule,
    OrderDetailsModule,
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticModule {}
