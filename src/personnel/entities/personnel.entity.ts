import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@base/entities/base.entity';
import { IPersonnel } from '@personnel/interfaces/personnel.interface';

@Entity({ name: 'personnel' })
export class Personnel extends BaseEntity implements IPersonnel {
	@Column({ type: 'string' })
	firstname: string;

	// TODO: complete entity. Take your time with decorator options.
}
