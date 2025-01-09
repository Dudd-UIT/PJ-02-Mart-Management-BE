import { forwardRef, Module } from '@nestjs/common';
import { ProductSamplesService } from './product_samples.service';
import { ProductSamplesController } from './product_samples.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductSample } from './entities/product_sample.entity';
import { ProductLinesModule } from '../product_lines/product_lines.module';
import { ProductUnit } from '../product_units/entities/product_unit.entity';
import { Unit } from '../units/entities/unit.entity';
import { ProductUnitsModule } from '../product_units/product_units.module';
import { RecommendationModule } from '../recommendation/recommendation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductSample, ProductUnit, Unit]),
    ProductLinesModule,
    RecommendationModule,
    forwardRef(() => ProductUnitsModule),
  ],
  controllers: [ProductSamplesController],
  providers: [ProductSamplesService],
  exports: [ProductSamplesService],
})
export class ProductSamplesModule {}
