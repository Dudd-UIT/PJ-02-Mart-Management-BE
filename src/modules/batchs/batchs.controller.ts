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
import { BatchsService } from './batchs.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';

@Controller('batchs')
export class BatchsController {
  constructor(private readonly batchsService: BatchsService) {}

  @Post()
  create(@Body(ValidationPipe) createBatchDto: CreateBatchDto) {
    return this.batchsService.create(createBatchDto);
  }

  @Get()
  findAll(
    @Query() query: any,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.batchsService.findAll(query, +current, +pageSize);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.batchsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBatchDto: UpdateBatchDto,
  ) {
    return this.batchsService.update(id, updateBatchDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.batchsService.remove(id);
  }
}
