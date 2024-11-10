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
import { UsersService } from './users.service';
import { CreateCustomerDto, CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseMessage } from 'src/decorators/customDecorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ResponseMessage('Tạo mới khách hàng thành công')
  @Post('customer')
  createCustomer(@Body(ValidationPipe) createCustomerDto: CreateCustomerDto) {
    return this.usersService.createCustomer(createCustomerDto);
  }

  @ResponseMessage('Tạo mới tài khoản nhân viên thành công')
  @Post('staff')
  createStaff(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ResponseMessage('Tạo mới người dùng thành công')
  @Post()
  create(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ResponseMessage('Trả về dánh sách các khách hàng thành công')
  @Get()
  findAll(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
    @Query('groupId') groupId: string,
  ) {
    return this.usersService.findAll(query, +current, +pageSize, +groupId);
  }

  @ResponseMessage('Trả về thông tin chi tiết khách hàng thành công')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOneById(id);
  }

  @ResponseMessage('Cập nhật thông tin chi tiết khách hàng thành công')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @ResponseMessage('Xóa người dùng thành công')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
