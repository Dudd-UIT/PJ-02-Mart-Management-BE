import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { UpdateRoleGroupDto } from '../groups/dto/update-role-group.dto';
import { ResponseMessage } from 'src/decorators/customDecorator';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @ResponseMessage('Trả về danh sách các vai trò thành công')
  @Get()
  findAll(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.rolesService.findAll(query, +current, +pageSize);
  }
}
