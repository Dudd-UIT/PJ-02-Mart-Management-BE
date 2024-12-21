import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class GroupGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredGroups = this.reflector.get<string[]>(
      'groups',
      context.getHandler(),
    );
    console.log('requiredGroups', requiredGroups);
    if (!requiredGroups) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    console.log('user', user);
    if (!user || !user.group) {
      return false;
    }
    console.log('user.group', user.group);

    const result = requiredGroups.includes(user.group);
    console.log('result', result);

    if (!result) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập tài nguyên này',
      );
    }

    return result;
  }
}
