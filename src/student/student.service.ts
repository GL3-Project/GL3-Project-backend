import { Injectable } from '@nestjs/common';
import { BaseService } from '@base/base.service';
import { Student } from '@student/entities/student.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class StudentService extends BaseService<Student> {
	constructor(
		@InjectRepository(Student)
		protected readonly repository: Repository<Student>,
	) {
		super(repository, Student.name);
	}

	// TODO: override all methods (make sure to log activity) and rewrite logic of only necessary methods. DON'T FORGET TO LOG.
}