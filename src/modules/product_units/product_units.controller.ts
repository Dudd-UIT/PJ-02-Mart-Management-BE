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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ProductUnitsService } from './product_units.service';
import { CreateProductUnitDto } from './dto/create-product_unit.dto';
import { UpdateProductUnitDto } from './dto/update-product_unit.dto';
import { FindProductUnitsByIdsDto } from './dto/find-product_units-by-ids.dto';
import { ResponseMessage } from 'src/decorators/customDecorator';
import { RoleGuard } from '../auths/passport/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('product-units')
export class ProductUnitsController {
  constructor(private readonly productUnitsService: ProductUnitsService) {}

  @Post()
  @ResponseMessage('Thêm mới đơn vị tính cho mẫu sản phẩm thành công')
  @UseGuards(RoleGuard)
  @Roles('create_product-unit')
  create(@Body(ValidationPipe) createProductSampleDto: CreateProductUnitDto) {
    return this.productUnitsService.create(createProductSampleDto);
  }

  @Get()
  @ResponseMessage(
    'Trả về danh sách các đơn vị tính cho mẫu sản phẩm thành công',
  )
  @UseGuards(RoleGuard)
  @Roles('view_product-units')
  findAll(
    @Query() query: any,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
    @Query('productLineId') productLineId: string,
  ) {
    return this.productUnitsService.findAll(
      query,
      +current,
      +pageSize,
      +productLineId,
    );
  }

  @Get('/supplier/:id')
  @ResponseMessage(
    'Trả về danh sách các đơn vị tính cho mẫu sản phẩm thành công',
  )
  @UseGuards(RoleGuard)
  @Roles('view_product-units-by-supplier')
  findBySupplier(
    @Param('id') id: string,
    @Query() query: any,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
    @Query('productLineId') productLineId: string,
  ) {
    return this.productUnitsService.findBySupplier(
      +id,
      query,
      +current,
      +pageSize,
      +productLineId,
    );
  }

  @Get(':id')
  @UseGuards(RoleGuard)
  @Roles('view_product-unit')
  @ResponseMessage(
    'Trả về thông tin chi tiết một đơn vị tính cho mẫu sản phẩm thành công',
  )
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productUnitsService.findOne(id);
  }

  @Post('find-by-ids')
  @UseGuards(RoleGuard)
  @Roles('view_product-units')
  async findByIds(
    @Body() findProductUnitsByIdsDto: FindProductUnitsByIdsDto,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.productUnitsService.findByIds(
      findProductUnitsByIdsDto.ids,
      +current,
      +pageSize,
    );
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật đơn vị tính cho mẫu sản phẩm thành công')
  @UseGuards(RoleGuard)
  @Roles('update_product-unit')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductUnitDto: UpdateProductUnitDto,
  ) {
    return this.productUnitsService.update(id, updateProductUnitDto);
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles('delete_product-unit')
  @ResponseMessage('Xóa đơn vị tính cho mẫu dòng sản phẩm thành công')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productUnitsService.remove(id);
  }
}
