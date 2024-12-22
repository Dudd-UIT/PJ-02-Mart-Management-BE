import { Module } from '@nestjs/common';
import { AuthsService } from './auths.service';
import { AuthsController } from './auths.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './passport/strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './passport/strategies/jwt.strategy';
import { GroupGuard } from './passport/guards/groups.guard';
import { RoleGuard } from './passport/guards/roles.guard';

@Module({
  imports: [
    UsersModule,
    PassportModule, // Đặt chiến lược mặc định là jwt
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION_TIME'),
        },
      }),
    }),
  ],
  controllers: [AuthsController],
  providers: [AuthsService, LocalStrategy, JwtStrategy, RoleGuard, GroupGuard],
  exports: [AuthsService],
})
export class AuthsModule {}
