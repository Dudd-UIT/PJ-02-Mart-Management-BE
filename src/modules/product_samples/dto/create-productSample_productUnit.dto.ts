import { IsNotEmpty } from 'class-validator';
import { CreateProductSampleDto } from './create-product_sample.dto';
import { CreateProductUnitDto } from 'src/modules/product_units/dto/create-product_unit.dto';

export class CreateProductSampleAndProductUnitDto {
  @IsNotEmpty()
  productSampleDto: CreateProductSampleDto;

  @IsNotEmpty()
  productUnitsDto: CreateProductUnitDto[];
}
