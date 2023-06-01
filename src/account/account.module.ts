import { Module } from '@nestjs/common';
import { LocalAccountService } from './local-account.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalAccount } from '@account/entities/local-account.entity';

@Module({
	imports: [TypeOrmModule.forFeature([LocalAccount])],
	providers: [LocalAccountService],
	exports: [LocalAccountService],
})
export class AccountModule {}
