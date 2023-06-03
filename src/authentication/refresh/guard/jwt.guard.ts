import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JWT_STRATEGY_NAME } from '@auth/refresh/strategy/jwt.strategy';

@Injectable()
export class JwtRefreshGuard extends AuthGuard(JWT_STRATEGY_NAME) {}
