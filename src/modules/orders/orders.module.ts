import { forwardRef, Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderDetailsModule } from '../order_details/order_details.module';
import { CartDetailsModule } from '../cart_details/cart_details.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    UsersModule,
    CartDetailsModule,
    forwardRef(() => OrderDetailsModule),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
