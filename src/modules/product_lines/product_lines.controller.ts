import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ProductLinesService } from './product_lines.service';
import { CreateProductLineDto } from './dto/create-product_line.dto';
import { UpdateProductLineDto } from './dto/update-product_line.dto';
import { ResponseMessage } from 'src/decorators/customDecorator';
import { RoleGuard } from '../auths/passport/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('product-lines')
export class ProductLinesController {
  constructor(private readonly productLinesService: ProductLinesService) {}

  @Post()
  @ResponseMessage('Tạo dòng sản phẩm thành công')
  @UseGuards(RoleGuard)
  @Roles('create_product-line')
  create(@Body(ValidationPipe) createProductLineDto: CreateProductLineDto) {
    return this.productLinesService.create(createProductLineDto);
  }

  @Get()
  @ResponseMessage('Trả về danh sách các dòng sản phẩm thành công')
  @UseGuards(RoleGuard)
  @Roles('view_product-lines')
  findAll(
    @Query() query: any,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
    @Query('productTypeId') productTypeId: string,
  ) {
    return this.productLinesService.findAll(
      query,
      +current,
      +pageSize,
      +productTypeId,
    );
  }

  @Get(':id')
  @ResponseMessage('Trả về thông tin chi tiết dòng sản phẩm thành công')
  @UseGuards(RoleGuard)
  @Roles('view_product-line')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productLinesService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật thông tin chi tiết dòng sản phẩm thành công')
  @UseGuards(RoleGuard)
  @Roles('update_product-line')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductLineDto: UpdateProductLineDto,
  ) {
    return this.productLinesService.update(id, updateProductLineDto);
  }

  @Delete(':id')
  @ResponseMessage('Xóa dòng dòng sản phẩm thành công')
  @UseGuards(RoleGuard)
  @Roles('delete_product-line')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productLinesService.remove(id);
  }
}
