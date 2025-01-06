import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { comparePasswordHelper } from 'src/helpers/utils';
import { JwtService } from '@nestjs/jwt';
import { CodeDto } from './dto/codeDto';
import { v4 as uuidv4 } from 'uuid';

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

  generateAccessToken(user: any) {
    return this.jwtService.sign({
      name: user.name,
      sub: user.id,
      group: user.group.name,
      roles: user.group.roles.map((role) => role.url),
    });
  }

  generateRefreshToken(user: any) {
    return this.jwtService.sign(
      {
        sub: user.id,
        name: user.name,
      },
      { expiresIn: '7d' },
    );
  }

  login(user: any) {
    const accessToken = this.generateAccessToken(user);
    // const refreshToken = this.generateRefreshToken(user);
    };
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
      access_token: accessToken,
      // refresh_token: refreshToken,
    };
  }

  async validateRefreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.usersService.findOneById(payload.sub);
      if (!user) {
        throw new BadRequestException('Invalid or expired refresh token');
      }
      const newAccessToken = this.generateAccessToken(user);

      return { access_token: newAccessToken };
    } catch (error) {
      throw new BadRequestException('Invalid or expired refresh token');
    }
  }
}
