import { IAccounts, UserAccount } from '@user/intefaces/user.interface';
import { LocalAccount } from '@account/entities/local-account.entity';
import { IAccount } from '@account/interfaces/account.interface';
import { JoinColumn, OneToOne } from 'typeorm';

export class Accounts implements IAccounts {
	@OneToOne(() => LocalAccount, { eager: true, nullable: true })
	@JoinColumn()
	[UserAccount.local]?: LocalAccount;

	[UserAccount.google]?: IAccount;
}
