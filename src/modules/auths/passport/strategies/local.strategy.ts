import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { AuthsService } from '../../auths.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authsService: AuthsService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authsService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Email/Mật khẩu không chính xác');
    }
    // if (user.isActive === 0) {
    //   throw new BadRequestException('Tài khoản chưa được kích hoạt');
    // }
    return user;
  }
}
