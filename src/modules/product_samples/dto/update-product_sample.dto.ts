import { PartialType } from '@nestjs/mapped-types';
import { CreateProductSampleDto } from './create-product_sample.dto';

export class UpdateProductSampleDto extends PartialType(
  CreateProductSampleDto,
) {}
