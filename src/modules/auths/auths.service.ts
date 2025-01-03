import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { comparePasswordHelper } from 'src/helpers/utils';
import { JwtService } from '@nestjs/jwt';
import { CodeDto } from './dto/codeDto';

@Injectable()
export class AuthsService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      return null;
    }
    const isValidPassword = await comparePasswordHelper(pass, user.password);
    if (!isValidPassword) {
      return null;
    }
    const { password, ...result } = user;
    return result;
  }

  login(user: any) {
    const payload = {
      name: user.name,
      sub: user.id,
      group: user.group.name,
      roles: user.group.roles.map((role) => role.url),
    };
    console.log('payload', payload);
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        address: user.address,
        groupName: user.group.name,
        roles: user.group.roles.map((role) => role.url),
      },
      access_token: this.jwtService.sign(payload),
    };
  }

  async checkCode(codeDto: CodeDto) {
    return await this.usersService.handleCheckCode(codeDto);
  }

  async retryActive(email: string) {
    return await this.usersService.handleRetryActive(email);
  }

  async retryPassword(email: string) {
    return await this.usersService.handleRetryPassword(email);
  }
}
