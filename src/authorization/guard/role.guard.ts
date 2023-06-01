import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IUser, UserRole } from '@/user/intefaces/user.interface';
import { ROLES_KEY } from '@/authorization/decorator/role.decorator';
import { Observable } from 'rxjs';

@Injectable()
export class RoleGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(
		context: ExecutionContext,
	): boolean | Promise<boolean> | Observable<boolean> {
		const requiredRole = this.reflector.getAllAndOverride<UserRole>(
			ROLES_KEY,
			[context.getHandler(), context.getClass()],
		);
		const userRole = context.switchToHttp().getRequest<{ user?: IUser }>()
			.user?.role;

		return (
			!requiredRole || (userRole !== undefined && userRole === requiredRole)
		);
	}
}
