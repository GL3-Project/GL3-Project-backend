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

export interface IUser<P> {
	profile: P;
	accounts: Record<UserAccount, IAccount>;
	role: UserRole;
	accessToken?: string;
	refreshToken?: string;
}
