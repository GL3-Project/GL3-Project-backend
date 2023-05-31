import { IStudentProfile } from '@student/interfaces/student.interface';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from '@user/entities/user.entity';
import { BaseEntity } from '@base/entities/base.entity';
import { Socials } from '@user/entities/socials.entity';
import { IAccount } from '@account/interfaces/account.interface';
import { UserAccount } from '@user/intefaces/user.interface';
import { ILocalAccount } from '@account/interfaces/local-account.interface';

@Entity({ name: 'student' })
export class Student extends User<StudentProfile> {
	@OneToOne(() => StudentProfile, { eager: true })
	@JoinColumn()
	profile: StudentProfile;

	@OneToOne(() => StudentAccounts, { eager: true })
	@JoinColumn()
	accounts: StudentAccounts;
}

@Entity({ name: 'student_profile' })
export class StudentProfile extends BaseEntity implements IStudentProfile {
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

	@OneToOne(() => Socials, { eager: true })
	@JoinColumn()
	socials: Socials;
}

@Entity({ name: 'student_accounts' })
export class StudentAccounts
	extends BaseEntity
	implements Record<UserAccount, IAccount>
{
	[UserAccount.local]: ILocalAccount;
	[UserAccount.google]: ILocalAccount;
}
