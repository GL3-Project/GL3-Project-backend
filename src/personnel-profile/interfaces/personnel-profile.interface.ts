import { IProfile } from '@user/intefaces/user.interface';

export interface IPersonnelProfile extends IProfile {
	firstName: string;
	lastName: string;
	cin: string;
	birthDate?: Date;
	address?: string;
}
