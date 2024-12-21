import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    console.log('requiredRoles', requiredRoles);

    if (!requiredRoles) {
      return true; // Không yêu cầu role => Cho phép truy cập
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    console.log('user', user);

    if (!user || !user.roles) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập tài nguyên này',
      );
    }

    const userRoles = user.roles;
    const result = requiredRoles.some((role) => userRoles.includes(role));
    console.log('result', result);

    if (!result) {
      console.error(`User ${user.id || 'N/A'} thiếu quyền: ${requiredRoles}`);
      throw new ForbiddenException(
        'Bạn không có quyền truy cập tài nguyên này',
      );
    }

    return result;
  }
}
