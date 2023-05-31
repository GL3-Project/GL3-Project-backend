import { Injectable } from '@nestjs/common';
import { BaseService } from '@base/base.service';
import { LocalAccount } from '@account/entities/local-account.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class LocalAccountService extends BaseService<LocalAccount> {
	constructor(
		@InjectRepository(LocalAccount)
		protected readonly repository: Repository<LocalAccount>,
	) {
		super(repository, LocalAccount.name);
	}

	// TODO: override all methods (make sure to log activity) and rewrite logic of only necessary methods. DON'T FORGET TO LOG.
}
