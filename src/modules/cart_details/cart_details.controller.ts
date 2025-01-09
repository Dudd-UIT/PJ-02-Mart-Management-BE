import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { Roles } from 'src/decorators/roles.decorator';
import { CreateCartDetailDto } from './dto/create-cart_detail.dto';
import { RoleGuard } from '../auths/passport/guards/roles.guard';
import { CartDetailsService } from './cart_details.service';
import { ResponseMessage } from 'src/decorators/customDecorator';

@Controller('cart-details')
export class CartDetailsController {

    constructor(private readonly cartDetailsService: CartDetailsService) {}
    
    @Post()
    // @UseGuards(RoleGuard)
    // @Roles('c_cart')
    create(@Body() createCartDetailDto: CreateCartDetailDto) {
    return this.cartDetailsService.create(createCartDetailDto);
    }

    @ResponseMessage('Xóa chi tiết giỏ hàng thành công')
    @Delete(':id')
    // @UseGuards(RoleGuard)
    // @Roles('d_order_detail')
    remove(@Param('id', ParseIntPipe) id: number) {
    return this.cartDetailsService.remove(id);
    }
}
