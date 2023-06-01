import { IStudentProfile } from '@student-profile/interfaces/student-profile.interface';
import { Column, Entity } from 'typeorm';
import { Socials } from '@user/entities/socials.entity';
import { Profile } from '@user/entities/profile.entity';

@Entity({ name: 'student_profile' })
export class StudentProfile extends Profile implements IStudentProfile {
	@Column({ type: 'varchar', nullable: false })
	address: string;

	@Column({ type: 'timestamp', nullable: false })
	birthDate: Date;

	@Column({ type: 'varchar', length: 8, nullable: false })
	cin: string;

	@Column({ type: 'varchar', nullable: false })
	firstName: string;

	@Column({ type: 'varchar', nullable: false })
	lastName: string;

	@Column(() => Socials)
	socials: Socials;

	name(): string {
		return this.firstName + ' ' + this.lastName;
	}
}
