import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthsService } from './auths.service';
import { LocalAuthGuard } from './passport/guards/local-auth.guard';
import { Public, ResponseMessage } from 'src/decorators/customDecorator';
import { MailerService } from '@nestjs-modules/mailer';
import { CodeDto } from './dto/codeDto';

@Controller('auths')
export class AuthsController {
  constructor(
    private readonly authsService: AuthsService,
    private readonly mailerService: MailerService,
  ) {}

  @Get('mail')
  @Public()
  testMail() {
    this.mailerService.sendMail({
      to: 'danhdudoan999@gmail.com', // list of receivers
      subject: 'Testing Nest MailerModule ✔', // Subject line
      text: 'welcome', // plaintext body
      template: 'register',
      context: {
        name: 'Du',
        activationCode: 123456789,
      },
    });
    return 'ok';
  }

  @Public()
  @Post('check-code')
  checkCode(@Body() codeDto: CodeDto) {
    return this.authsService.checkCode(codeDto);
  }

  @Public()
  @Post('retry-active')
  retryActive(@Body('email') email: string) {
    return this.authsService.retryActive(email);
  }

  @Public()
  @Post('retry-password')
  retryPassword(@Body('email') email: string) {
    return this.authsService.retryPassword(email);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ResponseMessage('Đăng nhập thành công')
  login(@Request() req) {
    return this.authsService.login(req.user);
  }
}
