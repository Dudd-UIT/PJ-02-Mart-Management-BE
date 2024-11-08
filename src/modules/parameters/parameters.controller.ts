import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ParametersService } from './parameters.service';
import { CreateParameterDto } from './dto/create-parameter.dto';
import { UpdateParameterDto } from './dto/update-parameter.dto';
import { ResponseMessage } from 'src/decorators/customDecorator';

@Controller('parameters')
export class ParametersController {
  constructor(private readonly parametersService: ParametersService) {}

  @ResponseMessage('Tạo tham số thành công')
  @Post()
  create(@Body() createParameterDto: CreateParameterDto) {
    return this.parametersService.create(createParameterDto);
  }

  @Get()
  findAll() {
    return this.parametersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.parametersService.findOne(+id);
  }

  @ResponseMessage('Cập nhật giá trị tham số thành công')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateParameterDto: UpdateParameterDto,
  ) {
    return this.parametersService.update(+id, updateParameterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.parametersService.remove(+id);
  }
}
