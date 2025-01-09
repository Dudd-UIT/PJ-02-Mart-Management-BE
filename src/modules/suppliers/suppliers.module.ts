import { forwardRef, Module } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { SuppliersController } from './suppliers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductUnitsModule } from '../product_units/product_units.module';
import { Supplier } from './entities/supplier.entity';
import { SupplierProductsModule } from '../supplier_products/supplier_products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Supplier]),
    ProductUnitsModule,
    forwardRef(() => SupplierProductsModule),
  ],
  controllers: [SuppliersController],
  providers: [SuppliersService],
  exports: [SuppliersService],
})
export class SuppliersModule {}
