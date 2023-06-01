import { BaseEntity } from '@base/entities/base.entity';
import { IProfile } from '@user/intefaces/user.interface';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'profile' })
export abstract class Profile extends BaseEntity implements IProfile {
	@Column({ type: 'varchar', nullable: false })
	email: string;

	@Column({ type: 'varchar', nullable: false })
	phone: string;

	abstract name(): string;
}
