import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  ValidationPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductTypesService } from './product_types.service';
import { CreateProductTypeDto } from './dto/create-product_type.dto';
import { UpdateProductTypeDto } from './dto/update-product_type.dto';
import { ResponseMessage } from 'src/decorators/customDecorator';
import { RoleGuard } from '../auths/passport/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('product-types')
export class ProductTypesController {
  constructor(private readonly productTypesService: ProductTypesService) {}

  @Post()
  @ResponseMessage('Tạo loại sản phẩm thành công')
  @UseGuards(RoleGuard)
  @Roles('c_pdtype')
  create(@Body(ValidationPipe) createProductTypeDto: CreateProductTypeDto) {
    return this.productTypesService.create(createProductTypeDto);
  }

  @Get()
  @ResponseMessage('Trả về danh sách các loại sản phẩm thành công')
  @UseGuards(RoleGuard)
  @Roles('v_pdtypes')
  findAll(
    @Query() query: any,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.productTypesService.findAll(query, +current, +pageSize);
  }

  @Get(':id')
  @ResponseMessage('Trả về thông tin chi tiết loại sản phẩm thành công')
  @UseGuards(RoleGuard)
  @Roles('v_pdtypes')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productTypesService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật thông tin chi tiết loại sản phẩm thành công')
  @UseGuards(RoleGuard)
  @Roles('u_pdtype')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductTypeDto: UpdateProductTypeDto,
  ) {
    return this.productTypesService.update(id, updateProductTypeDto);
  }

  @Delete(':id')
  @ResponseMessage('Xóa dòng loại sản phẩm thành công')
  @UseGuards(RoleGuard)
  @Roles('d_pdtype')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productTypesService.remove(id);
  }
}
