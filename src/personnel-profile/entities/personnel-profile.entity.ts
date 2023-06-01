import { Column, Entity } from 'typeorm';
import { IPersonnelProfile } from '@personnel-profile/interfaces/personnel-profile.interface';
import { Profile } from '@user/entities/profile.entity';

@Entity({ name: 'personnel_profile' })
export class PersonnelProfile extends Profile implements IPersonnelProfile {
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

	name(): string {
		return this.firstName + ' ' + this.lastName;
	}
}
