import { Injectable } from '@nestjs/common';
import { BaseService } from '@base/base.service';
import { Document } from '@document/entities/document.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DocumentService extends BaseService<Document> {
	constructor(
		@InjectRepository(Document)
		protected readonly repository: Repository<Document>,
	) {
		super(repository, Document.name);
	}

	// TODO: override all methods (make sure to log activity) and rewrite logic of only necessary methods. DON'T FORGET TO LOG.
}
