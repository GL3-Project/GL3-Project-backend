import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from '@student/entities/student.entity';

@Controller('student')
export class StudentController {
	constructor(private readonly studentService: StudentService) {}

	@Post()
	async create(@Body() createStudentDto: CreateStudentDto) {
		return this.studentService.create(createStudentDto);
	}

	@Get()
	async findAll() {
		return 'This is the student controller.';
	}

	@Get(':id')
	async findOne(@Param('id') id: Student['id']) {
		return this.studentService.findOne(id);
	}

	@Patch(':id')
	async update(
		@Param('id') id: Student['id'],
		@Body() updateStudentDto: UpdateStudentDto,
	) {
		const student = await this.studentService.findOne(id);
		return this.studentService.update(student, updateStudentDto);
	}

	@Delete(':id')
	async remove(@Param('id') id: Student['id']) {
		return this.studentService.remove(id);
	}

	// TODO: add restore. Change paths accordingly.
}
