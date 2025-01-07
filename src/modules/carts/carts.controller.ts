import { ResponseMessage } from 'src/decorators/customDecorator';
import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { RoleGuard } from '../auths/passport/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { CreateCartAndCartDetailsDto } from './dto/create-cart_cart-detail.dto';
import { CartsService } from './carts.service';

@Controller('carts')
export class CartsController {

    constructor(private readonly cartsService: CartsService) {}

  @ResponseMessage('Tạo mới giỏ hàng thành công')
  @Post('cart-details')
  // @UseGuards(RoleGuard)
  // @Roles('c_cart')
  createCartAndCartDetails(
    @Body(ValidationPipe)
    createCartAndCartDetailsDto: CreateCartAndCartDetailsDto,
  ) {
    return this.cartsService.createCartAndCartDetails(
        createCartAndCartDetailsDto,
    );
  }
  @ResponseMessage('Trả về thông tin chi tiết giỏ hàng thành công')
    @Get(':id')
    // @UseGuards(RoleGuard)
    // @Roles('v_carts')
    findOne(@Param('id', ParseIntPipe) id: number) {
      return this.cartsService.findOneByCustomerId(id);
    }
}
