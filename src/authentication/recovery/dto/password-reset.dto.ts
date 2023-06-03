import { IsJWT, IsStrongPassword } from 'class-validator';

export class PasswordResetDto {
  @IsStrongPassword()
  newPassword: string;

  @IsJWT()
  token: string;
}
