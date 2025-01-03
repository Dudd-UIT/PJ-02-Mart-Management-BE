import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SupplierProductsService } from './supplier_products.service';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleGuard } from '../auths/passport/guards/roles.guard';

@Controller('supplier-products')
export class SupplierProductsController {
  constructor(
    private readonly supplierProductsService: SupplierProductsService,
  ) {}

  @Get()
  @UseGuards(RoleGuard)
  @Roles('v_sups')
  findAll(
    @Query() query: any,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.supplierProductsService.findAll(query, +current, +pageSize);
  }
}
