import { IsJWT } from 'class-validator';

export class RefreshLoginDto {
	@IsJWT()
	access_token: string;

	@IsJWT()
	refresh_token: string;
}
