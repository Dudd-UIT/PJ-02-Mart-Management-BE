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
import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { RoleGuard } from '../auths/passport/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { ResponseMessage } from 'src/decorators/customDecorator';

@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Post()
  @ResponseMessage('Tạo đơn vị tính thành công')
  @UseGuards(RoleGuard)
  @Roles('c_unit')
  create(@Body(ValidationPipe) createUnitDto: CreateUnitDto) {
    return this.unitsService.create(createUnitDto);
  }

  @Get()
  @ResponseMessage('Trả về danh sách đơn vị tính thành công')
  @UseGuards(RoleGuard)
  @Roles('v_units')
  findAll(
    @Query() query: any,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.unitsService.findAll(query, +current, +pageSize);
  }

  @Get(':id')
  @ResponseMessage('Trả về thông tin chi tiết đơn vị tính thành công')
  @UseGuards(RoleGuard)
  @Roles('v_units')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.unitsService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật đơn vị tính thành công')
  @UseGuards(RoleGuard)
  @Roles('u_unit')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUnitDto: UpdateUnitDto,
  ) {
    return this.unitsService.update(id, updateUnitDto);
  }

  @Delete(':id')
  @ResponseMessage('Xóa đơn vị tính thành công')
  @UseGuards(RoleGuard)
  @Roles('d_unit')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.unitsService.remove(id);
  }
}
