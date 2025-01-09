import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthsService } from './auths.service';
import { LocalAuthGuard } from './passport/guards/local-auth.guard';
import { Public, ResponseMessage } from 'src/decorators/customDecorator';

@Controller('auths')
export class AuthsController {
  constructor(private readonly authsService: AuthsService) {}

  @Public()
  @Post('refresh')
  refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authsService.validateRefreshToken(refreshToken);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ResponseMessage('Đăng nhập thành công')
  login(@Request() req) {
    return this.authsService.login(req.user);
  }
}
