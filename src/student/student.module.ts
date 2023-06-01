import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { Repository } from 'typeorm';
import { StudentProfile } from '@student/entities/student.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
	controllers: [StudentController],
	providers: [StudentService, Repository<StudentProfile>],
	exports: [StudentService],
	imports: [TypeOrmModule.forFeature([StudentProfile])],
})
export class StudentModule {}
