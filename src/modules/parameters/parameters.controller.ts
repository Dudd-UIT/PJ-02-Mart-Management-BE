import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ParametersService } from './parameters.service';
import { UpdateParameterDto } from './dto/update-parameter.dto';
import { ResponseMessage } from 'src/decorators/customDecorator';
import { RoleGuard } from '../auths/passport/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('parameters')
export class ParametersController {
  constructor(private readonly parametersService: ParametersService) {}

  @Get()
  @UseGuards(RoleGuard)
  @Roles('u_param')
  findAll() {
    return this.parametersService.findAll();
  }

  @Get(':id')
  @UseGuards(RoleGuard)
  @Roles('u_param')
  findOne(@Param('id') id: string) {
    return this.parametersService.findOne(+id);
  }

  @ResponseMessage('Cập nhật giá trị tham số thành công')
  @Patch(':id')
  @UseGuards(RoleGuard)
  @Roles('u_param')
  update(
    @Param('id') id: string,
    @Body() updateParameterDto: UpdateParameterDto,
  ) {
    return this.parametersService.update(+id, updateParameterDto);
  }
}
