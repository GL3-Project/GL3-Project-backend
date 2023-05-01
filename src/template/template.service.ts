import { Injectable } from '@nestjs/common';
import { BaseService } from '@base/base.service';
import { Template } from '@template/entities/template.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TemplateService extends BaseService<Template> {
	constructor(
		@InjectRepository(Template)
		protected readonly repository: Repository<Template>,
	) {
		super(repository, Template.name);
	}

	// TODO: override all methods (make sure to log activity) and rewrite logic of only necessary methods. DON'T FORGET TO LOG.
}
