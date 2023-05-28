import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { Repository } from 'typeorm';
import { Student } from '@student/entities/student.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
	controllers: [StudentController],
	providers: [StudentService, Repository<Student>],
	exports: [StudentService],
	imports: [TypeOrmModule.forFeature([Student])],
})
export class StudentModule {}
