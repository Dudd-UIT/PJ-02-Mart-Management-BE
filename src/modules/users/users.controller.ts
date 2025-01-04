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
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ChangePasswordDto,
  CreateCustomerDto,
  CreateUserDto,
} from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public, ResponseMessage } from 'src/decorators/customDecorator';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleGuard } from '../auths/passport/guards/roles.guard';
import { Response } from 'express'; // Import từ Express

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Get('verify-email')
  async verifyEmail(@Query('token') token: string, @Res() res: Response) {
    const htmlContent = await this.usersService.verifyEmail(token);

    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);
  }

  @ResponseMessage('Tạo mới khách hàng thành công')
  @Post('customer')
  @UseGuards(RoleGuard)
  @Roles('c_cus')
  createCustomer(@Body(ValidationPipe) createCustomerDto: CreateCustomerDto) {
    return this.usersService.createCustomer(createCustomerDto);
  }

  @ResponseMessage('Tạo mới tài khoản nhân viên thành công')
  @Post('staff')
  @UseGuards(RoleGuard)
  @Roles('c_staff')
  createStaff(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // @ResponseMessage('Tạo mới người dùng thành công')
  // @Post()
  // @UseGuards(RoleGuard)
  // @Roles('c_user')
  // create(@Body(ValidationPipe) createUserDto: CreateUserDto) {
  //   return this.usersService.create(createUserDto);
  // }

  @ResponseMessage('Trả về danh sách các khách hàng thành công')
  @Get()
  @UseGuards(RoleGuard)
  @Roles('v_cus', 'v_staffs')
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
  @Roles('v_cus', 'v_staffs')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOneById(id);
  }

  @ResponseMessage('Cập nhật thông tin chi tiết khách hàng thành công')
  @Patch(':id')
  @UseGuards(RoleGuard)
  @Roles('u_cus', 'u_staff')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @ResponseMessage('Reset mật khẩu nhân viên thành công')
  @Patch('/reset-pass/:id')
  @UseGuards(RoleGuard)
  @Roles('u_staff')
  resetPassword(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.resetPassword(id);
  }

  @ResponseMessage('Cập nhật thông tin chi tiết khách hàng thành công')
  @Patch('/change-pass/:id')
  @UseGuards(RoleGuard)
  @Roles('u_cus', 'u_staff')
  changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) changePasswordDto: ChangePasswordDto,
  ) {
    console.log('id', id);
    console.log('changePasswordDto', changePasswordDto);

    return this.usersService.changePassword(id, changePasswordDto);
  }

  @ResponseMessage('Xóa người dùng thành công')
  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles('d_cus', 'd_staff')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
