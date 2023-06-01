import { ISocials } from '@user/intefaces/socials.interface';
import { IsString, IsUrl } from 'class-validator';

export class CreateSocialsDto implements ISocials {
	@IsString()
	@IsUrl()
	linkedin: string;

	@IsString()
	@IsUrl()
	github: string;
}
