import { forwardRef, Module } from '@nestjs/common';
import { ProductUnitsService } from './product_units.service';
import { ProductUnitsController } from './product_units.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductUnit } from './entities/product_unit.entity';
import { ProductSamplesModule } from '../product_samples/product_samples.module';
import { UnitsModule } from '../units/units.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductUnit]),
    forwardRef(() => ProductSamplesModule),
    UnitsModule,
  ],
  controllers: [ProductUnitsController],
  providers: [ProductUnitsService],
  exports: [ProductUnitsService],
})
export class ProductUnitsModule {}
