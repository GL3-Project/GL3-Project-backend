import { IAccount } from '@account/interfaces/account.interface';

export enum UserRole {
	admin = 'admin',
	personnel = 'personnel',
	student = 'student',
}

export enum UserAccount {
	local = 'local',
	google = 'google',
}

export type IAccounts = { [key in UserAccount]?: IAccount };

export interface IProfile {
	email: string;
	phone: string;

	name(): string;
}

export interface IUser {
	profile: IProfile;
	accounts: IAccounts;
	role: UserRole;
	accessToken?: string;
	refreshToken?: string;
}
