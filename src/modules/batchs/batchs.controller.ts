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

@Controller('batchs')
export class BatchsController {
  constructor(private readonly batchsService: BatchsService) {}

  @Post()
  @UseGuards(RoleGuard)
  @Roles('create_batch')
  create(@Body(ValidationPipe) createBatchDto: CreateBatchDto) {
    return this.batchsService.create(createBatchDto);
  }

  @Get()
  @UseGuards(RoleGuard)
  @Roles('view_batchs')
  findAll(
    @Query() query: any,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.batchsService.findAll(query, +current, +pageSize);
  }

  @Get(':id')
  @UseGuards(RoleGuard)
  @Roles('view_batch')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.batchsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RoleGuard)
  @Roles('update_batch')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBatchDto: UpdateBatchDto,
  ) {
    return this.batchsService.update(id, updateBatchDto);
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles('delete_batch')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.batchsService.remove(id);
  }
}
