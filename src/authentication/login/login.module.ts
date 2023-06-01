import { forwardRef, Module } from '@nestjs/common';
import { UserModule } from '@user/user.module';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthConfig } from '@config';
import { JwtModule } from '@nestjs/jwt/dist/jwt.module';
import { JwtStrategy } from '@auth/login/strategy/jwt.strategy';
import { LocalStrategy } from '@auth/login/strategy/local.strategy';
import { LoginController } from '@auth/login/login.controller';
import { LoginService } from '@auth/login/login.service';
import { RefreshModule } from '@authentication/refresh/refresh.module';

@Module({
  imports: [
    UserModule,
    ConfigModule,
    forwardRef(() => RefreshModule),
    PassportModule.register({ session: true }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.getOrThrow<AuthConfig>('auth').login.jwt.secret,
        signOptions: {
          expiresIn:
            configService.getOrThrow<AuthConfig>('auth').login.jwt.maximumAge,
        },
      }),
    }),
  ],
  controllers: [LoginController],
  providers: [LoginService, JwtStrategy, LocalStrategy],
  exports: [LoginService],
})
export class LoginModule {}
