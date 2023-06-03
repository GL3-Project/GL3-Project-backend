import { Module } from '@nestjs/common';
import { LoginModule } from '@auth/login/login.module';
import { RegistrationModule } from '@auth/registration/registration.module';
import { RecoveryModule } from '@auth/recovery/recovery.module';
import { RefreshModule } from './refresh/refresh.module';

@Module({
  imports: [LoginModule, RefreshModule, RegistrationModule, RecoveryModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class AuthModule {}
