import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IUser, UserRole } from '@user/schema';
import { ROLES_KEY } from '@auth/decorator/role.decorator';
import { compareRoles } from '@auth/util/roles.util';
import { Observable } from 'rxjs';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRole = this.reflector.getAllAndOverride<UserRole>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const userRole = context.switchToHttp().getRequest<{ user?: IUser }>()
      .user?.role;

    return (
      !requiredRole ||
      (userRole !== undefined && compareRoles(userRole, requiredRole))
    );
  }
}
