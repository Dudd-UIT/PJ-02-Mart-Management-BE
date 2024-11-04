import { Module } from '@nestjs/common';
import { OrderDetailsService } from './order_details.service';
import { OrderDetailsController } from './order_details.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderDetail } from './entities/order_detail.entity';
import { OrdersModule } from '../orders/orders.module';
import { ProductUnitsModule } from '../product_units/product_units.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderDetail]),
    OrdersModule,
    ProductUnitsModule,
  ],
  controllers: [OrderDetailsController],
  providers: [OrderDetailsService],
})
export class OrderDetailsModule {}
