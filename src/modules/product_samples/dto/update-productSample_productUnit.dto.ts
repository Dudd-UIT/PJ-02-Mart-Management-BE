import { IsNotEmpty } from 'class-validator';
import { UpdateProductSampleDto } from './update-product_sample.dto';
import { UpdateProductUnitDto } from 'src/modules/product_units/dto/update-product_unit.dto';
import { CreateProductUnitDto } from 'src/modules/product_units/dto/create-product_unit.dto';

export class UpdateProductSampleAndProductUnitsDto {
  @IsNotEmpty()
  productSampleDto: UpdateProductSampleDto;

  @IsNotEmpty()
  productUnitsDto: CreateProductUnitDto[];
}
