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
} from '@nestjs/common';
import { ProductSamplesService } from './product_samples.service';
import { CreateProductSampleDto } from './dto/create-product_sample.dto';
import { UpdateProductSampleDto } from './dto/update-product_sample.dto';
import { FindProductSampleUnitsByIdsDto } from './dto/find-product-sample-unit-by-ids.dto';
import { CreateProductUnitDto } from '../product_units/dto/create-product_unit.dto';
import { UpdateProductUnitDto } from '../product_units/dto/update-product_unit.dto';
import { ResponseMessage } from 'src/decorators/customDecorator';
import { CreateProductSampleAndProductUnitDto } from './dto/create-productSample_productUnit.dto';
import { UpdateProductSampleAndProductUnitsDto } from './dto/update-productSample_productUnit.dto';

@Controller('product-samples')
export class ProductSamplesController {
  constructor(private readonly productSamplesService: ProductSamplesService) {}

  @Post()
  @ResponseMessage('Tạo mẫu sản phẩm thành công')
  create(
    @Body(ValidationPipe)
    createProductSampleAndProductUnitDto: CreateProductSampleAndProductUnitDto,
  ) {
    return this.productSamplesService.createProductSampleAndProductUnits(
      createProductSampleAndProductUnitDto,
    );
  }

  @Get()
  @ResponseMessage('Trả về danh sách các mẫu sản phẩm thành công')
  findAll(
    @Query() query: any,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.productSamplesService.findAll(query, +current, +pageSize);
  }

  @Get('by-type')
  findByProductType(
    @Query('productTypeId') productTypeId: string,
    @Query('name') name: string,
  ) {
    const parsedProductTypeId = productTypeId
      ? parseInt(productTypeId, 10)
      : null;

    return this.productSamplesService.findByProductType(
      parsedProductTypeId,
      name,
    );
  }

  @Post('find-all-units')
  findAllUnits(
    @Body() findProductSampleUnitsByIdsDto: FindProductSampleUnitsByIdsDto,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.productSamplesService.findAllUnits(
      findProductSampleUnitsByIdsDto.productUnitIds,
      +current,
      +pageSize,
    );
  }

  @Get(':id')
  @ResponseMessage('Trả về thông tin chi tiết mẫu sản phẩm thành công')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productSamplesService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật thông tin chi tiết mẫu sản phẩm thành công')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe)
    updateProductSampleDto: UpdateProductSampleDto,
  ) {
    return this.productSamplesService.update(id, updateProductSampleDto);
  }

  @Patch('product-units/:id')
  @ResponseMessage(
    'Cập nhật thông tin chi tiết mẫu sản phẩm và các đơn vị thành công',
  )
  updateProductSampleAndProductUnits(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe)
    updateProductSampleAndProductUnitsDto: UpdateProductSampleAndProductUnitsDto,
  ) {
    return this.productSamplesService.updateProductSampleAndProductUnits(
      id,
      updateProductSampleAndProductUnitsDto,
    );
  }

  @Delete(':id')
  @ResponseMessage('Xóa mẫu dòng sản phẩm thành công')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productSamplesService.remove(id);
  }
}
