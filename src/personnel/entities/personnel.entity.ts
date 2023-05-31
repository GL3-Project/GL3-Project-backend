import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { IPersonnelProfile } from '@personnel/interfaces/personnel.interface';
import { User } from '@user/entities/user.entity';
import { BaseEntity } from '@base/entities/base.entity';
import { UserAccount } from '@user/intefaces/user.interface';
import { IAccount } from '@account/interfaces/account.interface';
import { ILocalAccount } from '@account/interfaces/local-account.interface';

@Entity({ name: 'personnel' })
export class Personnel extends User<IPersonnelProfile> {
	@OneToOne(() => PersonnelProfile, { eager: true })
	@JoinColumn()
	profile: PersonnelProfile;

	@OneToOne(() => PersonnelAccounts, { eager: true })
	@JoinColumn()
	accounts: PersonnelAccounts;
}

@Entity({ name: 'personnel_profile' })
export class PersonnelProfile extends BaseEntity implements IPersonnelProfile {
	@Column({ type: 'varchar', nullable: false })
	address: string;

	@Column({ type: 'varchar', nullable: false })
	birthDate: Date;

	@Column({ type: 'integer', length: 8, nullable: false })
	cin: string;

	@Column({ type: 'varchar', nullable: false })
	email: string;

	@Column({ type: 'varchar', nullable: false })
	firstName: string;

	@Column({ type: 'varchar', nullable: false })
	lastName: string;

	@Column({ type: 'varchar', nullable: false })
	phone: string;
}

@Entity({ name: 'personnel_accounts' })
export class PersonnelAccounts
	extends BaseEntity
	implements Record<UserAccount, IAccount>
{
	[UserAccount.local]: ILocalAccount;
	[UserAccount.google]: ILocalAccount;
}
