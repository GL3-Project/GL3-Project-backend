import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@base/entities/base.entity';
import { ISocials } from '@user/intefaces/socials.interface';

@Entity({ name: 'socials' })
export class Socials extends BaseEntity implements ISocials {
	@Column({ type: 'varchar', nullable: false })
	github: string;

	@Column({ type: 'varchar', nullable: true })
	linkedin: string;
}
