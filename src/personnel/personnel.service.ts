import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PersonnelProfile } from '@personnel/entities/personnel.entity';
import { Repository } from 'typeorm';
import { BaseService } from '@base/base.service';

@Injectable()
export class PersonnelService extends BaseService<PersonnelProfile> {
	constructor(
		@InjectRepository(PersonnelProfile)
		protected readonly repository: Repository<PersonnelProfile>,
	) {
		super(repository, PersonnelProfile.name);
	}

	// TODO: override all methods (make sure to log activity) and rewrite logic of only necessary methods. DON'T FORGET TO LOG.
}
