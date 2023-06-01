import {
	IsDefined,
	IsEnum,
	registerDecorator,
	validate,
	ValidationArguments,
	ValidationOptions,
} from 'class-validator';
import { IProfile, UserRole } from '@user/intefaces/user.interface';
import { StudentProfile } from '@student-profile/entities/student-profile.entity';
import { PersonnelProfile } from '@personnel-profile/entities/personnel-profile.entity';
import { plainToInstance } from 'class-transformer';
import { LocalSignupDto } from '@authentication/dto/local-signup.dto';

export class SignupDto {
	@IsEnum(UserRole)
	role: UserRole;

	@IsDefined()
	@ValidateProfile()
	profile: IProfile;
}

function ValidateProfile(validationOptions?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			name: 'validateProfile',
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			validator: {
				validate(value: any, args: ValidationArguments) {
					const dto = args.object as LocalSignupDto;
					dto.profile = value;

					let profileClass: any;

					switch (dto.role) {
						case 'student':
							profileClass = StudentProfile;
							break;
						case 'personnel':
							profileClass = PersonnelProfile;
							break;
						default:
							// todo: Handle invalid role
							break;
					}

					if (profileClass) {
						dto.profile = plainToInstance(profileClass, dto.profile);
					}

					// Validate the local signup DTO
					return validate(dto)
						.then((errors) => {
							return errors.length === 0;
						})
						.catch(() => {
							return false;
						});
				},
			},
		});
	};
}
