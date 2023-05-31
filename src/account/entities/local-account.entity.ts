import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@base/entities/base.entity';
import { ILocalAccount } from '@account/interfaces/local-account.interface';

@Entity({ name: 'local_account' })
export class LocalAccount extends BaseEntity implements ILocalAccount {
	@Column({ type: 'varchar', nullable: false })
	hashedPassword: string;

	@Column({ type: 'varchar', nullable: false })
	salt: string;
}
