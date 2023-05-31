import { Module } from '@nestjs/common';
import { LocalAccountService } from './local-account.service';

@Module({
	providers: [LocalAccountService],
})
export class AccountModule {}
