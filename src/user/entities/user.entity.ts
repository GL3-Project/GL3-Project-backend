import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '@base/entities/base.entity';
import { IUser, UserRole } from '@user/intefaces/user.interface';
import { Accounts } from '@user/entities/accounts.entity';
import { Profile } from '@user/entities/profile.entity';

@Entity({ name: 'user' })
export class User extends BaseEntity implements IUser {
	@OneToOne(() => Profile, { lazy: true, nullable: false })
	@JoinColumn()
	profile: Profile;

	@Column(() => Accounts)
	accounts: Accounts;

	@Column({ type: 'enum', enum: UserRole, nullable: false })
	role: UserRole;

	@Column({ type: 'varchar', nullable: true })
	accessToken?: string;

	@Column({ type: 'varchar', nullable: true })
	refreshToken?: string;
}
