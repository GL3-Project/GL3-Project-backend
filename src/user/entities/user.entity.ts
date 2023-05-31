import { Column } from 'typeorm';
import { BaseEntity } from '@base/entities/base.entity';
import { IUser, UserAccount, UserRole } from '@user/intefaces/user.interface';
import { IAccount } from '@account/interfaces/account.interface';

export abstract class User<P> extends BaseEntity implements IUser<P> {
	profile: P;
	accounts: Record<UserAccount, IAccount>;

	@Column({ type: 'enum', enum: UserRole, nullable: false })
	role: UserRole;

	@Column({ type: 'varchar', nullable: true })
	accessToken?: string;

	@Column({ type: 'varchar', nullable: true })
	refreshToken?: string;
}
