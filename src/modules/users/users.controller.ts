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
import { UsersService } from './users.service';
import { CreateCustomerDto, CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseMessage } from 'src/decorators/customDecorator';
import { Roles } from 'src/decorators/roles.decorator';
import { GroupGuard } from '../auths/passport/guards/groups.guard';
import { Groups } from 'src/decorators/groups.decorator';
import { RoleGuard } from '../auths/passport/guards/roles.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(GroupGuard)
  @Groups('Admin', 'Nhân viên')
  getProfile() {
    return 'This is the profile page.';
  }

  @Get('edit')
  @UseGuards(RoleGuard)
  @Roles('/customer')
  editPost() {
    return 'Editing posts allowed.';
  }

  @ResponseMessage('Tạo mới khách hàng thành công')
  @Post('customer')
  @UseGuards(RoleGuard)
  @Roles('create_customer')
  createCustomer(@Body(ValidationPipe) createCustomerDto: CreateCustomerDto) {
    return this.usersService.createCustomer(createCustomerDto);
  }

  @ResponseMessage('Tạo mới tài khoản nhân viên thành công')
  @Post('staff')
  @UseGuards(RoleGuard)
  @Roles('create_staff')
  createStaff(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // @ResponseMessage('Tạo mới người dùng thành công')
  // @Post()
  // @UseGuards(RoleGuard)
  // @Roles('create_user')
  // create(@Body(ValidationPipe) createUserDto: CreateUserDto) {
  //   return this.usersService.create(createUserDto);
  // }

  @ResponseMessage('Trả về danh sách các khách hàng thành công')
  @Get()
  @UseGuards(RoleGuard)
  @Roles('view_customers', 'view_staffs')
  findAll(
    @Query() query: any,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
    @Query('groupId') groupId: string,
  ) {
    return this.usersService.findAll(query, +current, +pageSize, +groupId);
  }

  @ResponseMessage('Trả về thông tin chi tiết khách hàng thành công')
  @Get(':id')
  @UseGuards(RoleGuard)
  @Roles('view_user')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOneById(id);
  }

  @ResponseMessage('Cập nhật thông tin chi tiết khách hàng thành công')
  @Patch(':id')
  @UseGuards(RoleGuard)
  @Roles('update_user')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @ResponseMessage('Xóa người dùng thành công')
  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles('delete_user')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
