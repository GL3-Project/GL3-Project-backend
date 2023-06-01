import { PartialType } from '@nestjs/mapped-types';
import { CreatePersonnelProfileDto } from './create-personnel-profile.dto';

export class UpdatePersonnelProfileDto extends PartialType(
	CreatePersonnelProfileDto,
) {}
