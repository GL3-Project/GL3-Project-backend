import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
} from '@nestjs/common';
import { StudentProfileService } from './student-profile.service';
import { CreateStudentProfileDto } from './dto/create-student-profile.dto';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';
import { StudentProfile } from '@student-profile/entities/student-profile.entity';

@Controller('student')
export class StudentProfileController {
	constructor(private readonly studentService: StudentProfileService) {}

	@Post()
	async create(@Body() createStudentDto: CreateStudentProfileDto) {
		return this.studentService.create(createStudentDto);
	}

	@Get()
	async findAll() {
		return 'This is the student-profile controller.';
	}

	@Get(':id')
	async findOne(@Param('id') id: StudentProfile['id']) {
		return this.studentService.findOne(id);
	}

	@Patch(':id')
	async update(
		@Param('id') id: StudentProfile['id'],
		@Body() updateStudentDto: UpdateStudentProfileDto,
	) {
		const student = await this.studentService.findOne(id);
		return this.studentService.update(student, updateStudentDto);
	}

	@Delete(':id')
	async remove(@Param('id') id: StudentProfile['id']) {
		return this.studentService.remove(id);
	}

	// TODO: add restore. Change paths accordingly.
}
