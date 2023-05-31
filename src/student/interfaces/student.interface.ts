import { ISocials } from '@user/intefaces/socials.interface';

export interface IStudentProfile {
	firstName: string;
	lastName: string;
	cin: string;
	birthDate?: Date;
	address?: string;
	email: string;
	phone: string;
	socials: ISocials;
}
