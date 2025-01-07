import { PartialType } from '@nestjs/mapped-types';
import { CreateCartDetailDto } from './create-cart_detail.dto';

export class UpdateCartDetailDto extends PartialType(CreateCartDetailDto) {}
