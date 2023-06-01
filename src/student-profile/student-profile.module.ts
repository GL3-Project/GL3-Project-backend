import { Module } from '@nestjs/common';
import { StudentProfileService } from './student-profile.service';
import { StudentProfileController } from './student-profile.controller';
import { Repository } from 'typeorm';
import { StudentProfile } from '@student-profile/entities/student-profile.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
	controllers: [StudentProfileController],
	providers: [StudentProfileService, Repository<StudentProfile>],
	exports: [StudentProfileService],
	imports: [TypeOrmModule.forFeature([StudentProfile])],
})
export class StudentProfileModule {}
