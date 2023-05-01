import { BaseEntity } from '@base/entities/base.entity';
import { IStudent } from '@student/interfaces/template.interface';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'student' })
export class Student extends BaseEntity implements IStudent {
	@Column({ type: 'string' })
	firstname: string;

	// TODO: complete entity. Take your time with decorator options.
}
