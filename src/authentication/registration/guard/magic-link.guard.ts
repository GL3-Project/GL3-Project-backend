import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MAGIC_LINK_STRATEGY_NAME } from '@auth/registration/strategy/magic-link.strategy';

@Injectable()
export class MagicLinkAuthGuard extends AuthGuard(MAGIC_LINK_STRATEGY_NAME) {}
