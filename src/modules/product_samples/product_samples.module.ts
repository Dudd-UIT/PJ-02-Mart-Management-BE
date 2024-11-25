import { Module } from '@nestjs/common';
import { ProductSamplesService } from './product_samples.service';
import { ProductSamplesController } from './product_samples.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductSample } from './entities/product_sample.entity';
import { ProductLinesModule } from '../product_lines/product_lines.module';
import { ProductUnit } from '../product_units/entities/product_unit.entity';
import { Unit } from '../units/entities/unit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductSample, ProductUnit, Unit]), ProductLinesModule],
  controllers: [ProductSamplesController],
  providers: [ProductSamplesService],
  exports: [ProductSamplesService],
})
export class ProductSamplesModule {}
