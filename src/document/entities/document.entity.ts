import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@base/entities/base.entity';
import { IDocument } from '@document/interfaces/document.interface';

@Entity({ name: 'document' })
export class Document extends BaseEntity implements IDocument {
	@Column({ type: 'string' })
	name: string;

	// TODO: complete entity. Take your time with decorator options.
}
