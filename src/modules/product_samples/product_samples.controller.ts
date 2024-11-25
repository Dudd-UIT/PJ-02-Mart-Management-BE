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

  @Controller('product-samples')
  export class ProductSamplesController {
    constructor(private readonly productSamplesService: ProductSamplesService) {}

    @Post()
    create(
      @Body('productSample', ValidationPipe) createProductSampleDto: CreateProductSampleDto,
      @Body('unitDetails', ValidationPipe) unitDetails: CreateProductUnitDto,
    ) {
      console.log(unitDetails);

      return this.productSamplesService.create(createProductSampleDto, unitDetails);
    }

    @Get()
    findAll(
      @Query() query: string,
      // @Query('current', ParseIntPipe) current: number,
      // @Query('pageSize', ParseIntPipe) pageSize: number,
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
      const parsedProductTypeId = productTypeId ? parseInt(productTypeId, 10) : null;

      return this.productSamplesService.findByProductType(parsedProductTypeId, name);
    }

    @Post('find-all-units')
    findAllUnits(
      @Body() findProductSampleUnitsByIdsDto: FindProductSampleUnitsByIdsDto,
      @Query('current') current: string,
      @Query('pageSize') pageSize: string,
    ) {

      return this.productSamplesService.findAllUnits(findProductSampleUnitsByIdsDto.productUnitIds, +current, +pageSize);
    }


    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
      return this.productSamplesService.findOne(id);
    }

    @Patch(':id')
    update(
      @Param('id', ParseIntPipe) id: number,
      @Body('updatedProductSample', ValidationPipe) updateProductSampleDto: UpdateProductSampleDto,
      @Body('updatedUnit', ValidationPipe) updateUnit: UpdateProductUnitDto,
    ) {
      return this.productSamplesService.update(id, updateProductSampleDto, updateUnit);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
      return this.productSamplesService.remove(id);
    }
  }
