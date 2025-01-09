import { forwardRef, Module } from '@nestjs/common';
import { CartDetailsController } from './cart_details.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartDetail } from './entities/cart_detail.entity';
import { ProductUnit } from '../product_units/entities/product_unit.entity';
import { CartsModule } from '../carts/carts.module';
import { ProductUnitsModule } from '../product_units/product_units.module';
import { CartDetailsService } from './cart_details.service';
import { Batch } from '../batchs/entities/batch.entity';
import { BatchsModule } from '../batchs/batchs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartDetail, ProductUnit, Batch]),
    forwardRef(() => CartsModule),
    ProductUnitsModule,
    BatchsModule,
  ],
  controllers: [CartDetailsController],
  providers: [CartDetailsService],
  exports: [CartDetailsService],
})
export class CartDetailsModule {}
