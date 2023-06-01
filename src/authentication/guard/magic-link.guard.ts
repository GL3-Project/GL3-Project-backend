import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MAGIC_LINK_STRATEGY_NAME } from '@authentication/strategy/magic-link.strategy';
import { Observable } from 'rxjs';

@Injectable()
export class MagicLinkAuthGuard extends AuthGuard(MAGIC_LINK_STRATEGY_NAME) {
	canActivate(
		context: ExecutionContext,
	): boolean | Promise<boolean> | Observable<boolean> {
		context.switchToHttp().getRequest().user_id = super.canActivate(context);
		return true;
	}
}
