import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthsService } from './auths.service';
import { LocalAuthGuard } from './passport/guards/local-auth.guard';
import { Public, ResponseMessage } from 'src/decorators/customDecorator';

@Controller('auths')
export class AuthsController {
  constructor(private readonly authsService: AuthsService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ResponseMessage('Đăng nhập thành công')
  login(@Request() req) {
    return this.authsService.login(req.user);
  }
}
