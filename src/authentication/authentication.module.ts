import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '@user/user.module';

@Module({
	imports: [PassportModule.register({ session: true }), UserModule],
	controllers: [AuthenticationController],
	providers: [AuthenticationService],
})
export class AuthenticationModule {}
