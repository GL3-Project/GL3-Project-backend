import { PartialType } from '@nestjs/mapped-types';
import { CreateSocialsDto } from '@user/dto/create-socials.dto';

export class UpdateSocialsDto extends PartialType(CreateSocialsDto) {}
