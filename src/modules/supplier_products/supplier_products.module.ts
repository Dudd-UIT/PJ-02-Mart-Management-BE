import { forwardRef, Module } from '@nestjs/common';
import { SupplierProductsService } from './supplier_products.service';
import { SupplierProductsController } from './supplier_products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupplierProduct } from './entities/supplier_product.entity';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { ProductSamplesModule } from '../product_samples/product_samples.module';
import { ProductUnitsModule } from '../product_units/product_units.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SupplierProduct]),
    forwardRef(() => SuppliersModule),
    ProductUnitsModule,
  ],
  controllers: [SupplierProductsController],
  providers: [SupplierProductsService],
  exports: [SupplierProductsService],
})
export class SupplierProductsModule {}
