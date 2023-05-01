import {
	BaseEntity as BasicEntity,
	CreateDateColumn,
	DeleteDateColumn,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { ICommon } from '@base/interfaces/common.inerface';

export abstract class BaseEntity extends BasicEntity implements ICommon {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@CreateDateColumn({
		name: 'created_at',
		type: 'timestamp',
		update: false,
	})
	createdAt: string;

	@UpdateDateColumn({
		name: 'updated_at',
		type: 'timestamp',
	})
	updatedAt: string;

	@DeleteDateColumn({
		name: 'deleted_at',
		type: 'timestamp',
		insert: false,
		nullable: true,
	})
	deletedAt?: string;
}
