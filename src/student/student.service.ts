import { Injectable } from '@nestjs/common';
import { BaseService } from '@base/base.service';
import { StudentProfile } from '@student/entities/student.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class StudentService extends BaseService<StudentProfile> {
	constructor(
		@InjectRepository(StudentProfile)
		protected readonly repository: Repository<StudentProfile>,
	) {
		super(repository, StudentProfile.name);
	}

	// TODO: override all methods (make sure to log activity) and rewrite logic of only necessary methods. DON'T FORGET TO LOG.
}
