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
import { BatchsService } from './batchs.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { RoleGuard } from '../auths/passport/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { ResponseMessage } from 'src/decorators/customDecorator';

@Controller('batchs')
export class BatchsController {
  constructor(private readonly batchsService: BatchsService) {}

  @Post()
  @ResponseMessage('Tạo mới lô hàng thành công')
  @UseGuards(RoleGuard)
  @Roles('c_batch')
  create(@Body(ValidationPipe) createBatchDto: CreateBatchDto) {
    return this.batchsService.create(createBatchDto);
  }

  @Get()
  @ResponseMessage('Trả về danh sách các lô hàng thành công')
  @UseGuards(RoleGuard)
  @Roles('v_batchs')
  findAll(
    @Query() query: any,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.batchsService.findAll(query, +current, +pageSize);
  }

  @Get(':id')
  @ResponseMessage('Trả về thông tin chi tiết lô hàng thành công')
  @UseGuards(RoleGuard)
  @Roles('v_batchs')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.batchsService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật thông tin chi tiết lô hàng thành công')
  @UseGuards(RoleGuard)
  @Roles('u_batch')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBatchDto: UpdateBatchDto,
  ) {
    return this.batchsService.update(id, updateBatchDto);
  }

  @Delete(':id')
  @ResponseMessage('Xóa lô hàng thành công')
  @UseGuards(RoleGuard)
  @Roles('d_batch')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.batchsService.remove(id);
  }
}
