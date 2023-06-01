import { forwardRef, Module } from '@nestjs/common';
import { UserModule } from '@user/user.module';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthConfig } from '@config';
import { JwtModule } from '@nestjs/jwt/dist/jwt.module';
import { JwtStrategy } from '@auth/refresh/strategy/jwt.strategy';
import { RefreshService } from '@auth/refresh/refresh.service';
import { RefreshController } from '@auth/refresh/refresh.controller';
import { LoginModule } from '@auth/login/login.module';

@Module({
  imports: [
    UserModule,
    ConfigModule,
    forwardRef(() => LoginModule),
    PassportModule.register({ session: true }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.getOrThrow<AuthConfig>('auth').refresh.jwt.secret,
        signOptions: {
          expiresIn:
            configService.getOrThrow<AuthConfig>('auth').refresh.jwt.maximumAge,
        },
      }),
    }),
  ],
  controllers: [RefreshController],
  providers: [RefreshService, JwtStrategy],
  exports: [RefreshService],
})
export class RefreshModule {}
