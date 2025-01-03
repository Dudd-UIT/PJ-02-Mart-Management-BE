import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ValidationPipe,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { ResponseMessage } from 'src/decorators/customDecorator';
import { RoleGuard } from '../auths/passport/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @ResponseMessage('Tạo nhà cung cấp thành công')
  @Post()
  @UseGuards(RoleGuard)
  @Roles('c_sup')
  create(@Body(ValidationPipe) createSupplierDto: CreateSupplierDto) {
    return this.suppliersService.create(createSupplierDto);
  }

  @ResponseMessage('Trả về danh sách các nhà cung cấp thành công')
  @Get()
  @UseGuards(RoleGuard)
  @Roles('v_sups')
  findAll(
    @Query() query: any,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.suppliersService.findAll(query, +current, +pageSize);
  }

  @ResponseMessage('Trả về thông tin chi tiết nhà cung cấp thành công')
  @Get(':id')
  @UseGuards(RoleGuard)
  @Roles('v_sups')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.suppliersService.findOne(id);
  }

  @ResponseMessage('Cập nhật thông tin chi tiết nhà cung cấp thành công')
  @Patch(':id')
  @UseGuards(RoleGuard)
  @Roles('u_sup')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return this.suppliersService.update(id, updateSupplierDto);
  }

  @ResponseMessage('Xóa nhà cung cấp thành công')
  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles('d_sup')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.suppliersService.remove(id);
  }
}
