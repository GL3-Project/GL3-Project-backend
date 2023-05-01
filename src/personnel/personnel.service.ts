import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Personnel } from '@personnel/entities/personnel.entity';
import { Repository } from 'typeorm';
import { BaseService } from '@base/base.service';

@Injectable()
export class PersonnelService extends BaseService<Personnel> {
	constructor(
		@InjectRepository(Personnel)
		protected readonly repository: Repository<Personnel>,
	) {
		super(repository, Personnel.name);
	}

	// TODO: override all methods (make sure to log activity) and rewrite logic of only necessary methods. DON'T FORGET TO LOG.
}
