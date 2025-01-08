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
  BadRequestException,
} from '@nestjs/common';
import { ProductSamplesService } from './product_samples.service';
import { UpdateProductSampleDto } from './dto/update-product_sample.dto';
import { Public, ResponseMessage } from 'src/decorators/customDecorator';
import { CreateProductSampleAndProductUnitDto } from './dto/create-productSample_productUnit.dto';
import { UpdateProductSampleAndProductUnitsDto } from './dto/update-productSample_productUnit.dto';
import { RoleGuard } from '../auths/passport/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('product-samples')
export class ProductSamplesController {
  constructor(private readonly productSamplesService: ProductSamplesService) {}

  @Post()
  @ResponseMessage('Tạo mẫu sản phẩm thành công')
  @UseGuards(RoleGuard)
  @Roles('c_pdsam')
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
  @UseGuards(RoleGuard)
  @Roles('v_pdsams')
  findAll(
    @Query() query: any,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.productSamplesService.findAll(query, +current, +pageSize);
  }

  @Get('/shopping')
  @ResponseMessage('Trả về danh sách các mẫu sản phẩm thành công')
  @UseGuards(RoleGuard)
  @Roles('v_pdsams')
  findAllProductSampleAndBatches(
    @Query() query: any,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.productSamplesService.findAllProductSampleAndBatches(
      query,
      +current,
      +pageSize,
    );
  }

  @Public()
  @Get('/online-shopping')
  @ResponseMessage('Trả về danh sách các mẫu sản phẩm thành công')
  // @UseGuards(RoleGuard)
  // @Roles('v_pdsams')
  findAllShopping(
    @Query() query: any,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.productSamplesService.findAllShopping(
      query,
      +current,
      +pageSize,
    );
  }

  @Get('/online-shopping-recommend')
  @ResponseMessage('Trả về danh sách các mẫu sản phẩm có đề xuất thành công')
  // @UseGuards(RoleGuard)
  // @Roles('v_pdsams')
  findAllRecommend(
    @Query() query: any,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
    @Query('customerId') customerId: string,
  ) {
    const customerIdNumber = parseInt(customerId, 10);
    return this.productSamplesService.findAllRecommend(
      query,
      +current,
      +pageSize,
      customerIdNumber,
    );
  }
  

  @Get(':id')
  @ResponseMessage('Trả về thông tin chi tiết mẫu sản phẩm thành công')
  @UseGuards(RoleGuard)
  @Roles('v_pdsams')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productSamplesService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật thông tin chi tiết mẫu sản phẩm thành công')
  @UseGuards(RoleGuard)
  @Roles('u_pdsam')
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
  @UseGuards(RoleGuard)
  @Roles('u_pdsam')
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
  @UseGuards(RoleGuard)
  @Roles('d_pdsam')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productSamplesService.remove(id);
  }
}
