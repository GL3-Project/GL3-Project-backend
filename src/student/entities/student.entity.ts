import { BaseEntity } from '@base/entities/base.entity';
import { IStudent } from '@student/interfaces/template.interface';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'student' })
export class Student extends BaseEntity implements IStudent {
	@Column({ type: 'varchar', length: 255, nullable: false })
	firstname: string;

	// TODO: complete entity. Take your time with decorator options.
}
