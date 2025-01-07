import { IsNotEmpty } from 'class-validator';
import { CreateCartDto } from './create-cart.dto';
import { CreateCartDetailDto } from 'src/modules/cart_details/dto/create-cart_detail.dto';

export class CreateCartAndCartDetailsDto {
  @IsNotEmpty()
  cartDto: CreateCartDto;

  @IsNotEmpty()
  cartDetailsDto: CreateCartDetailDto[];
}
