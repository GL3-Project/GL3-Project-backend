import { ISocials } from '@user/intefaces/socials.interface';
import { IProfile } from '@user/intefaces/user.interface';

export interface IStudentProfile extends IProfile {
	firstName: string;
	lastName: string;
	cin: string;
	birthDate?: Date;
	address?: string;
	socials: ISocials;
}
