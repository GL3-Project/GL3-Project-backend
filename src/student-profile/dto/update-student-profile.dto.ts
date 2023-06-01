import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateStudentProfileDto } from './create-student-profile.dto';
import { UpdateSocialsDto } from '@user/dto/update-socials.dto';

export class UpdateStudentProfileDto extends PartialType(
	OmitType(CreateStudentProfileDto, ['socials'] as const),
) {
	socials: UpdateSocialsDto;
}
