import { Controller, Get, Query } from '@nestjs/common';
import { SupplierProductsService } from './supplier_products.service';

@Controller('supplier-products')
export class SupplierProductsController {
  constructor(
    private readonly supplierProductsService: SupplierProductsService,
  ) {}

  @Get()
  findAll(
    @Query() query: any,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.supplierProductsService.findAll(query, +current, +pageSize);
  }
}
