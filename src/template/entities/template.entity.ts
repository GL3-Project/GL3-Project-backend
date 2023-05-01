import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@base/entities/base.entity';
import { ITemplate } from '@template/interfaces/template.interface';

@Entity({ name: 'template' })
export class Template extends BaseEntity implements ITemplate {
	@Column({ type: 'string' })
	name: string;

	// TODO: complete entity. Take your time with decorator options.
}
