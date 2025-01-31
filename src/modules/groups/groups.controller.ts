import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { ResponseMessage } from 'src/decorators/customDecorator';
import { UpdateRoleGroupDto } from './dto/update-role-group.dto';
import { RoleGuard } from '../auths/passport/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @ResponseMessage('Tạo nhóm người dùng thành công')
  @Post()
  @UseGuards(RoleGuard)
  @Roles('c_group')
  create(@Body(ValidationPipe) createGroupDto: CreateGroupDto) {
    return this.groupsService.create(createGroupDto);
  }

  @ResponseMessage('Trả về danh sách các nhóm người dùng thành công')
  @Get()
  @UseGuards(RoleGuard)
  @Roles('v_groups')
  findAll(
    @Query() query: any,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.groupsService.findAll(query, +current, +pageSize);
  }

  @ResponseMessage('Trả về danh sách các nhóm người dùng nhân viên thành công')
  @Get('/employees')
  @UseGuards(RoleGuard)
  @Roles('v_groups')
  findAllEmployee(
    @Query() query: any,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.groupsService.findAllEmployee(query, +current, +pageSize);
  }

  @ResponseMessage('Trả về thông tin chi tiết nhóm người dùng thành công')
  @Get(':id')
  @UseGuards(RoleGuard)
  @Roles('v_groups')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.findOne(id);
  }

  @ResponseMessage('Cập nhật thông tin chi tiết nhóm người dùng thành công')
  @Patch(':id')
  @UseGuards(RoleGuard)
  @Roles('u_group')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSupplierDto: UpdateGroupDto,
  ) {
    return this.groupsService.update(id, updateSupplierDto);
  }

  @ResponseMessage('Xóa nhóm người dùng thành công')
  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles('d_group')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.remove(id);
  }

  @ResponseMessage('Gán quyền thành công')
  @Patch('/assign-roles/:id')
  @UseGuards(RoleGuard)
  @Roles('assign-roles')
  assignRolesToGroup(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateRoleGroupDto: UpdateRoleGroupDto,
  ) {
    return this.groupsService.assignRolesToGroup(id, updateRoleGroupDto);
  }
}
