import { forwardRef, Module } from '@nestjs/common';
import { OrderDetailsService } from './order_details.service';
import { OrderDetailsController } from './order_details.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderDetail } from './entities/order_detail.entity';
import { OrdersModule } from '../orders/orders.module';
import { ProductUnitsModule } from '../product_units/product_units.module';
import { ProductUnit } from '../product_units/entities/product_unit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderDetail, ProductUnit]),
    forwardRef(() => OrdersModule),
    ProductUnitsModule,
  ],
  controllers: [OrderDetailsController],
  providers: [OrderDetailsService],
  exports: [OrderDetailsService],
})
export class OrderDetailsModule {}
