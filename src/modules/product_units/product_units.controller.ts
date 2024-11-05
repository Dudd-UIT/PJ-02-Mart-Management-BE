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
import { ProductUnitsService } from './product_units.service';
import { CreateProductUnitDto } from './dto/create-product_unit.dto';
import { UpdateProductUnitDto } from './dto/update-product_unit.dto';
import { FindProductUnitsByIdsDto } from './dto/find-product_units-by-ids.dto';
import { ProductUnit } from './entities/product_unit.entity';

@Controller('product-units')
export class ProductUnitsController {
  constructor(private readonly productUnitsService: ProductUnitsService) {}

  @Post()
  create(@Body(ValidationPipe) createProductSampleDto: CreateProductUnitDto) {
    return this.productUnitsService.create(createProductSampleDto);
  }

  @Get()
  findAll(
    @Query() query: string,
    // @Query('current', ParseIntPipe) current: number,
    // @Query('pageSize', ParseIntPipe) pageSize: number,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.productUnitsService.findAll(query, +current, +pageSize);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productUnitsService.findOne(id);
  }

  @Post('find-by-ids')
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
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductUnitDto: UpdateProductUnitDto,
  ) {
    return this.productUnitsService.update(id, updateProductUnitDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productUnitsService.remove(id);
  }
}
