import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LOCAL_STRATEGY_NAME } from '@authentication/strategy/local.strategy';

@Injectable()
export class LocalAuthGuard extends AuthGuard(LOCAL_STRATEGY_NAME) {}
