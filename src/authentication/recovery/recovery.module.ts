import { Module } from '@nestjs/common';
import { UserModule } from '@user/user.module';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthConfig } from '@config';
import { JwtModule } from '@nestjs/jwt/dist/jwt.module';
import { RecoveryService } from '@auth/recovery/recovery.service';
import { RecoveryController } from '@auth/recovery/recovery.controller';
import { MessagingModule } from '@messaging/messaging.module';
import { MagicLinkStrategy } from '@auth/recovery/strategy/magic-link.strategy';

@Module({
  imports: [
    UserModule,
    ConfigModule,
    PassportModule.register({ session: true }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret:
          configService.getOrThrow<AuthConfig>('auth').recovery.magicLink
            .secret,
        signOptions: {
          expiresIn:
            configService.getOrThrow<AuthConfig>('auth').recovery.magicLink
              .maximumAge,
        },
      }),
    }),
    MessagingModule,
  ],
  controllers: [RecoveryController],
  providers: [RecoveryService, MagicLinkStrategy],
  exports: [],
})
export class RecoveryModule {}
